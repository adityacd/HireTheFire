import { useState } from "react";
import { ExternalLink, FileText, MapPin, Calendar, Building2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import CoverLetterModal from "./CoverLetterModal";
import { updateJobStatus } from "../api/client";

const SOURCE_COLORS = {
  linkedin: "bg-blue-600",
  indeed: "bg-purple-600",
  glassdoor: "bg-emerald-700",
};

const STATUS_ACTIONS = [
  { value: "interested", label: "Interested", style: "text-blue-400 border-blue-800 hover:bg-blue-950" },
  { value: "applied", label: "Applied", style: "text-neon border-neon/40 hover:bg-neon/10" },
  { value: "skip", label: "Skip", style: "text-red-400 border-red-900 hover:bg-red-950/40" },
];

export default function JobCard({ job, onStatusChange }) {
  const [showModal, setShowModal] = useState(false);

  const handleStatus = async (status) => {
    try {
      const updated = await updateJobStatus(job.id, status);
      onStatusChange(updated);
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  return (
    <>
      <div className="card-hover bg-dark-card rounded-xl border border-neon p-5 transition-all duration-300 shadow-neon-sm">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-medium text-white px-2 py-0.5 rounded-full ${SOURCE_COLORS[job.source] ?? "bg-gray-700"}`}
              >
                {job.source}
              </span>
              <StatusBadge status={job.status} />
            </div>
            <h3 className="mt-2 font-semibold text-white text-base leading-snug">
              {job.title}
            </h3>
          </div>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 rounded-lg hover:bg-neon/10 text-gray-500 hover:text-neon transition"
              title="Apply"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neon/70">
          <span className="flex items-center gap-1">
            <Building2 size={14} />
            {job.company}
          </span>
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {job.location}
            </span>
          )}
          {job.date_posted && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {job.date_posted}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {STATUS_ACTIONS.filter((a) => a.value !== job.status).map((action) => (
            <button
              key={action.value}
              onClick={() => handleStatus(action.value)}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition ${action.style}`}
            >
              {action.label}
            </button>
          ))}
          {job.status === "skip" && (
            <button
              onClick={() => handleStatus("new")}
              className="px-3 py-1 rounded-lg border border-dark-border text-xs font-medium text-gray-500 hover:bg-dark-border transition"
            >
              Restore
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg border border-neon/40 text-xs font-medium text-neon hover:bg-neon/10 transition"
          >
            <FileText size={13} />
            Cover Letter
          </button>
        </div>
      </div>

      {showModal && (
        <CoverLetterModal job={job} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
