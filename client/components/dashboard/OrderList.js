"use client";

import { ORDER_STATUSES } from "@/lib/constants";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";
import Link from "next/link";

const columns = [
  { key: "table", label: "Table" },
  { key: "items", label: "Items" },
  { key: "subtotal", label: "Subtotal" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

function formatPrice(value) {
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `$${n.toFixed(2)}`;
}

function itemsSummary(items) {
  if (!items?.length) return "—";
  return items.map((i) => `${i.qty}× ${i.name}`).join(", ");
}

export default function OrderList({
  orders,
  onAdvance,
  onGenerateBill,
  advancingId,
  billingId,
}) {
  return (
    <DataTable columns={columns} emptyMessage="No orders match this filter.">
      {orders.map((order) => (
        <tr key={order._id}>
          <td className="font-medium">Table {order.tableNumber ?? "—"}</td>
          <td className="max-w-xs truncate text-sm">{itemsSummary(order.items)}</td>
          <td>{formatPrice(order.subtotal)}</td>
          <td>
            <StatusBadge status={order.status} type="order" />
          </td>
          <td>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUS_TRANSITIONS[order.status] &&
                order.status !== "served" &&
                order.status !== "billed" &&
                order.status !== "paid" && (
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    disabled={advancingId === order._id}
                    onClick={() => onAdvance(order)}
                  >
                    Mark {ORDER_STATUS_TRANSITIONS[order.status]}
                  </button>
                )}
              {order.status === "served" && onGenerateBill && (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  disabled={billingId === order._id}
                  onClick={() => onGenerateBill(order)}
                >
                  Generate bill
                </button>
              )}
              {order.status === "billed" && (
                <Link href="/dashboard/billing" className="btn btn-ghost btn-xs">
                  View billing
                </Link>
              )}
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

const ORDER_STATUS_TRANSITIONS = {
  pending: "preparing",
  preparing: "served",
};
