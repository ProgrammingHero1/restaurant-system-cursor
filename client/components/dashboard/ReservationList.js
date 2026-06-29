"use client";

import { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";

const columns = [
  { key: "customer", label: "Customer" },
  { key: "phone", label: "Phone" },
  { key: "party", label: "Party" },
  { key: "when", label: "Date & time" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ReservationList({
  reservations,
  tables,
  onConfirm,
  onCancel,
  onSeat,
  busyId,
}) {
  const [confirming, setConfirming] = useState(null);
  const [tableId, setTableId] = useState("");

  function startConfirm(reservation) {
    setConfirming(reservation);
    setTableId("");
  }

  async function submitConfirm() {
    if (!confirming || !tableId) return;
    await onConfirm(confirming, tableId);
    setConfirming(null);
    setTableId("");
  }

  const availableTables = tables.filter((t) => t.status === "available");

  return (
    <>
      <DataTable columns={columns} emptyMessage="No reservations found.">
        {reservations.map((r) => (
          <tr key={r._id}>
            <td className="font-medium">{r.customerName}</td>
            <td>{r.phone}</td>
            <td>{r.partySize}</td>
            <td className="text-sm whitespace-nowrap">{formatDateTime(r.dateTime)}</td>
            <td>
              <StatusBadge status={r.status} type="reservation" />
            </td>
            <td>
              <div className="flex flex-wrap gap-2">
                {r.status === "pending" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      disabled={busyId === r._id}
                      onClick={() => startConfirm(r)}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      disabled={busyId === r._id}
                      onClick={() => onCancel(r)}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {r.status === "confirmed" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      disabled={busyId === r._id}
                      onClick={() => onSeat(r)}
                    >
                      Mark seated
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      disabled={busyId === r._id}
                      onClick={() => onCancel(r)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {confirming && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">Confirm reservation</h3>
            <p className="text-sm text-base-content/70 mb-4">
              {confirming.customerName} · party of {confirming.partySize}
            </p>
            <label className="form-control w-full">
              <span className="label-text">Assign table</span>
              <select
                className="select select-bordered w-full"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
              >
                <option value="">Select a table…</option>
                {availableTables
                  .filter((t) => t.capacity >= confirming.partySize)
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      Table {t.number} (seats {t.capacity})
                    </option>
                  ))}
              </select>
            </label>
            {!availableTables.some((t) => t.capacity >= confirming.partySize) && (
              <p className="text-sm text-warning mt-2">
                No available tables fit this party size.
              </p>
            )}
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!tableId || busyId === confirming._id}
                onClick={submitConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setConfirming(null)}>
              close
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}
