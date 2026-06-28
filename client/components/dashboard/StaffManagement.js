"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StaffForm from "@/components/dashboard/StaffForm";
import { api, ApiError } from "@/lib/api";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "active", label: "Status" },
  { key: "actions", label: "Actions" },
];

function RoleBadge({ role }) {
  const variants = {
    admin: "badge-error",
    manager: "badge-warning",
    waiter: "badge-info",
  };
  return (
    <span className={`badge ${variants[role] || "badge-ghost"}`}>
      {role}
    </span>
  );
}

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/staff", { auth: true });
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load staff");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  async function handleSave(form) {
    try {
      if (editing) {
        await api.patch(
          `/api/staff/${editing._id}`,
          form,
          { auth: true }
        );
      } else {
        await api.post("/api/staff", form, { auth: true });
      }
      setShowForm(false);
      setEditing(null);
      await loadStaff();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save staff");
    }
  }

  async function handleDeactivate(member) {
    if (!confirm(`Deactivate ${member.name}?`)) return;
    try {
      await api.patch(
        `/api/staff/${member._id}`,
        { active: false },
        { auth: true }
      );
      await loadStaff();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to deactivate staff");
    }
  }

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(member) {
    setEditing(member);
    setShowForm(true);
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage team members, roles, and access."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>
            Add staff
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
        <DataTable columns={columns} emptyMessage="No staff members yet. Add your first team member.">
          {staff.map((member) => (
            <tr key={member._id}>
              <td className="font-medium">{member.name}</td>
              <td>{member.email}</td>
              <td>
                <RoleBadge role={member.role} />
              </td>
              <td>
                <span className={`badge ${member.active ? "badge-success" : "badge-ghost"}`}>
                  {member.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => openEdit(member)}
                  >
                    Edit
                  </button>
                  {member.active && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleDeactivate(member)}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {showForm && (
        <StaffForm
          staff={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
