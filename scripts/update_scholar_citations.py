#!/usr/bin/env python3
"""
Fetch Google Scholar citation data (profile counts, citing papers, author leaderboard)
and write _data/citations.json for the Jekyll site.

Uses Playwright with a visible browser by default so you can solve CAPTCHAs if needed.
Run from the repo root:

    .venv-scholar/bin/python scripts/update_scholar_citations.py

Options:
    --headless          Run without opening a browser window
    --scholar-user ID   Google Scholar user id (default: from _config.yml)
    --dry-run           Print JSON to stdout instead of writing the file
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import unicodedata
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLICATIONS_DIR = ROOT / "_data" / "publications"
OUTPUT_PATH = ROOT / "_data" / "citations.json"
EXTRACT_JS = (Path(__file__).parent / "scholar_browser_extract.js").read_text(encoding="utf-8")

PROFILE_EXTRACT = EXTRACT_JS + "\nJSON.stringify(scholarExtract.extractProfileArticles());"
CITING_EXTRACT = EXTRACT_JS + "\nJSON.stringify(scholarExtract.extractCitingWorks());"


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


def scrape_scholar(user_id: str, headless: bool) -> dict:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        print(
            "Playwright is required. Create the venv and install:\n"
            "  python3 -m venv .venv-scholar\n"
            "  .venv-scholar/bin/pip install playwright\n"
            "  .venv-scholar/bin/python -m playwright install chromium",
            file=sys.stderr,
        )
        raise SystemExit(1) from exc

    pub_map = load_publication_keys()
    profile_url = f"https://scholar.google.com/citations?user={user_id}&hl=en&view_op=list_works"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless, slow_mo=80 if not headless else 0)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            locale="en-US",
        )
        page = context.new_page()
        page.goto(profile_url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_selector(".gsc_a_at", timeout=60000)
        page.wait_for_selector("a.gsc_a_ac", timeout=60000)
        time.sleep(2)

        raw_profile = page.evaluate(PROFILE_EXTRACT)
        profile_data = json.loads(raw_profile)
        articles = profile_data.get("articles", [])

        by_publication: dict[str, dict] = {}
        for article in articles:
            pub_key = match_publication_key(article.get("title", ""), pub_map)
            cites_url = article.get("cited_by_url")
            count = article.get("cited_by_count", 0)
            citing_works: list[dict] = []

            if cites_url and count > 0:
                start = 0
                while start < count:
                    sep = "&" if "?" in cites_url else "?"
                    page_url = f"{cites_url}{sep}start={start}"
                    page.goto(page_url, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_selector(".gs_ri, #gs_res_ccl", timeout=30000)
                    time.sleep(1.2)
                    batch = json.loads(page.evaluate(CITING_EXTRACT))
                    if not batch:
                        break
                    citing_works.extend(batch)
                    if len(batch) < 10:
                        break
                    start += 10

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

        browser.close()

    out = {
        "updated_at": date.today().isoformat(),
        "source": "google_scholar",
        "scholar_profile_url": f"https://scholar.google.com/citations?user={user_id}",
        "profile": profile_data.get("profile", {}),
        "by_publication": by_publication,
        "citing_author_leaderboard": build_leaderboard(by_publication),
    }
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Update _data/citations.json from Google Scholar")
    parser.add_argument("--headless", action="store_true", help="Run browser headless")
    parser.add_argument("--scholar-user", default=read_default_scholar_user())
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print(f"Fetching Scholar profile {args.scholar_user} …", file=sys.stderr)
    data = scrape_scholar(args.scholar_user, headless=args.headless)
    payload = json.dumps(data, indent=2, ensure_ascii=False) + "\n"

    if args.dry_run:
        print(payload)
        return

    OUTPUT_PATH.write_text(payload, encoding="utf-8")
    total = data.get("profile", {}).get("total_citations", "?")
    n_pubs = len(data.get("by_publication", {}))
    print(f"Wrote {OUTPUT_PATH} ({n_pubs} works, {total} total citations)", file=sys.stderr)


if __name__ == "__main__":
    main()
