import logging
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseScraper, JobListing

logger = logging.getLogger(__name__)

# f_TPR=r259200 → posted in last 3 days (259200 seconds)
# f_E: 1=Internship, 2=Entry level, 3=Associate, 4=Mid-Senior, 5=Director, 6=Executive
EXPERIENCE_MAP = {
    "entry": "2",
    "mid": "4",
    "senior": "4,5",
}


class LinkedInScraper(BaseScraper):
    source = "linkedin"
    BASE_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"

    async def scrape(self, title: str, location: str, experience_level: Optional[str] = None) -> list[JobListing]:
        jobs: list[JobListing] = []
        params = {
            "keywords": title,
            "location": location,
            "f_TPR": "r259200",
            "sortBy": "DD",
            "start": "0",
        }
        if experience_level and experience_level in EXPERIENCE_MAP:
            params["f_E"] = EXPERIENCE_MAP[experience_level]

        try:
            resp = await self.client.get(
                self.BASE_URL,
                params=params,
                headers={
                    **self.client.headers,
                    "Referer": "https://www.linkedin.com/jobs/search/",
                },
            )
            resp.raise_for_status()
            jobs = self._parse(resp.text, experience_level)
        except Exception as e:
            logger.error(f"LinkedIn scrape failed: {e}")

        return jobs

    def _parse(self, html: str, experience_level: Optional[str]) -> list[JobListing]:
        soup = BeautifulSoup(html, "lxml")
        listings: list[JobListing] = []

        cards = soup.select("li")

        for card in cards:
            try:
                title_el = card.select_one("h3.base-search-card__title, span.sr-only")
                company_el = card.select_one("h4.base-search-card__subtitle a, a.hidden-nested-link")
                location_el = card.select_one("span.job-search-card__location")
                date_el = card.select_one("time")
                link_el = card.select_one("a.base-card__full-link, a[href*='/jobs/view/']")

                if not title_el or not company_el:
                    continue

                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True)
                location = location_el.get_text(strip=True) if location_el else "Remote"
                date_posted = date_el.get("datetime", date_el.get_text(strip=True)) if date_el else "Recent"
                url = link_el.get("href", "").split("?")[0] if link_el else ""

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
                logger.debug(f"Failed to parse LinkedIn card: {e}")
                continue

        return listings
