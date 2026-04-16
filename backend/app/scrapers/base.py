import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import httpx

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}


@dataclass
class JobListing:
    title: str
    company: str
    location: str
    date_posted: str
    url: str
    source: str
    experience_level: Optional[str] = None
    description: Optional[str] = None
    dedup_hash: str = field(init=False)

    def __post_init__(self):
        raw = f"{self.title.lower().strip()}|{self.company.lower().strip()}|{self.location.lower().strip()}"
        self.dedup_hash = hashlib.md5(raw.encode()).hexdigest()


class BaseScraper(ABC):
    source: str = ""

    def __init__(self):
        self.client = httpx.AsyncClient(
            headers=HEADERS,
            follow_redirects=True,
            timeout=30.0,
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.client.aclose()

    @abstractmethod
    async def scrape(self, title: str, location: str, experience_level: Optional[str] = None) -> list[JobListing]:
        pass
