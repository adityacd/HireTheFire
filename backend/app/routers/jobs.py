import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
import aiosqlite

from ..database import get_db
from ..models import JobOut, JobStatusUpdate, ScrapeRequest, ScrapeResult, CompatibilityScoreOut
from ..services.cover_letter_service import score_compatibility
from ..scrapers.indeed import IndeedScraper
from ..scrapers.linkedin import LinkedInScraper
from ..scrapers.glassdoor import GlassdoorScraper

router = APIRouter(prefix="/jobs", tags=["jobs"])
logger = logging.getLogger(__name__)

VALID_STATUSES = {"new", "interested", "applied", "skip"}


@router.get("", response_model=list[JobOut])
async def list_jobs(
    title: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    db: aiosqlite.Connection = Depends(get_db),
):
    query = "SELECT * FROM jobs WHERE 1=1"
    params: list = []

    if title:
        query += " AND LOWER(title) LIKE ?"
        params.append(f"%{title.lower()}%")
    if location:
        query += " AND LOWER(location) LIKE ?"
        params.append(f"%{location.lower()}%")
    if status:
        query += " AND status = ?"
        params.append(status)
    if source:
        query += " AND source = ?"
        params.append(source)
    if experience_level:
        query += " AND experience_level = ?"
        params.append(experience_level)

    query += " ORDER BY created_at DESC"

    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()

    return [dict(row) for row in rows]


@router.post("/scrape", response_model=ScrapeResult)
async def scrape_jobs(
    req: ScrapeRequest,
    db: aiosqlite.Connection = Depends(get_db),
):
    errors: list[str] = []
    all_listings = []

    scrapers = [IndeedScraper(), LinkedInScraper(), GlassdoorScraper()]

    async def run_scraper(scraper):
        async with scraper:
            try:
                return await scraper.scrape(req.title, req.location, req.experience_level)
            except Exception as e:
                errors.append(f"{scraper.source}: {str(e)}")
                return []

    results = await asyncio.gather(*[run_scraper(s) for s in scrapers])
    for result in results:
        all_listings.extend(result)

    added = 0
    duplicates = 0

    for job in all_listings:
        try:
            await db.execute(
                """INSERT INTO jobs
                   (dedup_hash, title, company, location, date_posted, url, source, status, experience_level, description)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
                   ON CONFLICT(dedup_hash) DO NOTHING""",
                (
                    job.dedup_hash,
                    job.title,
                    job.company,
                    job.location,
                    job.date_posted,
                    job.url,
                    job.source,
                    job.experience_level,
                    job.description,
                ),
            )
            if db.total_changes > 0:
                added += 1
            else:
                duplicates += 1
        except Exception as e:
            logger.error(f"DB insert error: {e}")
            errors.append(str(e))

    await db.commit()
    return ScrapeResult(added=added, duplicates=duplicates, errors=errors)


@router.patch("/{job_id}/status", response_model=JobOut)
async def update_status(
    job_id: int,
    body: JobStatusUpdate,
    db: aiosqlite.Connection = Depends(get_db),
):
    if body.status not in VALID_STATUSES:
        raise HTTPException(400, f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")

    await db.execute("UPDATE jobs SET status = ? WHERE id = ?", (body.status, job_id))
    await db.commit()

    async with db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)) as cursor:
        row = await cursor.fetchone()

    if not row:
        raise HTTPException(404, "Job not found")

    return dict(row)


@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: int, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)) as cursor:
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "Job not found")
    return dict(row)


@router.post("/{job_id}/score", response_model=CompatibilityScoreOut)
async def score_job(job_id: int, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)) as cursor:
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "Job not found")

    job = dict(row)
    try:
        result = await score_compatibility(
            job_title=job["title"],
            company=job["company"],
            job_description=job.get("description") or "",
        )
    except Exception as e:
        raise HTTPException(500, f"Scoring failed: {e}")

    await db.execute(
        "UPDATE jobs SET compatibility_score = ?, compatibility_reasoning = ? WHERE id = ?",
        (result["score"], result["reasoning"], job_id),
    )
    await db.commit()

    return CompatibilityScoreOut(
        compatibility_score=result["score"],
        compatibility_reasoning=result["reasoning"],
    )
