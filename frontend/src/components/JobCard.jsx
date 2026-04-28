import { useState } from "react";
import { ExternalLink, MapPin, Calendar, Building2, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { updateJobStatus, scoreJob } from "../api/client";

const SOURCE_PILL = {
  linkedin:  { bg: "rgba(0,255,170,0.06)",  color: "#00cc88", border: "rgba(0,255,170,0.2)"   },
  indeed:    { bg: "rgba(123,94,167,0.12)", color: "#9d7ec9", border: "rgba(123,94,167,0.25)" },
  glassdoor: { bg: "rgba(0,255,170,0.08)",  color: "#00ffaa", border: "rgba(0,255,170,0.22)"  },
};

const EXP_LABELS = { entry: "Entry", mid: "Mid", senior: "Senior" };

const STATUS_ACTIONS = [
  { value: "interested", label: "Interested", color: "#00ffaa", border: "rgba(0,255,170,0.3)",   hoverBg: "rgba(0,255,170,0.07)"  },
  { value: "applied",    label: "Applied",    color: "#9d7ec9", border: "rgba(123,94,167,0.35)", hoverBg: "rgba(123,94,167,0.1)"  },
  { value: "skip",       label: "Skip",       color: "#f87171", border: "rgba(239,68,68,0.25)",  hoverBg: "rgba(239,68,68,0.08)"  },
];

function scoreTheme(score) {
  if (score >= 75) return { text: "#00ffaa", bar: "linear-gradient(90deg,#007a52,#00ffaa)", glow: "rgba(0,255,170,0.3)"  };
  if (score >= 50) return { text: "#9d7ec9", bar: "linear-gradient(90deg,#5a4480,#9d7ec9)", glow: "rgba(123,94,167,0.3)" };
  return              { text: "#f87171", bar: "linear-gradient(90deg,#dc2626,#f87171)", glow: "rgba(248,113,113,0.2)" };
}

export default function JobCard({ job, onStatusChange, onScoreChange }) {
  const [hoveredAction, setHoveredAction] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const score     = job.compatibility_score    ?? null;
  const reasoning = job.compatibility_reasoning ?? null;

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
      onScoreChange?.(job.id, result.compatibility_score, result.compatibility_reasoning);
    } catch (e) {
      console.error("Failed to score job", e);
    } finally {
      setScoring(false);
    }
  };

  const src   = SOURCE_PILL[job.source];
  const theme = score !== null ? scoreTheme(score) : null;

  return (
    <div className="glass glass-hover gradient-border rounded-2xl shadow-glass h-full flex flex-col overflow-hidden">
      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Badges row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {src && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: src.bg, color: src.color, border: `1px solid ${src.border}` }}>
                {job.source}
              </span>
            )}
            <StatusBadge status={job.status} />
            {job.experience_level && EXP_LABELS[job.experience_level] && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(123,94,167,0.08)", color: "#7b5ea7", border: "1px solid rgba(123,94,167,0.2)" }}>
                {EXP_LABELS[job.experience_level]}
              </span>
            )}
          </div>
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ color: "#334155" }}
              onMouseEnter={e => e.currentTarget.style.color = "#00ffaa"}
              onMouseLeave={e => e.currentTarget.style.color = "#334155"}
              title="Open listing">
              <ExternalLink size={15} />
            </a>
          )}
        </div>

        {/* Title + meta */}
        <div>
          <h3 className="font-display font-semibold text-white text-[14px] leading-snug line-clamp-2 tracking-wide">
            {job.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: "#475569" }}>
            <span className="flex items-center gap-1"><Building2 size={11} />{job.company}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
            {job.date_posted && <span className="flex items-center gap-1"><Calendar size={11} />{job.date_posted}</span>}
          </div>
        </div>

        <div className="flex-1" />

        {/* Score section */}
        {score !== null ? (
          <div className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(0,255,170,0.1)", background: "rgba(0,255,170,0.02)" }}>
            <button
              onClick={() => setShowReasoning(v => !v)}
              className="w-full px-3 py-2.5 flex items-center justify-between gap-3 transition-colors"
              style={{ hover: "background: rgba(0,255,170,0.03)" }}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-sm font-bold tabular-nums shrink-0 font-display" style={{ color: theme.text }}>
                  {Math.round(score)}%
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full score-bar"
                    style={{ width: `${score}%`, background: theme.bar, boxShadow: `0 0 8px ${theme.glow}` }}
                  />
                </div>
                <span className="text-xs shrink-0" style={{ color: "#334155" }}>match</span>
              </div>
              {showReasoning
                ? <ChevronUp size={13} style={{ color: "#334155" }} className="shrink-0" />
                : <ChevronDown size={13} style={{ color: "#334155" }} className="shrink-0" />}
            </button>
            {showReasoning && reasoning && (
              <p className="px-3 pb-3 pt-2 text-xs leading-relaxed border-t" style={{ color: "#64748b", borderColor: "rgba(0,255,170,0.08)" }}>
                {reasoning}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={handleScore}
            disabled={scoring}
            className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 disabled:opacity-50"
            style={{ color: "#00ffaa", border: "1px solid rgba(0,255,170,0.25)", background: scoring ? "rgba(0,255,170,0.07)" : "rgba(0,255,170,0.03)" }}
          >
            {scoring ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {scoring ? "Scoring…" : "Score with Resume"}
          </button>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t" style={{ borderColor: "rgba(0,255,170,0.07)" }}>
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
            <button onClick={() => handleStatus("new")}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{ color: "#475569", border: "1px solid rgba(255,255,255,0.07)" }}>
              Restore
            </button>
          )}
          {score !== null && (
            <button
              onClick={handleScore}
              disabled={scoring}
              className="ml-auto px-2.5 py-1 rounded-lg text-xs transition-all disabled:opacity-40 flex items-center gap-1"
              style={{ color: "#334155", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {scoring ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
              Re-score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
