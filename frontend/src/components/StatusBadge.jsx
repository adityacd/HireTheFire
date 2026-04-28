const STATUS_STYLES = {
  new:        { bg: "rgba(100,116,139,0.12)", color: "#64748b", border: "rgba(100,116,139,0.2)"  },
  interested: { bg: "rgba(0,255,170,0.08)",   color: "#00ffaa", border: "rgba(0,255,170,0.25)"   },
  applied:    { bg: "rgba(123,94,167,0.15)",  color: "#9d7ec9", border: "rgba(123,94,167,0.3)"   },
  skip:       { bg: "rgba(239,68,68,0.08)",   color: "#f87171", border: "rgba(239,68,68,0.2)"    },
};

const STATUS_LABELS = { new: "New", interested: "Interested", applied: "Applied", skip: "Skip" };

export default function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
