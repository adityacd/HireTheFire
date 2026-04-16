import logging
from typing import Optional
from urllib.parse import urlencode, quote_plus
from bs4 import BeautifulSoup
from .base import BaseScraper, JobListing

logger = logging.getLogger(__name__)

EXPERIENCE_MAP = {
    "entry": "entry_level",
    "mid": "mid_level",
    "senior": "senior_level",
}


class IndeedScraper(BaseScraper):
    source = "indeed"
    BASE_URL = "https://www.indeed.com/jobs"

    async def scrape(self, title: str, location: str, experience_level: Optional[str] = None) -> list[JobListing]:
        jobs: list[JobListing] = []
        params = {
            "q": title,
            "l": location,
            "fromage": "3",
            "sort": "date",
        }
        if experience_level and experience_level in EXPERIENCE_MAP:
            params["explvl"] = EXPERIENCE_MAP[experience_level]

        try:
            resp = await self.client.get(self.BASE_URL, params=params)
            resp.raise_for_status()
            jobs = self._parse(resp.text, experience_level)
        except Exception as e:
            logger.error(f"Indeed scrape failed: {e}")

        return jobs

    def _parse(self, html: str, experience_level: Optional[str]) -> list[JobListing]:
        soup = BeautifulSoup(html, "lxml")
        listings: list[JobListing] = []

        cards = soup.select("div.job_seen_beacon, div[data-testid='jobsearch-ResultsList'] > li")

        for card in cards:
            try:
                title_el = card.select_one("h2.jobTitle span, a.jcs-JobTitle span")
                company_el = card.select_one("[data-testid='company-name'], span.companyName")
                location_el = card.select_one("[data-testid='text-location'], div.companyLocation")
                date_el = card.select_one("[data-testid='myJobsStateDate'], span.date")
                link_el = card.select_one("h2.jobTitle a, a.jcs-JobTitle")

                if not title_el or not company_el:
                    continue

                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True)
                location = location_el.get_text(strip=True) if location_el else "Remote"
                date_posted = date_el.get_text(strip=True) if date_el else "Recent"
                href = link_el.get("href", "") if link_el else ""
                url = f"https://www.indeed.com{href}" if href.startswith("/") else href

                listings.append(JobListing(
                    title=title,
                    company=company,
                    location=location,
                    date_posted=date_posted,
                    url=url,
                    source=self.source,
                    experience_level=experience_level,
                ))
            except Exception as e:
                logger.debug(f"Failed to parse Indeed card: {e}")
                continue

        return listings
