// Blue pills kept as-is per design; only bg updated for dark theme readability
const STATUS_STYLES = {
  new: "bg-gray-800 text-gray-400",
  interested: "bg-blue-900 text-blue-300",
  applied: "bg-blue-900 text-blue-300",
  skip: "bg-red-950 text-red-400",
};

const STATUS_LABELS = {
  new: "New",
  interested: "Interested",
  applied: "Applied",
  skip: "Skip",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
