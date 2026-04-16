const STATUS_STYLES = {
  new: "bg-gray-100 text-gray-600",
  interested: "bg-blue-100 text-blue-700",
  applied: "bg-green-100 text-green-700",
  skip: "bg-red-100 text-red-500",
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
