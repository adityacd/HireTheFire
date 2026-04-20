const STATUS_STYLES = {
  new:        { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "rgba(100,116,139,0.25)" },
  interested: { bg: "rgba(59,130,246,0.15)",  color: "#93c5fd", border: "rgba(59,130,246,0.3)"  },
  applied:    { bg: "rgba(99,102,241,0.15)",   color: "#a5b4fc", border: "rgba(99,102,241,0.3)"  },
  skip:       { bg: "rgba(239,68,68,0.1)",     color: "#fca5a5", border: "rgba(239,68,68,0.2)"   },
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
