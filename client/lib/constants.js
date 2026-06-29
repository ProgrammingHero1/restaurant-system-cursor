export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "served",
  "billed",
  "paid",
];

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "seated",
  "cancelled",
];

export const TABLE_STATUSES = ["available", "occupied", "reserved"];

export const PAYMENT_STATUSES = ["unpaid", "paid"];

export const STAFF_ROLES = ["admin", "manager", "waiter"];

export const PAYMENT_METHODS = ["manual", "stripe"];

export const PAYMENT_METHOD_LABELS = {
  manual: "Cash / manual",
  stripe: "Stripe",
};

export const MENU_CATEGORIES = [
  "Starters",
  "Mains",
  "Drinks",
  "Desserts",
];

export const ORDER_STATUS_TRANSITIONS = {
  pending: "preparing",
  preparing: "served",
  served: "billed",
  billed: "paid",
};

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  preparing: "Preparing",
  served: "Served",
  billed: "Billed",
  paid: "Paid",
};

export const TABLE_STATUS_LABELS = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
};

export const RESERVATION_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  seated: "Seated",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Unpaid",
  paid: "Paid",
};
