"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MenuItemForm from "@/components/dashboard/MenuItemForm";
import { api, ApiError } from "@/lib/api";

const columns = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price" },
  { key: "available", label: "Available" },
  { key: "actions", label: "Actions" },
];

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return "—";
  return `$${value.toFixed(2)}`;
}

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/menu-items");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load menu items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleSave(form) {
    setFormError("");
    try {
      if (editing) {
        await api.patch(`/api/menu-items/${editing._id}`, form, { auth: true });
      } else {
        await api.post("/api/menu-items", form, { auth: true });
      }
      setShowForm(false);
      setEditing(null);
      await loadItems();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save menu item");
    }
  }

  async function handleToggleAvailable(item) {
    setTogglingId(item._id);
    setError("");
    try {
      await api.patch(
        `/api/menu-items/${item._id}`,
        { available: !item.available },
        { auth: true }
      );
      await loadItems();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update availability");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/api/menu-items/${item._id}`, { auth: true });
      await loadItems();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete menu item");
    }
  }

  function openAdd() {
    setFormError("");
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setFormError("");
    setEditing(item);
    setShowForm(true);
  }

  return (
    <div>
      <PageHeader
        title="Menu Management"
        description="Create, edit, and manage items on your restaurant menu."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>
            Add menu item
          </button>
        }
      />

      {error && (
        <div role="alert" className="alert alert-error mb-4 text-sm">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable columns={columns} emptyMessage="No menu items yet. Add your first dish.">
          {items.map((item) => (
            <tr key={item._id}>
              <td className="font-medium">{item.name}</td>
              <td>{item.category}</td>
              <td>{formatPrice(item.price)}</td>
              <td>
                <span className={`badge ${item.available ? "badge-success" : "badge-ghost"}`}>
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </td>
              <td>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => openEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    disabled={togglingId === item._id}
                    onClick={() => handleToggleAvailable(item)}
                  >
                    {item.available ? "Mark unavailable" : "Mark available"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {showForm && (
        <MenuItemForm
          item={editing}
          serverError={formError}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            setFormError("");
          }}
        />
      )}
    </div>
  );
}
