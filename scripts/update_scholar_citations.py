#!/usr/bin/env python3
"""
Fetch Google Scholar citation data (profile counts, citing papers, author leaderboard)
and write _data/citations.json for the Jekyll site.

Uses ordinary HTTP. Headless Chromium is served a CAPTCHA from the same IP
that still returns these pages to a normal request.

Run from the repo root:

    python3 scripts/update_scholar_citations.py
    python3 scripts/update_scholar_citations.py --delay 2.5

Options:
    --scholar-user ID   Google Scholar user id (default: from _config.yml)
    --dry-run           Print JSON to stdout instead of writing the file
    --delay SECONDS     Pause between requests (default: 1.8)
"""

from __future__ import annotations

import argparse
import html as html_lib
import http.cookiejar
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLICATIONS_DIR = ROOT / "_data" / "publications"
OUTPUT_PATH = ROOT / "_data" / "citations.json"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


def read_default_scholar_user() -> str:
    config = ROOT / "_config.yml"
    if not config.exists():
        return "MMcwTuIAAAAJ"
    text = config.read_text(encoding="utf-8")
    m = re.search(r"googlescholar\s*:\s*\"[^\"]*user=([^\"&]+)", text)
    return m.group(1) if m else "MMcwTuIAAAAJ"


def normalize_title(title: str) -> str:
    t = unicodedata.normalize("NFKD", title.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def load_publication_keys() -> dict[str, str]:
    """Map normalized title -> publication json stem (without .json)."""
    mapping: dict[str, str] = {}
    for path in sorted(PUBLICATIONS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        title = data.get("title", "")
        if title:
            mapping[normalize_title(title)] = path.stem
    return mapping


# Scholar profile titles that differ from the site publication title
SCHOLAR_TITLE_ALIASES: dict[str, str] = {
    "how nuclear power hurts the greens evidence from german nuclear power plants": (
        "03_buying-voter-support_nuclear_jelst_2025"
    ),
}


def match_publication_key(title: str, pub_map: dict[str, str]) -> str | None:
    norm = normalize_title(title)
    if norm in SCHOLAR_TITLE_ALIASES:
        return SCHOLAR_TITLE_ALIASES[norm]
    if norm in pub_map:
        return pub_map[norm]
    # Fuzzy: prefix / substring match for Scholar title variants
    for pub_norm, key in pub_map.items():
        if norm.startswith(pub_norm[:40]) or pub_norm.startswith(norm[:40]):
            return key
        if norm in pub_norm or pub_norm in norm:
            return key
    return None


def build_leaderboard(by_publication: dict) -> list[dict]:
    """Count author appearances across citing works (once per cited publication)."""
    authors: dict[str, dict] = defaultdict(lambda: {"count": 0, "scholar_url": None, "name": ""})
    for pub in by_publication.values():
        for work in pub.get("citing_works", []):
            for author in work.get("authors", []):
                name = (author.get("name") or "").strip()
                if not name:
                    continue
                key = name.lower()
                authors[key]["name"] = name
                authors[key]["count"] += 1
                url = author.get("scholar_url")
                if url and not authors[key]["scholar_url"]:
                    authors[key]["scholar_url"] = url
    leaderboard = [
        {"name": v["name"], "scholar_url": v["scholar_url"], "count": v["count"]}
        for v in authors.values()
        if v["count"]
    ]
    leaderboard.sort(key=lambda x: (-x["count"], x["name"]))
    return leaderboard


def _work_key(work: dict) -> str:
    url = (work.get("url") or "").strip().lower()
    if url:
        return "url:" + url
    return "title:" + normalize_title(work.get("title") or "")


def merge_citing_works(new_works: list, old_works: list) -> list:
    """Union citing works; prefer newer metadata when the same paper appears twice."""
    merged: dict[str, dict] = {}
    for work in old_works or []:
        if isinstance(work, dict) and work.get("title"):
            merged[_work_key(work)] = work
    for work in new_works or []:
        if isinstance(work, dict) and work.get("title"):
            merged[_work_key(work)] = work
    return list(merged.values())


def merge_with_previous(new_data: dict, old_data: dict | None) -> dict:
    """Keep previous citing-paper lists when a scrape is truncated (CAPTCHA / rate limit)."""
    if not old_data:
        return new_data
    old_by = old_data.get("by_publication") or {}
    new_by = new_data.get("by_publication") or {}
    for key, entry in new_by.items():
        old_entry = old_by.get(key)
        if not old_entry:
            continue
        old_works = old_entry.get("citing_works") or []
        new_works = entry.get("citing_works") or []
        if len(new_works) < len(old_works):
            print(
                f"  merge: {key}: scraped {len(new_works)} citing works, "
                f"keeping union with previous {len(old_works)}",
                file=sys.stderr,
            )
            entry["citing_works"] = merge_citing_works(new_works, old_works)
        else:
            entry["citing_works"] = merge_citing_works(new_works, old_works)
    # Preserve publications that vanished from this scrape (rare matching glitch)
    for key, old_entry in old_by.items():
        if key not in new_by:
            print(f"  merge: keeping previous publication missing from scrape: {key}", file=sys.stderr)
            new_by[key] = old_entry
    new_data["by_publication"] = new_by
    new_data["citing_author_leaderboard"] = build_leaderboard(new_by)
    return new_data


def _text(fragment: str) -> str:
    no_tags = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html_lib.unescape(no_tags)).strip()


def _abs_scholar(href: str | None) -> str | None:
    if not href:
        return None
    href = html_lib.unescape(href).strip()
    if href.startswith("http://") or href.startswith("https://"):
        return href
    if href.startswith("/"):
        return "https://scholar.google.com" + href
    return href


def _blocked(body: str, url: str) -> bool:
    low = html_lib.unescape(body).lower()
    if "/sorry/" in url.lower() or "unusual traffic" in low or "not a robot" in low:
        return True
    if "javascript is turned off" in low or "enable javascript" in low:
        return True
    return False


class ScholarHttp:
    """Polite Scholar fetch. A cookie jar keeps the session across pages."""

    def __init__(self, delay: float):
        self.delay = max(delay, 0.5)
        self._next_ok = 0.0
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())
        )

    def get(self, url: str) -> str:
        wait = self._next_ok - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        last_error: Exception | None = None
        for attempt in range(5):
            req = urllib.request.Request(url, headers=headers)
            try:
                with self.opener.open(req, timeout=60) as resp:
                    body = resp.read().decode("utf-8", "replace")
                    final = resp.geturl()
            except urllib.error.HTTPError as exc:
                last_error = exc
                if exc.code == 429 and attempt < 4:
                    time.sleep(self.delay * (2 + attempt))
                    continue
                raise
            self._next_ok = time.monotonic() + self.delay
            if _blocked(body, final):
                raise RuntimeError(
                    "Google Scholar blocked the request (CAPTCHA / unusual traffic)."
                )
            return body
        raise last_error or RuntimeError("Scholar request failed")


