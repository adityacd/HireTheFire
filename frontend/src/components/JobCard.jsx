import { useState } from "react";
import { ExternalLink, MapPin, Calendar, Building2, Zap } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { updateJobStatus, scoreJob } from "../api/client";

const SOURCE_PILL = {
  linkedin:  { bg: "rgba(59,130,246,0.2)",  color: "#93c5fd", border: "rgba(59,130,246,0.3)"  },
  indeed:    { bg: "rgba(168,85,247,0.2)",   color: "#d8b4fe", border: "rgba(168,85,247,0.3)"  },
  glassdoor: { bg: "rgba(16,185,129,0.2)",   color: "#6ee7b7", border: "rgba(16,185,129,0.3)"  },
};

const STATUS_ACTIONS = [
  { value: "interested", label: "Interested", color: "#93c5fd", border: "rgba(59,130,246,0.3)",  hoverBg: "rgba(59,130,246,0.1)"  },
  { value: "applied",    label: "Applied",    color: "#a5b4fc", border: "rgba(99,102,241,0.35)", hoverBg: "rgba(99,102,241,0.1)" },
  { value: "skip",       label: "Skip",       color: "#fca5a5", border: "rgba(239,68,68,0.25)",  hoverBg: "rgba(239,68,68,0.08)" },
];

function scoreColor(score) {
  if (score >= 75) return { text: "#4ade80", bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.3)" };
  if (score >= 50) return { text: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)" };
  return { text: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.3)" };
}

export default function JobCard({ job, onStatusChange }) {
  const [hoveredAction, setHoveredAction] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [score, setScore] = useState(job.compatibility_score ?? null);
  const [reasoning, setReasoning] = useState(job.compatibility_reasoning ?? null);
  const [showReasoning, setShowReasoning] = useState(false);

  const handleStatus = async (status) => {
    try {
      const updated = await updateJobStatus(job.id, status);
      onStatusChange(updated);
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleScore = async () => {
    setScoring(true);
    try {
      const result = await scoreJob(job.id);
      setScore(result.compatibility_score);
      setReasoning(result.compatibility_reasoning);
    } catch (e) {
      console.error("Failed to score job", e);
    } finally {
      setScoring(false);
    }
  };

  const src = SOURCE_PILL[job.source];
  const colors = score !== null ? scoreColor(score) : null;

  return (
    <div className="glass glass-hover gradient-border rounded-2xl p-5 shadow-glass h-full flex flex-col">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {src && (
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: src.bg, color: src.color, border: `1px solid ${src.border}` }}
              >
                {job.source}
              </span>
            )}
            <StatusBadge status={job.status} />
            {score !== null && (
              <button
                onClick={() => setShowReasoning((v) => !v)}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                title={showReasoning ? "Hide reasoning" : "Show reasoning"}
              >
                {Math.round(score)}% match
              </button>
            )}
          </div>
          <h3 className="mt-2.5 font-semibold text-white text-[15px] leading-snug">
            {job.title}
          </h3>
        </div>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Apply"
            className="shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/8 transition-colors"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>

      {/* Reasoning tooltip */}
      {showReasoning && reasoning && (
        <p className="mt-2 text-xs text-slate-400 leading-relaxed bg-white/5 rounded-lg px-3 py-2 border border-white/8">
          {reasoning}
        </p>
      )}

      {/* Meta */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Building2 size={12} />
          {job.company}
        </span>
        {job.location && (
          <span className="flex items-center gap-1.5">
            <MapPin size={12} />
            {job.location}
          </span>
        )}
        {job.date_posted && (
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {job.date_posted}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 flex-wrap">
        {STATUS_ACTIONS.filter((a) => a.value !== job.status).map((action) => (
          <button
            key={action.value}
            onClick={() => handleStatus(action.value)}
            onMouseEnter={() => setHoveredAction(action.value)}
            onMouseLeave={() => setHoveredAction(null)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              color: action.color,
              border: `1px solid ${action.border}`,
              background: hoveredAction === action.value ? action.hoverBg : "transparent",
            }}
          >
            {action.label}
          </button>
        ))}
        {job.status === "skip" && (
          <button
            onClick={() => handleStatus("new")}
            className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 border border-white/8 hover:border-white/15 hover:text-slate-300 transition-all"
          >
            Restore
          </button>
        )}
        <button
            onClick={handleScore}
            disabled={scoring}
            className="ml-auto px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-150 disabled:opacity-50"
            style={{
              color: "#fb923c",
              border: "1px solid rgba(251,146,60,0.3)",
              background: scoring ? "rgba(251,146,60,0.1)" : "transparent",
            }}
            title="Score compatibility with your resume"
          >
            <Zap size={11} />
            {scoring ? "Scoring…" : score !== null ? "Re-score" : "Score"}
          </button>
      </div>
    </div>
  );
}
