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

A scheduled GitHub Action (`.github/workflows/update-scholar-citations.yml`) runs Mondays and can also be triggered manually. Scholar often blocks datacenter IPs; when that happens the job fails without overwriting data. Local merges keep previous citing-paper lists if a scrape is truncated.
