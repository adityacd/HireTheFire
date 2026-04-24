import { useState } from "react";
import { ExternalLink, MapPin, Calendar, Building2, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { updateJobStatus, scoreJob } from "../api/client";

const SOURCE_PILL = {
  linkedin:  { bg: "rgba(59,130,246,0.15)",  color: "#93c5fd", border: "rgba(59,130,246,0.25)"  },
  indeed:    { bg: "rgba(168,85,247,0.15)",   color: "#d8b4fe", border: "rgba(168,85,247,0.25)"  },
  glassdoor: { bg: "rgba(16,185,129,0.15)",   color: "#6ee7b7", border: "rgba(16,185,129,0.25)"  },
};

const EXP_LABELS = { entry: "Entry", mid: "Mid", senior: "Senior" };

const STATUS_ACTIONS = [
  { value: "interested", label: "Interested", color: "#93c5fd", border: "rgba(59,130,246,0.3)",  hoverBg: "rgba(59,130,246,0.1)"  },
  { value: "applied",    label: "Applied",    color: "#a5b4fc", border: "rgba(99,102,241,0.35)", hoverBg: "rgba(99,102,241,0.1)" },
  { value: "skip",       label: "Skip",       color: "#fca5a5", border: "rgba(239,68,68,0.25)",  hoverBg: "rgba(239,68,68,0.08)" },
];

function scoreTheme(score) {
  if (score >= 75) return { text: "#4ade80", bar: "linear-gradient(90deg,#16a34a,#4ade80)", glow: "rgba(74,222,128,0.25)" };
  if (score >= 50) return { text: "#fbbf24", bar: "linear-gradient(90deg,#d97706,#fbbf24)", glow: "rgba(251,191,36,0.2)"  };
  return              { text: "#f87171", bar: "linear-gradient(90deg,#dc2626,#f87171)", glow: "rgba(248,113,113,0.2)"  };
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
                style={{ background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.18)" }}>
                {EXP_LABELS[job.experience_level]}
              </span>
            )}
          </div>
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/8 transition-colors"
              title="Open listing">
              <ExternalLink size={15} />
            </a>
          )}
        </div>

        {/* Title + meta */}
        <div>
          <h3 className="font-semibold text-white text-[15px] leading-snug line-clamp-2">{job.title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Building2 size={11} />{job.company}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
            {job.date_posted && <span className="flex items-center gap-1"><Calendar size={11} />{job.date_posted}</span>}
          </div>
        </div>

        <div className="flex-1" />

        {/* Score section */}
        {score !== null ? (
          <div className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
            <button
              onClick={() => setShowReasoning(v => !v)}
              className="w-full px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-sm font-black tabular-nums shrink-0" style={{ color: theme.text }}>
                  {Math.round(score)}%
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full score-bar"
                    style={{ width: `${score}%`, background: theme.bar, boxShadow: `0 0 8px ${theme.glow}` }}
                  />
                </div>
                <span className="text-xs text-slate-500 shrink-0">match</span>
              </div>
              {showReasoning
                ? <ChevronUp size={13} className="text-slate-600 shrink-0" />
                : <ChevronDown size={13} className="text-slate-600 shrink-0" />}
            </button>
            {showReasoning && reasoning && (
              <p className="px-3 pb-3 pt-2 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                {reasoning}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={handleScore}
            disabled={scoring}
            className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 disabled:opacity-50"
            style={{ color: "#fb923c", border: "1px solid rgba(251,146,60,0.25)", background: scoring ? "rgba(251,146,60,0.08)" : "rgba(251,146,60,0.04)" }}
          >
            {scoring ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {scoring ? "Scoring…" : "Score with Resume"}
          </button>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
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
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 border border-white/8 hover:border-white/15 hover:text-slate-300 transition-all">
              Restore
            </button>
          )}
          {score !== null && (
            <button
              onClick={handleScore}
              disabled={scoring}
              className="ml-auto px-2.5 py-1 rounded-lg text-xs text-slate-600 border border-white/6 hover:text-slate-400 hover:border-white/12 transition-all disabled:opacity-40 flex items-center gap-1"
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