def parse_profile(body: str) -> dict:
    cells = [int(n) for n in re.findall(r'class="gsc_rsb_std">(\d+)</td>', body)]
    profile = {"total_citations": None, "h_index": None, "i10_index": None}
    if len(cells) >= 5:
        profile = {
            "total_citations": cells[0],
            "h_index": cells[2],
            "i10_index": cells[4],
        }
    articles = []
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', body, re.S):
        title_m = re.search(r'<a href="([^"]+)" class="gsc_a_at">(.*?)</a>', row, re.S)
        if not title_m:
            continue
        scholar_url = _abs_scholar(title_m.group(1)) or ""
        cite_m = re.search(
            r'<a href="([^"]+)" class="gsc_a_ac[^"]*">([^<]*)</a>', row
        )
        cited_by_url = _abs_scholar(cite_m.group(1)) if cite_m else None
        cited_by_count = int(cite_m.group(2).strip() or "0") if cite_m else 0
        citation_id = (re.search(r"citation_for_view=([^&]+)", scholar_url) or [None, None])[1]
        cluster = None
        if cited_by_url:
            cluster_m = re.search(r"cites=([0-9]+)", cited_by_url)
            cluster = cluster_m.group(1) if cluster_m else None
        articles.append(
            {
                "title": _text(title_m.group(2)),
                "scholar_url": scholar_url,
                "citation_id": citation_id,
                "cites_cluster_id": cluster,
                "cited_by_url": cited_by_url,
                "cited_by_count": cited_by_count,
            }
        )
    return {"profile": profile, "articles": articles}


def _result_total(body: str) -> int | None:
    block = re.search(r'id="gs_ab_md"[^>]*>(.*?)</div>', body, re.S)
    if not block:
        return None
    match = re.search(r"([\d,]+)\s+results?", _text(block.group(1)))
    if not match:
        return None
    return int(match.group(1).replace(",", ""))


