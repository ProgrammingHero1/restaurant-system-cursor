"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TableGrid from "@/components/dashboard/TableGrid";
import { api, ApiError } from "@/lib/api";

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ number: "", capacity: "" });
  const [formError, setFormError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/tables", { auth: true });
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tables");
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const summary = useMemo(() => {
    return tables.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      },
      { available: 0, occupied: 0, reserved: 0 }
    );
  }, [tables]);

  function openAdd() {
    setEditing(null);
    setForm({ number: "", capacity: "" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(table) {
    setEditing(table);
    setForm({ number: String(table.number), capacity: String(table.capacity) });
    setFormError("");
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    const payload = {
      number: Number(form.number),
      capacity: Number(form.capacity),
    };
    try {
      if (editing) {
        await api.patch(`/api/tables/${editing._id}`, payload, { auth: true });
      } else {
        await api.post("/api/tables", payload, { auth: true });
      }
      setShowForm(false);
      setEditing(null);
      await loadTables();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save table");
    }
  }

  async function handleStatusChange(table, status) {
    setUpdatingId(table._id);
    setError("");
    try {
      await api.patch(`/api/tables/${table._id}`, { status }, { auth: true });
      await loadTables();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Tables"
        description="Manage floor layout and table availability."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>
            Add table
          </button>
        }
      />

      <div className="stats stats-vertical sm:stats-horizontal shadow mb-6 w-full bg-base-100 border border-base-300">
        <div className="stat py-3">
          <div className="stat-title text-xs">Available</div>
          <div className="stat-value text-success text-2xl">{summary.available}</div>
        </div>
        <div className="stat py-3">
          <div className="stat-title text-xs">Occupied</div>
          <div className="stat-value text-warning text-2xl">{summary.occupied}</div>
        </div>
        <div className="stat py-3">
          <div className="stat-title text-xs">Reserved</div>
          <div className="stat-value text-info text-2xl">{summary.reserved}</div>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error mb-4 text-sm">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <TableGrid
          tables={tables}
          onEdit={openEdit}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
        />
      )}

      {showForm && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editing ? `Edit table ${editing.number}` : "Add table"}
            </h3>
            {formError && (
              <div role="alert" className="alert alert-error mb-4 text-sm">
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <label className="form-control w-full">
                <span className="label-text">Table number</span>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  required
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text">Capacity</span>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  required
                />
              </label>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setShowForm(false)}>
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
