"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { api, ApiError } from "@/lib/api";

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, ordersData, reservationsData] = await Promise.all([
        api.get("/api/dashboard/stats", { auth: true }),
        api.get("/api/orders?status=pending", { auth: true }),
        api.get("/api/reservations?status=confirmed", { auth: true }),
      ]);
      setStats(statsData);
      setPendingOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
      setUpcomingReservations(
        Array.isArray(reservationsData) ? reservationsData.slice(0, 5) : []
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Today's overview at a glance."
      />

      {error && (
        <div role="alert" className="alert alert-error mb-6 text-sm">
          <span>{error}</span>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Open orders"
            value={stats.openOrdersCount}
            description="Not yet paid"
            variant="warning"
          />
          <StatCard
            title="Today's reservations"
            value={stats.todayReservationsCount}
            variant="info"
          />
          <StatCard
            title="Unpaid bills"
            value={stats.unpaidBillsCount}
            variant="warning"
          />
          <StatCard
            title="Today's revenue"
            value={formatMoney(stats.todayRevenue)}
            variant="success"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-base">Pending orders</h2>
              <Link href="/dashboard/orders" className="btn btn-ghost btn-xs">
                View all
              </Link>
            </div>
            {!pendingOrders.length ? (
              <p className="text-sm text-base-content/60">No pending orders.</p>
            ) : (
              <ul className="space-y-3">
                {pendingOrders.map((order) => (
                  <li
                    key={order._id}
                    className="flex items-center justify-between gap-3 text-sm border-b border-base-300 pb-2 last:border-0"
                  >
                    <span>Table {order.tableNumber}</span>
                    <StatusBadge status={order.status} type="order" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-base">Upcoming reservations</h2>
              <Link href="/dashboard/reservations" className="btn btn-ghost btn-xs">
                View all
              </Link>
            </div>
            {!upcomingReservations.length ? (
              <p className="text-sm text-base-content/60">No confirmed reservations.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingReservations.map((r) => (
                  <li
                    key={r._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm border-b border-base-300 pb-2 last:border-0"
                  >
                    <span className="font-medium">{r.customerName}</span>
                    <span className="text-base-content/70">
                      {formatDateTime(r.dateTime)} · {r.partySize} guests
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
