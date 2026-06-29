"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import OrderList from "@/components/dashboard/OrderList";
import { ORDER_STATUSES } from "@/lib/constants";
import { api, ApiError } from "@/lib/api";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [advancingId, setAdvancingId] = useState(null);
  const [billingId, setBillingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const path = statusFilter
        ? `/api/orders?status=${statusFilter}`
        : "/api/orders";
      const data = await api.get(path, { auth: true });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleAdvance(order) {
    setAdvancingId(order._id);
    setError("");
    try {
      await api.patch(`/api/orders/${order._id}/status`, {}, { auth: true });
      await loadOrders();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to advance order");
    } finally {
      setAdvancingId(null);
    }
  }

  async function handleGenerateBill(order) {
    setBillingId(order._id);
    setError("");
    try {
      await api.post("/api/bills", { orderId: order._id }, { auth: true });
      await loadOrders();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate bill");
    } finally {
      setBillingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Track and update order status from kitchen to payment."
      />

      <div className="tabs tabs-boxed mb-6 flex-wrap h-auto gap-1 bg-base-100 border border-base-300 p-1">
        <button
          type="button"
          className={`tab ${statusFilter === "" ? "tab-active" : ""}`}
          onClick={() => setStatusFilter("")}
        >
          All
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`tab capitalize ${statusFilter === s ? "tab-active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="alert alert-error mb-4 text-sm">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <OrderList
          orders={orders}
          onAdvance={handleAdvance}
          onGenerateBill={handleGenerateBill}
          advancingId={advancingId}
          billingId={billingId}
        />
      )}
    </div>
  );
}
