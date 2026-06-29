export default function StatCard({ title, value, description, variant = "default" }) {
  const valueClass =
    variant === "success"
      ? "text-success"
      : variant === "warning"
        ? "text-warning"
        : variant === "info"
          ? "text-info"
          : "";

  return (
    <div className="stat bg-base-100 border border-base-300 rounded-box shadow-sm">
      <div className="stat-title text-xs">{title}</div>
      <div className={`stat-value text-2xl ${valueClass}`}>{value}</div>
      {description && (
        <div className="stat-desc text-xs">{description}</div>
      )}
    </div>
  );
}
