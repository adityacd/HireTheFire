import logging
import xml.etree.ElementTree as ET
from typing import Optional
from .base import BaseScraper, JobListing

logger = logging.getLogger(__name__)

# Indeed's RSS feed is reliable and doesn't require JavaScript rendering.
# fromage=3 means jobs posted in the last 3 days.
RSS_URL = "https://www.indeed.com/rss"


class IndeedScraper(BaseScraper):
    source = "indeed"

    async def scrape(self, title: str, location: str, experience_level: Optional[str] = None) -> list[JobListing]:
        params = {
            "q": title,
            "l": location,
            "fromage": "3",
            "sort": "date",
        }

        try:
            resp = await self.client.get(RSS_URL, params=params)
            resp.raise_for_status()
            return self._parse(resp.text, experience_level)
        except Exception as e:
            logger.error(f"Indeed scrape failed: {e}")
            return []

    def _parse(self, xml_text: str, experience_level: Optional[str]) -> list[JobListing]:
        listings: list[JobListing] = []
        try:
            root = ET.fromstring(xml_text)
        except ET.ParseError as e:
            logger.error(f"Indeed XML parse error: {e}")
            return []

        ns = {"georss": "http://www.georss.org/georss"}

        for item in root.findall(".//item"):
            try:
                raw_title = (item.findtext("title") or "").strip()
                url = (item.findtext("link") or "").strip()
                pub_date = (item.findtext("pubDate") or "Recent").strip()

                # RSS title format: "Job Title - Company Name (Location)"
                # Split on " - " to separate title from company/location
                if " - " in raw_title:
                    job_title, rest = raw_title.split(" - ", 1)
                else:
                    job_title = raw_title
                    rest = ""

                # rest is often "Company (Location)" or just "Company"
                company = rest
                location_str = ""
                if "(" in rest and rest.endswith(")"):
                    company = rest[:rest.rfind("(")].strip()
                    location_str = rest[rest.rfind("(") + 1:-1].strip()

                if not job_title or not company:
                    continue

                listings.append(JobListing(
                    title=job_title.strip(),
                    company=company.strip(),
                    location=location_str or "See listing",
                    date_posted=pub_date,
                    url=url,
                    source=self.source,
                    experience_level=experience_level,
                ))
            except Exception as e:
                logger.debug(f"Failed to parse Indeed item: {e}")
                continue

        return listings
