from pathlib import Path

RESUME_PATH = Path(__file__).parent.parent.parent / "resume.txt"


def get_resume() -> str:
    if RESUME_PATH.exists():
        return RESUME_PATH.read_text(encoding="utf-8")
    return "No resume found. Please add your resume to backend/resume.txt."


def update_resume(content: str) -> None:
    RESUME_PATH.write_text(content, encoding="utf-8")
