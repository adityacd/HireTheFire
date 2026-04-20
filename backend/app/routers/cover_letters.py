from fastapi import APIRouter
from ..models import ResumeUpdate
from ..services.cover_letter_service import get_resume, update_resume

router = APIRouter(tags=["resume"])


@router.get("/resume")
async def get_resume_endpoint():
    return {"content": get_resume()}


@router.put("/resume")
async def update_resume_endpoint(body: ResumeUpdate):
    update_resume(body.content)
    return {"message": "Resume updated successfully"}
