"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ReservationList from "@/components/dashboard/ReservationList";
import { RESERVATION_STATUSES } from "@/lib/constants";
import { api, ApiError } from "@/lib/api";

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);
      const qs = params.toString();
      const [resData, tablesData] = await Promise.all([
        api.get(`/api/reservations${qs ? `?${qs}` : ""}`, { auth: true }),
        api.get("/api/tables", { auth: true }),
      ]);
      setReservations(Array.isArray(resData) ? resData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function patchReservation(id, body) {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/api/reservations/${id}`, body, { auth: true });
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update reservation");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Reservations"
        description="Confirm bookings and assign tables."
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <label className="form-control w-full sm:max-w-xs">
          <span className="label-text">Filter by date</span>
          <input
            type="date"
            className="input input-bordered"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </label>
        <label className="form-control w-full sm:max-w-xs">
          <span className="label-text">Filter by status</span>
          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {RESERVATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div role="alert" className="alert alert-error mb-4 text-sm">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ReservationList
          reservations={reservations}
          tables={tables}
          onConfirm={(r, tableId) =>
            patchReservation(r._id, { status: "confirmed", tableId })
          }
          onCancel={(r) => patchReservation(r._id, { status: "cancelled" })}
          onSeat={(r) => patchReservation(r._id, { status: "seated" })}
          busyId={busyId}
        />
      )}
    </div>
  );
}
