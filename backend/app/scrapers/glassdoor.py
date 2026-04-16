import logging
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseScraper, JobListing

logger = logging.getLogger(__name__)


class GlassdoorScraper(BaseScraper):
    source = "glassdoor"
    BASE_URL = "https://www.glassdoor.com/Job/jobs.htm"

    async def scrape(self, title: str, location: str, experience_level: Optional[str] = None) -> list[JobListing]:
        jobs: list[JobListing] = []
        params = {
            "sc.keyword": title,
            "locKeyword": location,
            "fromAge": "3",
            "sortBy": "date_desc",
        }

        try:
            resp = await self.client.get(
                self.BASE_URL,
                params=params,
                headers={
                    **dict(self.client.headers),
                    "Referer": "https://www.glassdoor.com/",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
            )
            resp.raise_for_status()
            jobs = self._parse(resp.text, experience_level)
        except Exception as e:
            logger.error(f"Glassdoor scrape failed: {e}")

        return jobs

    def _parse(self, html: str, experience_level: Optional[str]) -> list[JobListing]:
        soup = BeautifulSoup(html, "lxml")
        listings: list[JobListing] = []

        cards = soup.select("li.react-job-listing, article.JobCard, li[data-test='jobListing']")

        for card in cards:
            try:
                title_el = card.select_one(
                    "a[data-test='job-title'], span[data-test='job-title'], "
                    "div.job-title, a.jobLink"
                )
                company_el = card.select_one(
                    "div.employer-name, span.employer-name, "
                    "a[data-test='employer-name'], div[data-test='emp-name']"
                )
                location_el = card.select_one(
                    "span[data-test='emp-location'], div.location, "
                    "span.location"
                )
                date_el = card.select_one(
                    "div[data-test='job-age'], span.listing-age, div.listing-age"
                )
                link_el = card.select_one("a[data-test='job-title'], a.jobLink")

                if not title_el or not company_el:
                    continue

                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True)
                location = location_el.get_text(strip=True) if location_el else "Remote"
                date_posted = date_el.get_text(strip=True) if date_el else "Recent"
                href = link_el.get("href", "") if link_el else ""
                url = f"https://www.glassdoor.com{href}" if href.startswith("/") else href

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
                logger.debug(f"Failed to parse Glassdoor card: {e}")
                continue

        return listings
