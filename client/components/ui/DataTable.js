export default function DataTable({ columns, children, emptyMessage }) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table className="table table-zebra">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col}>{col.label || col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-base-content/60 py-8">
                {emptyMessage || "No data"}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
