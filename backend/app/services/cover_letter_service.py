import os
import json
import anthropic
from pathlib import Path

RESUME_PATH = Path(__file__).parent.parent.parent / "resume.txt"


def get_resume() -> str:
    if RESUME_PATH.exists():
        return RESUME_PATH.read_text(encoding="utf-8")
    return "No resume found. Please add your resume to backend/resume.txt."


def update_resume(content: str) -> None:
    RESUME_PATH.write_text(content, encoding="utf-8")


async def score_compatibility(job_title: str, company: str, job_description: str) -> dict:
    resume = get_resume()

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    description_section = f"JOB DESCRIPTION:\n{job_description}" if job_description else "JOB DESCRIPTION: Not available — base your analysis on the job title and company alone."

    prompt = f"""You are an expert recruiter and career coach. Analyze how well the candidate's resume matches the job posting.

RESUME:
{resume}

JOB TITLE: {job_title}
COMPANY: {company}
{description_section}

Return ONLY a JSON object with exactly these two fields:
{{
  "score": <integer from 0 to 100 representing compatibility percentage>,
  "reasoning": "<2-3 sentence explanation of the score, highlighting key matches and gaps>"
}}

Be honest and precise. Consider skills, experience level, and requirements."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)
    return {"score": float(result["score"]), "reasoning": result["reasoning"]}
