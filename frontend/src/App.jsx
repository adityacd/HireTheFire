import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import JobCard from "./components/JobCard";
import { getJobs, scoreJob } from "./api/client";
import { Inbox, AlertCircle, Briefcase, Star, CheckCircle2, XCircle, Zap, Loader2 } from "lucide-react";

const DEBOUNCE_MS = 400;

const METRIC_CARDS = [
  {
    key: "total",
    label: "Total",
    icon: Briefcase,
    color: "#00ffaa",
    bg: "rgba(0,255,170,0.06)",
    border: "rgba(0,255,170,0.15)",
    glow: "rgba(0,255,170,0.08)",
  },
  {
    key: "interested",
    label: "Interested",
    icon: Star,
    color: "#00cc88",
    bg: "rgba(0,204,136,0.06)",
    border: "rgba(0,204,136,0.15)",
    glow: "rgba(0,204,136,0.06)",
  },
  {
    key: "applied",
    label: "Applied",
    icon: CheckCircle2,
    color: "#9d7ec9",
    bg: "rgba(123,94,167,0.08)",
    border: "rgba(123,94,167,0.2)",
    glow: "rgba(123,94,167,0.06)",
  },
  {
    key: "skipped",
    label: "Skipped",
    icon: XCircle,
    color: "#f87171",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.15)",
    glow: "rgba(239,68,68,0.04)",
  },
];

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scoringAll, setScoringAll] = useState(false);

  const fetchJobs = useCallback(async (f = {}) => {
    setLoading(true);
    setError("");
    try {
      const clean = Object.fromEntries(
        Object.entries(f).filter(([, v]) => v !== "" && v != null)
      );
      const data = await getJobs(clean);
      setJobs(data);
    } catch {
      setError("Could not connect to the backend. Make sure it is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchJobs(filters), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [filters, fetchJobs]);

  const handleStatusChange = (updated) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  };

  const handleScoreChange = (jobId, score, reasoning) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, compatibility_score: score, compatibility_reasoning: reasoning }
          : j
      )
    );
  };

  const handleScoreAll = async () => {
    const unscored = jobs.filter((j) => j.compatibility_score == null);
    if (!unscored.length) return;
    setScoringAll(true);
    for (const job of unscored) {
      try {
        const result = await scoreJob(job.id);
        handleScoreChange(job.id, result.compatibility_score, result.compatibility_reasoning);
      } catch (e) {
        console.error(`Failed to score job ${job.id}`, e);
      }
    }
    setScoringAll(false);
  };

  const stats = {
    total:      jobs.length,
    interested: jobs.filter((j) => j.status === "interested").length,
    applied:    jobs.filter((j) => j.status === "applied").length,
    skipped:    jobs.filter((j) => j.status === "skip").length,
  };

  return (
    <div className="min-h-screen">
      <Header jobCount={stats.total} />

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-7 items-start">
        {/* Left — filter + metrics */}
        <aside className="w-72 shrink-0 sticky top-[61px] space-y-4">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onScrapeComplete={() => fetchJobs(filters)}
          />

          {/* Metric cards dashboard */}
          <div className="glass gradient-border rounded-2xl p-4 shadow-glass space-y-3">
            <p className="text-xs font-display font-semibold uppercase tracking-widest" style={{ color: "#334155" }}>
              Dashboard
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {METRIC_CARDS.map(({ key, label, icon: Icon, color, bg, border, glow }) => (
                <div
                  key={key}
                  className="rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-200"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    boxShadow: `0 4px 16px ${glow}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={14} style={{ color }} strokeWidth={2} />
                    <span
                      className="text-2xl font-black tabular-nums leading-none"
                      style={{ color }}
                    >
                      {stats[key]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-none">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right — results */}
        <main className="flex-1 min-w-0">
          {error && (
            <div
              className="flex items-center gap-2 text-red-400 rounded-xl px-4 py-3 text-sm mb-4 glass"
              style={{ borderColor: "rgba(239,68,68,0.2)" }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-40" />
              ))}
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-600">
              <Inbox size={48} strokeWidth={1.5} />
              <p className="text-base">No jobs yet — search above to get started.</p>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-slate-300">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</p>
                  {(() => {
                    const scored = jobs.filter(j => j.compatibility_score != null).length;
                    return scored > 0 ? (
                      <span className="text-xs text-slate-600">{scored} scored</span>
                    ) : null;
                  })()}
                </div>
                <button
                  onClick={handleScoreAll}
                  disabled={scoringAll || jobs.every((j) => j.compatibility_score != null)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-40 hover:brightness-110"
                  style={{
                    color: "#00ffaa",
                    border: "1px solid rgba(0,255,170,0.25)",
                    background: scoringAll ? "rgba(0,255,170,0.08)" : "rgba(0,255,170,0.03)",
                  }}
                >
                  {scoringAll ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  {scoringAll
                    ? `Scoring… ${jobs.filter(j => j.compatibility_score != null).length}/${jobs.length}`
                    : "Score All"}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {jobs.map((job, i) => (
                  <div
                    key={job.id}
                    className="card-in"
                    style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
                  >
                    <JobCard job={job} onStatusChange={handleStatusChange} onScoreChange={handleScoreChange} />
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
