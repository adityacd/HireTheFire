import { useState } from "react";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import { scrapeJobs } from "../api/client";

const STATUSES = [
  { value: "", label: "All Statuses" },
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

const inputCls =
  "w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none transition-all duration-200 focus:ring-1 border border-white/6 hover:border-white/10";

const inputStyle = { background: "#0E1818" };

export default function FilterPanel({ filters, onChange, onScrapeComplete }) {
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState(null);
  const [scrapeTitle, setScrapeTitle] = useState("");
  const [scrapeLocation, setScrapeLocation] = useState("");
  const [scrapeExp, setScrapeExp] = useState("");

  const handleScrape = async () => {
    if (!scrapeTitle.trim() || !scrapeLocation.trim()) {
      setScrapeMsg({ type: "error", text: "Enter a job title and location." });
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
        text: `${result.added} new jobs found.${result.duplicates ? ` ${result.duplicates} duplicates skipped.` : ""}`,
      });
      onScrapeComplete();
    } catch {
      setScrapeMsg({ type: "error", text: "Scrape failed. Is the backend running?" });
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="glass gradient-border rounded-2xl p-5 space-y-6 shadow-glass">
      {/* Search */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
          Search Jobs
        </p>
        <div className="space-y-2.5">
          <input
            type="text"
            placeholder="Job title"
            value={scrapeTitle}
            onChange={(e) => setScrapeTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            className={inputCls} style={inputStyle}
          />
          <input
            type="text"
            placeholder="Location"
            value={scrapeLocation}
            onChange={(e) => setScrapeLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            className={inputCls} style={inputStyle}
          />
          <select
            value={scrapeExp}
            onChange={(e) => setScrapeExp(e.target.value)}
            className={inputCls} style={inputStyle}
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleScrape}
          disabled={scraping}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all duration-200 hover:shadow-btn-glow hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #00ffaa, #007a52)", color: "#080c10" }}
        >
          {scraping ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {scraping ? "Searching…" : "Search Jobs"}
        </button>

        {scrapeMsg && (
          <p
            className="mt-2.5 text-xs rounded-xl px-3 py-2 border"
            style={scrapeMsg.type === "error"
              ? { color: "#f87171", background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }
              : { color: "#00ffaa", background: "rgba(0,255,170,0.05)", borderColor: "rgba(0,255,170,0.2)" }
            }
          >
            {scrapeMsg.text}
          </p>
        )}
      </div>

      <div className="h-px bg-white/5" />

      {/* Filters */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-1.5">
          <SlidersHorizontal size={12} />
          Filter
        </p>
        <div className="space-y-2.5">
          <input
            type="text"
            placeholder="Title…"
            value={filters.title || ""}
            onChange={(e) => onChange({ ...filters, title: e.target.value })}
            className={inputCls} style={inputStyle}
          />
          <input
            type="text"
            placeholder="Location…"
            value={filters.location || ""}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className={inputCls} style={inputStyle}
          />
          <select
            value={filters.status || ""}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className={inputCls} style={inputStyle}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filters.source || ""}
            onChange={(e) => onChange({ ...filters, source: e.target.value })}
            className={inputCls} style={inputStyle}
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
