# HireTheFire

A personal job search dashboard. Scrapes LinkedIn, Indeed, and Glassdoor, tracks your applications, and scores each job against your resume using Claude AI.

---

## Features

- Scrapes job listings from LinkedIn, Indeed, and Glassdoor (last 3 days)
- Filters by title, location, source, experience level, and status
- Track jobs as **Interested**, **Applied**, or **Skip**
- **Resume compatibility score** — Claude reads your resume and the job, returns a 0–100% match with reasoning
- Resume editor built into the UI

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/adityacd/HireTheFire.git
cd HireTheFire
```

### 2. Configure environment

```bash
cp .env.example backend/.env
```

Open `backend/.env` and fill in your Anthropic key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

### 4. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 5. Add your resume

Click **My Resume** in the top-right of the app and paste your resume. This is what Claude uses for scoring.

---

## How to use

1. Enter a job title and location in the left panel and click **Search Jobs**
2. Jobs from LinkedIn, Indeed, and Glassdoor appear on the dashboard
3. Click **Score with Resume** on any card to get an AI compatibility score
4. Or click **Score All** at the top to score every job at once
5. Mark jobs as **Interested**, **Applied**, or **Skip** to track your progress
6. Use the filter inputs to narrow results

---

## Notes

- Scraping is inherently fragile. If a platform changes its structure, the scraper in `backend/app/scrapers/` may need updating.
- LinkedIn uses their public guest API (no login required). Indeed uses RSS.
- Scores are stored in the database and persist across sessions.
