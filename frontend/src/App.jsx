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
    } catch (e) {
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
    <div className="min-h-screen bg-dark">
      <Header jobCount={stats.total} />

      <div className="max-w-screen-xl mx-auto px-4 py-6 flex gap-6 items-start">
        {/* Left — filter panel (sticky) */}
        <aside className="w-80 shrink-0 sticky top-[61px]">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onScrapeComplete={() => fetchJobs(filters)}
          />
        </aside>

        {/* Right — results */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Stats bar */}
          {jobs.length > 0 && (
            <div className="flex gap-5 text-sm mb-2">
              <span className="text-gray-400">
                <strong className="text-white">{stats.total}</strong> jobs
              </span>
              <span className="text-gray-400">
                <strong className="text-blue-400">{stats.interested}</strong> interested
              </span>
              <span className="text-gray-400">
                <strong className="text-neon">{stats.applied}</strong> applied
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-dark-card rounded-xl border border-dark-border p-5 animate-pulse h-36"
                />
              ))}
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Inbox size={44} className="text-neon opacity-40" />
              <p className="text-gray-500 text-base">No jobs yet. Search to find listings.</p>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
