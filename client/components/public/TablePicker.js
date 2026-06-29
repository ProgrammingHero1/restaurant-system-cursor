"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api, ApiError } from "@/lib/api";

export default function TablePicker({ value, onChange }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await api.get("/api/tables/available");
        if (!cancelled) {
          setTables(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load tables");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div role="alert" className="alert alert-error text-sm">
        <span>{error}</span>
      </div>
    );
  }

  if (!tables.length) {
    return (
      <p className="text-base-content/70 text-sm">
        No tables available right now. Please ask staff for assistance.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {tables.map((table) => {
        const selected = value === table._id;
        return (
          <button
            key={table._id}
            type="button"
            className={`btn btn-outline h-auto py-4 flex-col gap-1 ${
              selected ? "btn-primary" : ""
            }`}
            onClick={() => onChange(table._id)}
          >
            <span className="font-bold text-lg">Table {table.number}</span>
            <span className="text-xs opacity-80">Seats {table.capacity}</span>
          </button>
        );
      })}
    </div>
  );
}
