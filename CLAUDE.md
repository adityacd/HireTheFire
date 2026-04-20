# HireTheFire — Claude Guidelines

## Workflow Rules

- **Always work on a feature branch** — never commit directly to `main`. Branch naming: `feat/`, `fix/`, `chore/`, `revert/` prefixes.
- **Always open a PR** after pushing changes — do this automatically without asking.
- **Never ask for Yes/No confirmation** before creating branches, committing, pushing, or opening PRs. Just do it.
- Pull `main` and branch off it at the start of every task.

## Git Commit Style

- Short imperative subject line (e.g. "Add filter panel", "Fix LinkedIn scraper")
- Keep commits focused — one concern per commit

## Tech Stack

- **Backend**: Python · FastAPI · SQLite (aiosqlite) — code lives in `backend/app/`
- **Frontend**: React 18 · Vite · Tailwind CSS — code lives in `frontend/src/`
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`) via `backend/app/services/cover_letter_service.py`
- **Scrapers**: `backend/app/scrapers/` — Indeed (RSS), LinkedIn (guest API), Glassdoor (Playwright)

## Code Style

- Python: async throughout, type hints on all functions
- React: functional components only, no class components
- No unnecessary comments or docstrings on unchanged code
