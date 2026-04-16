import os
import logging
from pathlib import Path
import anthropic

logger = logging.getLogger(__name__)

RESUME_PATH = Path(__file__).parent.parent.parent / "resume.txt"


def get_resume() -> str:
    if RESUME_PATH.exists():
        return RESUME_PATH.read_text(encoding="utf-8")
    return "No resume found. Please add your resume to backend/resume.txt."


def update_resume(content: str) -> None:
    RESUME_PATH.write_text(content, encoding="utf-8")


async def generate_cover_letter(title: str, company: str, description: str) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set in environment variables.")

    resume = get_resume()

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""You are an expert career coach and cover letter writer.

Write a professional, personalized cover letter for the following job application.

Job Title: {title}
Company: {company}
Job Description:
{description or "No description provided."}

My Resume:
{resume}

Instructions:
- Write a compelling 3-paragraph cover letter (opening, body, closing)
- Reference specific details from the job description
- Highlight relevant experience from the resume
- Keep it concise — under 350 words
- Use a professional but warm tone
- Do NOT include a date, address block, or "Sincerely" signature — just the body paragraphs
- Start directly with "Dear Hiring Manager," or address the company if known"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    return message.content[0].text
