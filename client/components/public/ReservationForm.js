"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";

export default function ReservationForm() {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    partySize: "2",
    date: "",
    time: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.date || !form.time) {
      setError("Please select a date and time.");
      return;
    }
    const dateTime = new Date(`${form.date}T${form.time}`).toISOString();
    setSubmitting(true);
    try {
      await api.post("/api/reservations", {
        customerName: form.customerName,
        phone: form.phone,
        partySize: Number(form.partySize),
        dateTime,
        notes: form.notes,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit reservation");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div role="status" className="alert alert-success mb-4">
          <span>Reservation request received!</span>
        </div>
        <p className="text-base-content/70">
          Your booking is <strong>pending confirmation</strong>. Our team will contact
          you by phone to confirm your table.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      {error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}
      <label className="form-control w-full">
        <span className="label-text">Your name</span>
        <input
          type="text"
          className="input input-bordered w-full"
          value={form.customerName}
          onChange={(e) => update("customerName", e.target.value)}
          required
        />
      </label>
      <label className="form-control w-full">
        <span className="label-text">Phone</span>
        <input
          type="tel"
          className="input input-bordered w-full"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
        />
      </label>
      <label className="form-control w-full">
        <span className="label-text">Party size</span>
        <input
          type="number"
          min="1"
          className="input input-bordered w-full"
          value={form.partySize}
          onChange={(e) => update("partySize", e.target.value)}
          required
        />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="form-control w-full">
          <span className="label-text">Date</span>
          <input
            type="date"
            className="input input-bordered w-full"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </label>
        <label className="form-control w-full">
          <span className="label-text">Time</span>
          <input
            type="time"
            className="input input-bordered w-full"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
            required
          />
        </label>
      </div>
      <label className="form-control w-full">
        <span className="label-text">Notes (optional)</span>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Request reservation"}
      </button>
    </form>
  );
}
