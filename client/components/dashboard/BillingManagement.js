"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BillList from "@/components/dashboard/BillList";
import { api, ApiError } from "@/lib/api";

export default function BillingManagement() {
  const [bills, setBills] = useState([]);
  const [servedOrders, setServedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const billPath = paymentFilter
        ? `/api/bills?paymentStatus=${paymentFilter}`
        : "/api/bills";
      const [billsData, ordersData] = await Promise.all([
        api.get(billPath, { auth: true }),
        api.get("/api/orders?status=served", { auth: true }),
      ]);
      const billList = Array.isArray(billsData) ? billsData : [];
      const orderList = Array.isArray(ordersData) ? ordersData : [];
      const billedOrderIds = new Set(billList.map((b) => String(b.orderId)));
      setBills(billList);
      setServedOrders(
        orderList.filter((o) => !billedOrderIds.has(String(o._id)))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }, [paymentFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handlePay(bill) {
    if (!confirm(`Mark bill for table ${bill.tableNumber} as paid?`)) return;
    setPayingId(bill._id);
    setError("");
    try {
      await api.patch(`/api/bills/${bill._id}/pay`, {}, { auth: true });
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to mark bill paid");
    } finally {
      setPayingId(null);
    }
  }

  async function handleGenerate(order) {
    setGeneratingId(order._id);
    setError("");
    try {
      await api.post("/api/bills", { orderId: order._id }, { auth: true });
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate bill");
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Generate bills from served orders and record payment."
      />

      <div className="tabs tabs-boxed mb-6 flex-wrap h-auto gap-1 bg-base-100 border border-base-300 p-1 w-fit">
        <button
          type="button"
          className={`tab ${paymentFilter === "" ? "tab-active" : ""}`}
          onClick={() => setPaymentFilter("")}
        >
          All
        </button>
        <button
          type="button"
          className={`tab ${paymentFilter === "unpaid" ? "tab-active" : ""}`}
          onClick={() => setPaymentFilter("unpaid")}
        >
          Unpaid
        </button>
        <button
          type="button"
          className={`tab ${paymentFilter === "paid" ? "tab-active" : ""}`}
          onClick={() => setPaymentFilter("paid")}
        >
          Paid
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error mb-4 text-sm">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {servedOrders.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-lg mb-3">Served orders — generate bill</h2>
              <ul className="space-y-2">
                {servedOrders.map((order) => (
                  <li
                    key={order._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-box border border-base-300 bg-base-100"
                  >
                    <span>
                      Table {order.tableNumber} · ${Number(order.subtotal).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={generatingId === order._id}
                      onClick={() => handleGenerate(order)}
                    >
                      Generate bill
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="font-semibold text-lg mb-3">Bills</h2>
          <BillList bills={bills} onPay={handlePay} payingId={payingId} />
        </>
      )}
    </div>
  );
}
