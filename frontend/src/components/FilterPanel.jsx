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

const inputClass =
  "w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon focus:shadow-neon-sm transition";

const selectClass =
  "w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon focus:shadow-neon-sm transition";

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
    <div className="bg-dark-card rounded-xl border border-dark-border p-5 space-y-5">
      {/* Search section */}
      <div>
        <h2 className="font-semibold text-xs uppercase tracking-widest text-neon mb-3">
          Search New Jobs
        </h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Job title (e.g. Software Engineer)"
            value={scrapeTitle}
            onChange={(e) => setScrapeTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Location (e.g. San Francisco, CA)"
            value={scrapeLocation}
            onChange={(e) => setScrapeLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            className={inputClass}
          />
          <select
            value={scrapeExp}
            onChange={(e) => setScrapeExp(e.target.value)}
            className={selectClass}
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l.value} value={l.value} className="bg-dark">
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon text-black text-sm font-bold hover:bg-neon-dim disabled:opacity-60 transition shadow-neon-sm"
        >
          {scraping ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {scraping ? "Searching…" : "Search Jobs"}
        </button>
        {scrapeMsg && (
          <p
            className={`mt-2 text-xs rounded-lg px-3 py-2 ${
              scrapeMsg.type === "error"
                ? "bg-red-950/40 text-red-400 border border-red-800"
                : "bg-neon/10 text-neon border border-neon/30"
            }`}
          >
            {scrapeMsg.text}
          </p>
        )}
      </div>

      <hr className="border-dark-border" />

      {/* Filter section */}
      <div>
        <h2 className="font-semibold text-xs uppercase tracking-widest text-neon mb-3">
          Filter Results
        </h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Filter by title…"
            value={filters.title || ""}
            onChange={(e) => onChange({ ...filters, title: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Filter by location…"
            value={filters.location || ""}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className={inputClass}
          />
          <select
            value={filters.status || ""}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-dark">
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filters.source || ""}
            onChange={(e) => onChange({ ...filters, source: e.target.value })}
            className={selectClass}
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value} className="bg-dark">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
