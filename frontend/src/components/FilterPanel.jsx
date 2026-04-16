import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { scrapeJobs } from "../api/client";

const STATUSES = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "interested", label: "Interested" },
  { value: "applied", label: "Applied" },
  { value: "skip", label: "Skipped" },
];

const SOURCES = [
  { value: "", label: "All Sources" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "glassdoor", label: "Glassdoor" },
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "Any Level" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
];

export default function FilterPanel({ filters, onChange, onScrapeComplete }) {
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState(null);
  const [scrapeTitle, setScrapeTitle] = useState("");
  const [scrapeLocation, setScrapeLocation] = useState("");
  const [scrapeExp, setScrapeExp] = useState("");

  const handleScrape = async () => {
    if (!scrapeTitle.trim() || !scrapeLocation.trim()) {
      setScrapeMsg({ type: "error", text: "Please enter a job title and location." });
      return;
    }
    setScraping(true);
    setScrapeMsg(null);
    try {
      const result = await scrapeJobs({
        title: scrapeTitle.trim(),
        location: scrapeLocation.trim(),
        experience_level: scrapeExp || null,
      });
      setScrapeMsg({
        type: "success",
        text: `Found ${result.added} new jobs (${result.duplicates} duplicates skipped).${result.errors.length ? " Some sources failed." : ""}`,
      });
      onScrapeComplete();
    } catch (e) {
      setScrapeMsg({ type: "error", text: "Scrape failed. Is the backend running?" });
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      {/* Scrape section */}
      <div>
        <h2 className="font-semibold text-sm text-gray-700 mb-3">Search New Jobs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Job title (e.g. Software Engineer)"
            value={scrapeTitle}
            onChange={(e) => setScrapeTitle(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Location (e.g. San Francisco, CA)"
            value={scrapeLocation}
            onChange={(e) => setScrapeLocation(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <select
            value={scrapeExp}
            onChange={(e) => setScrapeExp(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {scraping ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {scraping ? "Searching…" : "Search Jobs"}
          </button>
        </div>
        {scrapeMsg && (
          <p
            className={`mt-2 text-sm rounded-lg px-3 py-2 ${
              scrapeMsg.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-700"
            }`}
          >
            {scrapeMsg.text}
          </p>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Filter section */}
      <div>
        <h2 className="font-semibold text-sm text-gray-700 mb-3">Filter Results</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Filter by title…"
            value={filters.title || ""}
            onChange={(e) => onChange({ ...filters, title: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
          />
          <input
            type="text"
            placeholder="Filter by location…"
            value={filters.location || ""}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
          />
          <select
            value={filters.status || ""}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filters.source || ""}
            onChange={(e) => onChange({ ...filters, source: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
