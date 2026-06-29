"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import { TABLE_STATUSES } from "@/lib/constants";

export default function TableGrid({
  tables,
  onEdit,
  onStatusChange,
  updatingId,
}) {
  if (!tables.length) {
    return (
      <p className="text-center text-base-content/60 py-8">
        No tables yet. Add your first table to get started.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tables.map((table) => (
        <div
          key={table._id}
          className="card bg-base-100 border border-base-300 shadow-sm"
        >
          <div className="card-body p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg">Table {table.number}</h3>
                <p className="text-sm text-base-content/70">
                  Seats {table.capacity}
                </p>
              </div>
              <StatusBadge status={table.status} type="table" />
            </div>
            <div className="card-actions justify-end mt-3 flex-wrap gap-2">
              <select
                className="select select-bordered select-xs"
                value={table.status}
                disabled={updatingId === table._id}
                onChange={(e) => onStatusChange(table, e.target.value)}
              >
                {TABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => onEdit(table)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
