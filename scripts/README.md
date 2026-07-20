# Scripts

## Google Scholar citations

Refresh `_data/citations.json` (profile stats, per-paper counts, citing works, leaderboard):

```bash
python3 -m venv .venv-scholar
.venv-scholar/bin/pip install -r scripts/requirements-scholar.txt
.venv-scholar/bin/python -m playwright install chromium
.venv-scholar/bin/python scripts/update_scholar_citations.py          # visible browser (CAPTCHA-friendly)
.venv-scholar/bin/python scripts/update_scholar_citations.py --headless
```

Options:

- `--delay 2.5` — slower page loads (helps against rate limits)
- `--no-merge` — do not union with existing citing-paper lists
- `--dry-run` — print JSON to stdout

### Scheduled refresh (polsci server)

The weekly refresh runs on the polsci server, not on GitHub Actions — Scholar
CAPTCHA-blocks GitHub's datacenter IPs, while the university IP passes cleanly.

Setup on polsci (`~/scholar-updater/`):

- `venv/` — Python venv with Playwright + Chromium headless shell
- `site/` — clone of this repo, pushed via a repo-scoped **deploy key**
  (`~/.ssh/id_ed25519_ghdeploy`, write access to this repository only)
- `update-citations.sh` — fetch/reset to origin/master, scrape, commit + push
  only if `_data/citations.json` changed
- cron: Mondays 06:15 (server time), logs to `~/scholar-updater/cron.log`

The GitHub Action (`.github/workflows/update-scholar-citations.yml`) remains as
a manual fallback (`workflow_dispatch` only) and will usually fail with a
CAPTCHA. Merge-on-truncate keeps previous citing-paper lists if a scrape is
partial.
