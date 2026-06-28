export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h3 className="text-lg font-semibold">{title || "Nothing here yet"}</h3>
      {message && (
        <p className="text-base-content/60 mt-2 max-w-sm">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