def parse_citing_works(body: str) -> list[dict]:
    container = re.search(r'id="gs_res_ccl_mid">(.*)', body, re.S)
    chunk = container.group(1) if container else body
    works = []
    for part in re.split(r'<div class="gs_ri">', chunk)[1:]:
        head = re.split(r'<div class="gs_fl', part, maxsplit=1)[0]
        h3 = re.search(r'<h3 class="gs_rt"[^>]*>(.*?)</h3>', head, re.S)
        if not h3:
            continue
        link = re.search(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', h3.group(1), re.S)
        if link:
            url = _abs_scholar(link.group(1))
            title = _text(link.group(2))
        else:
            url = None
            title = _text(h3.group(1))
        title = re.sub(r"^\[(?:PDF|HTML|BOOK|CITATION|B)\]\s*", "", title).strip()
        if not title:
            continue
        authors: list[dict] = []
        year = None
        authors_m = re.search(r'<div class="gs_a">(.*?)</div>', head, re.S)
        if authors_m:
            block = authors_m.group(1)
            plain = _text(block)
            years = re.findall(r"\b(?:19|20)\d{2}\b", plain)
            if years:
                year = int(years[-1])
            linked: dict[str, str | None] = {}
            for href, name in re.findall(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', block, re.S):
                href_abs = _abs_scholar(href) or ""
                user = re.search(r"user=([^&]+)", href_abs)
                scholar_url = (
                    f"https://scholar.google.com/citations?user={user.group(1)}"
                    if user
                    else (href_abs if href_abs.startswith("http") else None)
                )
                author_name = _text(name)
                if author_name:
                    linked[author_name] = scholar_url
            author_segment = re.split(r"\s[-–—]\s", plain, maxsplit=1)[0]
            names = [n.strip() for n in author_segment.split(",") if n.strip()]
            if not names:
                names = list(linked)
            for name in names:
                authors.append({"name": name, "scholar_url": linked.get(name)})
        works.append({"title": title, "url": url, "year": year, "authors": authors})
    return works


def _fetch_citing_page(client: ScholarHttp, url: str, title: str) -> str | None:
    """Load one cited-by page, backing off when Scholar asks for JavaScript."""
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            body = client.get(url)
        except RuntimeError as exc:
            last_error = exc
            if attempt == 0:
                time.sleep(15)
                continue
            print(
                f"  warn: blocked while fetching cites for {title!r}; keeping partial list",
                file=sys.stderr,
            )
            print(f"  warn: {exc}", file=sys.stderr)
            return None
        if parse_citing_works(body) or _result_total(body) == 0:
            return body
        if attempt == 0:
            time.sleep(15)
            continue
        return body
    if last_error:
        print(f"  warn: {last_error}", file=sys.stderr)
    return None


def scrape_scholar(user_id: str, delay: float = 1.8) -> dict:
    client = ScholarHttp(delay)
    pub_map = load_publication_keys()
    profile_url = (
        f"https://scholar.google.com/citations?user={user_id}&hl=en&cstart=0&pagesize=100"
    )
    profile_html = client.get(profile_url)
    profile_data = parse_profile(profile_html)
    articles = profile_data.get("articles", [])
    if not articles:
        raise RuntimeError("No articles found on Scholar profile — aborting.")

    by_publication: dict[str, dict] = {}
    for article in articles:
        pub_key = match_publication_key(article.get("title", ""), pub_map)
        cites_url = article.get("cited_by_url")
        count = article.get("cited_by_count", 0)
        citing_works: list[dict] = []

        if cites_url and count > 0:
            start = 0
            reported: int | None = None
            while True:
                sep = "&" if "?" in cites_url else "?"
                page_url = f"{cites_url}{sep}start={start}&num=10"
                page_html = _fetch_citing_page(client, page_url, article.get("title") or "")
                if page_html is None:
                    break
                if reported is None:
                    reported = _result_total(page_html)
                batch = parse_citing_works(page_html)
                if not batch:
                    if start == 0 and count > 0 and not citing_works:
                        print(
                            f"  warn: no citing papers parsed for {article.get('title')!r} "
                            f"(profile count {count})",
                            file=sys.stderr,
                        )
                    break
                citing_works.extend(batch)
                start += len(batch)
                if len(batch) < 10:
                    break
                if reported is not None and start >= reported:
                    break
                if start >= max(count, reported or 0) + 10:
                    break

        entry = {
            "scholar_title": article.get("title"),
            "scholar_url": article.get("scholar_url"),
            "citation_id": article.get("citation_id"),
            "cites_cluster_id": article.get("cites_cluster_id"),
            "cited_by_count": count,
            "cited_by_url": cites_url,
            "citing_works": citing_works,
        }
        key = pub_key or f"scholar:{article.get('citation_id', 'unknown')}"
        by_publication[key] = entry

    return {
        "updated_at": date.today().isoformat(),
        "source": "google_scholar",
        "scholar_profile_url": f"https://scholar.google.com/citations?user={user_id}",
        "profile": profile_data.get("profile", {}),
        "by_publication": by_publication,
        "citing_author_leaderboard": build_leaderboard(by_publication),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Update _data/citations.json from Google Scholar")
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Ignored. Kept so the polsci cron command does not need to change.",
    )
    parser.add_argument("--scholar-user", default=read_default_scholar_user())
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--delay",
        type=float,
        default=1.8,
        help="Seconds to wait between Scholar page loads (default: 1.8)",
    )
    parser.add_argument(
        "--no-merge",
        action="store_true",
        help="Do not merge with the existing citations.json citing-work lists",
    )
    args = parser.parse_args()

    print(f"Fetching Scholar profile {args.scholar_user} …", file=sys.stderr)
    data = scrape_scholar(args.scholar_user, delay=args.delay)

    if not args.no_merge and OUTPUT_PATH.exists():
        try:
            old = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        except Exception:
            old = None
        data = merge_with_previous(data, old)

    payload = json.dumps(data, indent=2, ensure_ascii=False) + "\n"

    if args.dry_run:
        print(payload)
        return

    OUTPUT_PATH.write_text(payload, encoding="utf-8")
    total = data.get("profile", {}).get("total_citations", "?")
    n_pubs = len(data.get("by_publication", {}))
    n_works = sum(len(p.get("citing_works") or []) for p in data.get("by_publication", {}).values())
    print(
        f"Wrote {OUTPUT_PATH} ({n_pubs} works, {total} total citations, "
        f"{n_works} citing papers indexed)",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
