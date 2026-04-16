import logging
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from ..database import get_db
from ..models import CoverLetterOut, ResumeUpdate
from ..services.cover_letter_service import (
    generate_cover_letter,
    get_resume,
    update_resume,
)

router = APIRouter(tags=["cover-letters"])
logger = logging.getLogger(__name__)


@router.post("/jobs/{job_id}/cover-letter", response_model=CoverLetterOut)
async def create_cover_letter(job_id: int, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)) as cursor:
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "Job not found")

    job = dict(row)

    try:
        content = await generate_cover_letter(
            title=job["title"],
            company=job["company"],
            description=job.get("description") or "",
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error(f"Cover letter generation failed: {e}")
        raise HTTPException(500, "Failed to generate cover letter. Check your ANTHROPIC_API_KEY.")

    await db.execute(
        """INSERT INTO cover_letters (job_id, content)
           VALUES (?, ?)
           ON CONFLICT(job_id) DO UPDATE SET content = excluded.content, created_at = CURRENT_TIMESTAMP""",
        (job_id, content),
    )
    await db.commit()

    async with db.execute(
        "SELECT * FROM cover_letters WHERE job_id = ?", (job_id,)
    ) as cursor:
        cl_row = await cursor.fetchone()

    return dict(cl_row)


@router.get("/jobs/{job_id}/cover-letter", response_model=CoverLetterOut)
async def get_cover_letter(job_id: int, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute(
        "SELECT * FROM cover_letters WHERE job_id = ?", (job_id,)
    ) as cursor:
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "No cover letter found for this job")
    return dict(row)


@router.get("/resume")
async def get_resume_endpoint():
    return {"content": get_resume()}


@router.put("/resume")
async def update_resume_endpoint(body: ResumeUpdate):
    update_resume(body.content)
    return {"message": "Resume updated successfully"}
