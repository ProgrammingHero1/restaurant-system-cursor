"use client";

import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";

const columns = [
  { key: "table", label: "Table" },
  { key: "total", label: "Total" },
  { key: "status", label: "Payment" },
  { key: "actions", label: "Actions" },
];

function formatPrice(value) {
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `$${n.toFixed(2)}`;
}

export default function BillList({ bills, onPay, payingId }) {
  return (
    <DataTable columns={columns} emptyMessage="No bills match this filter.">
      {bills.map((bill) => (
        <tr key={bill._id}>
          <td className="font-medium">Table {bill.tableNumber ?? "—"}</td>
          <td>{formatPrice(bill.total)}</td>
          <td>
            <StatusBadge status={bill.paymentStatus} type="payment" />
          </td>
          <td>
            <div className="flex flex-wrap gap-2">
              <Link href={`/bill/${bill._id}`} className="btn btn-ghost btn-xs" target="_blank">
                View
              </Link>
              {bill.paymentStatus === "unpaid" && (
                <button
                  type="button"
                  className="btn btn-primary btn-xs"
                  disabled={payingId === bill._id}
                  onClick={() => onPay(bill)}
                >
                  Mark paid
                </button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
