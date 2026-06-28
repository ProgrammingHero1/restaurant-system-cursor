import {
  ORDER_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
  TABLE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";

const VARIANTS = {
  pending: "badge-warning",
  preparing: "badge-info",
  served: "badge-success",
  billed: "badge-accent",
  paid: "badge-success",
  confirmed: "badge-info",
  seated: "badge-success",
  cancelled: "badge-error",
  available: "badge-success",
  occupied: "badge-warning",
  reserved: "badge-info",
  unpaid: "badge-warning",
  active: "badge-success",
  inactive: "badge-ghost",
};

const LABELS = {
  ...ORDER_STATUS_LABELS,
  ...RESERVATION_STATUS_LABELS,
  ...TABLE_STATUS_LABELS,
  ...PAYMENT_STATUS_LABELS,
  active: "Active",
  inactive: "Inactive",
};

export default function StatusBadge({ status, type }) {
  const normalized = String(status || "").toLowerCase();
  const label = LABELS[normalized] || status;
  const variant = VARIANTS[normalized] || "badge-ghost";

  return (
    <span className={`badge ${variant}`} data-type={type}>
      {label}
    </span>
  );
}
