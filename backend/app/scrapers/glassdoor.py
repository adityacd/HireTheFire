import logging
from typing import Optional
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from .base import JobListing

logger = logging.getLogger(__name__)

SEARCH_URL = "https://www.glassdoor.com/Job/jobs.htm"


class GlassdoorScraper:
    source = "glassdoor"

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    async def scrape(self, title: str, location: str, experience_level: Optional[str] = None) -> list[JobListing]:
        listings: list[JobListing] = []
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36"
                    ),
                    locale="en-US",
                )
                page = await context.new_page()

                params = f"sc.keyword={title}&locKeyword={location}&fromAge=3&sortBy=date_desc"
                await page.goto(f"{SEARCH_URL}?{params}", wait_until="domcontentloaded", timeout=30000)

                # Wait for job cards to appear
                try:
                    await page.wait_for_selector(
                        "li[data-test='jobListing'], article.JobCard, li.react-job-listing",
                        timeout=10000,
                    )
                except PlaywrightTimeout:
                    logger.warning("Glassdoor: job cards did not appear (possible CAPTCHA or layout change)")
                    await browser.close()
                    return []

                cards = await page.query_selector_all(
                    "li[data-test='jobListing'], article.JobCard, li.react-job-listing"
                )

                for card in cards:
                    try:
                        title_el = await card.query_selector(
                            "a[data-test='job-title'], span[data-test='job-title'], div.job-title"
                        )
                        company_el = await card.query_selector(
                            "div.employer-name, span.employer-name, "
                            "a[data-test='employer-name'], div[data-test='emp-name'], "
                            "span.EmployerProfile_compactEmployerName__9MGcV"
                        )
                        location_el = await card.query_selector(
                            "span[data-test='emp-location'], div.location, span.location"
                        )
                        date_el = await card.query_selector(
                            "div[data-test='job-age'], span.listing-age, div.listing-age"
                        )
                        link_el = await card.query_selector("a[data-test='job-title'], a.jobLink")

                        if not title_el or not company_el:
                            continue

                        job_title = (await title_el.inner_text()).strip()
                        company = (await company_el.inner_text()).strip()
                        location_str = (await location_el.inner_text()).strip() if location_el else "Remote"
                        date_posted = (await date_el.inner_text()).strip() if date_el else "Recent"
                        href = await link_el.get_attribute("href") if link_el else ""
                        url = f"https://www.glassdoor.com{href}" if href and href.startswith("/") else (href or "")

                        listings.append(JobListing(
                            title=job_title,
                            company=company,
                            location=location_str,
                            date_posted=date_posted,
                            url=url,
                            source=self.source,
                            experience_level=experience_level,
                        ))
                    except Exception as e:
                        logger.debug(f"Failed to parse Glassdoor card: {e}")
                        continue

                await browser.close()
        except Exception as e:
            logger.error(f"Glassdoor scrape failed: {e}")

        return listings
