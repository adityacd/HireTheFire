from pydantic import BaseModel
from typing import Optional


class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: Optional[str]
    date_posted: Optional[str]
    url: Optional[str]
    source: Optional[str]
    status: str
    experience_level: Optional[str]
    description: Optional[str]
    created_at: str
    compatibility_score: Optional[float] = None
    compatibility_reasoning: Optional[str] = None

    class Config:
        from_attributes = True


class CompatibilityScoreOut(BaseModel):
    compatibility_score: float
    compatibility_reasoning: str


class JobStatusUpdate(BaseModel):
    status: str  # new | interested | applied | skip


class ScrapeRequest(BaseModel):
    title: str
    location: str
    experience_level: Optional[str] = None  # entry | mid | senior


class ResumeUpdate(BaseModel):
    content: str


class ScrapeResult(BaseModel):
    added: int
    duplicates: int
    errors: list[str]
