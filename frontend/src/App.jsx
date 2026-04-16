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

  // Debounced filter changes
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

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats bar */}
        {jobs.length > 0 && (
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              <strong className="text-gray-900">{stats.total}</strong> jobs
            </span>
            <span>
              <strong className="text-blue-600">{stats.interested}</strong> interested
            </span>
            <span>
              <strong className="text-green-600">{stats.applied}</strong> applied
            </span>
          </div>
        )}

        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onScrapeComplete={() => fetchJobs(filters)}
        />

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-36"
              />
            ))}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Inbox size={40} />
            <p className="text-base">No jobs yet. Search above to find listings.</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
