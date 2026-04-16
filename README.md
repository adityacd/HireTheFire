# HireTheFire — Job Search Assistant

A personal job search dashboard that scrapes LinkedIn, Indeed, and Glassdoor, tracks your applications, and generates AI-powered cover letters using Claude.

---

## Features

- **Job scraping** — pulls listings from LinkedIn, Indeed, and Glassdoor posted in the last 3 days
- **Deduplication** — removes duplicate listings across platforms
- **Filtering** — filter by title, location, source, experience level, and status
- **Status tracking** — mark jobs as Interested, Applied, or Skip
- **AI cover letters** — generate a personalized cover letter for any job using Claude
- **Resume editor** — update your resume in the UI; it's stored as plain text

---

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Backend  | Python · FastAPI · aiosqlite  |
| Frontend | React 18 · Vite · Tailwind CSS|
| Database | SQLite                        |
| AI       | Anthropic Claude API          |

---

## Project Structure

```
HireTheFire/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── database.py           # SQLite init & connection
│   │   ├── models.py             # Pydantic models
│   │   ├── routers/
│   │   │   ├── jobs.py           # Job listing, scraping, status
│   │   │   └── cover_letters.py  # Cover letter generation & resume
│   │   ├── scrapers/
│   │   │   ├── base.py           # Base scraper class
│   │   │   ├── indeed.py
│   │   │   ├── linkedin.py
│   │   │   └── glassdoor.py
│   │   └── services/
│   │       └── cover_letter_service.py  # Claude API integration
│   ├── resume.txt                # Your resume (edit this!)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── CoverLetterModal.jsx
│   │   │   └── StatusBadge.jsx
│   │   └── api/client.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone and configure environment

```bash
cp .env.example .env
```

Open `.env` and set your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### 3. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Add your resume

Edit `backend/resume.txt` with your actual resume content, **or** click **My Resume** in the app header to edit it in the UI.

---

## Usage

1. Enter a job title and location in the **Search New Jobs** panel and click **Search Jobs**.
2. Jobs scraped from LinkedIn, Indeed, and Glassdoor will appear on the dashboard.
3. Click **Interested**, **Applied**, or **Skip** on any job card to track your status.
4. Click **Cover Letter** on any card to generate a personalized cover letter with Claude.
5. Use the filter inputs to narrow down results by title, location, source, or status.

---

## Notes on Scraping

Web scraping is inherently fragile. The scrapers use `httpx` + `BeautifulSoup` with realistic browser headers, but:

- **LinkedIn** uses their public guest jobs API endpoint, which does not require authentication.
- **Indeed** and **Glassdoor** parse their HTML search results pages.
- If a platform updates their HTML structure, the corresponding scraper in `backend/app/scrapers/` may need updating.
- You may encounter rate limiting or CAPTCHAs — reduce scrape frequency if this happens.

---

## API Reference

| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| GET    | `/api/jobs`                      | List jobs (supports filters)    |
| POST   | `/api/jobs/scrape`               | Trigger scraping                |
| PATCH  | `/api/jobs/{id}/status`          | Update job status               |
| GET    | `/api/jobs/{id}/cover-letter`    | Get existing cover letter       |
| POST   | `/api/jobs/{id}/cover-letter`    | Generate cover letter with AI   |
| GET    | `/api/resume`                    | Get resume text                 |
| PUT    | `/api/resume`                    | Update resume text              |
