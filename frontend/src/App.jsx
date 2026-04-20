import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import JobCard from "./components/JobCard";
import { getJobs } from "./api/client";
import { Inbox, AlertCircle } from "lucide-react";

const DEBOUNCE_MS = 400;

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const stats = {
    total: jobs.length,
    interested: jobs.filter((j) => j.status === "interested").length,
    applied: jobs.filter((j) => j.status === "applied").length,
  };

  return (
    <div className="min-h-screen">
      <Header jobCount={stats.total} />

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-7 items-start">
        {/* Left — filter panel */}
        <aside className="w-72 shrink-0 sticky top-[61px]">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onScrapeComplete={() => fetchJobs(filters)}
          />
        </aside>

        {/* Right — results */}
        <main className="flex-1 min-w-0">
          {/* Stats */}
          {jobs.length > 0 && (
            <div className="flex gap-6 mb-5 text-sm">
              <span className="text-slate-500">
                <span className="font-semibold text-white">{stats.total}</span> jobs
              </span>
              <span className="text-slate-500">
                <span className="font-semibold text-blue-400">{stats.interested}</span> interested
              </span>
              <span className="text-slate-500">
                <span className="font-semibold text-indigo-400">{stats.applied}</span> applied
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 rounded-xl px-4 py-3 text-sm mb-4 glass"
              style={{ borderColor: "rgba(239,68,68,0.2)" }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl h-40" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-600">
              <Inbox size={48} strokeWidth={1.5} />
              <p className="text-base">No jobs yet — search above to get started.</p>
            </div>
          )}

          {/* Job grid */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobs.map((job, i) => (
                <div
                  key={job.id}
                  className="card-in"
                  style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
                >
                  <JobCard job={job} onStatusChange={handleStatusChange} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
