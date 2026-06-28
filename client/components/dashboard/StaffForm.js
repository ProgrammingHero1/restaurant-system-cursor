"use client";

import { useEffect, useState } from "react";
import { STAFF_ROLES } from "@/lib/constants";

const emptyForm = {
  name: "",
  email: "",
  role: "waiter",
  active: true,
};

export default function StaffForm({ staff, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (staff) {
      setForm({
        name: staff.name || "",
        email: staff.email || "",
        role: staff.role || "waiter",
        active: staff.active !== false,
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [staff]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    onSave(form);
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {staff ? "Edit staff member" : "Add staff member"}
        </h3>

        {error && (
          <div role="alert" className="alert alert-error text-sm mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control w-full">
            <span className="label-text">Name</span>
            <input
              type="text"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text">Email</span>
            <input
              type="email"
              className="input input-bordered w-full"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text">Role</span>
            <select
              className="select select-bordered w-full"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={form.active}
              onChange={(e) => handleChange("active", e.target.checked)}
            />
            <span className="label-text">Active</span>
          </label>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {staff ? "Save changes" : "Add staff"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
