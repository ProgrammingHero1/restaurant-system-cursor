"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { isStripeEnabled } from "@/lib/payments";

export default function BillPaymentSection({ billId, initialPaymentStatus, paymentResult }) {
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshBill = useCallback(async () => {
    try {
      const bill = await api.get(`/api/bills/${billId}`);
      setPaymentStatus(bill.paymentStatus);
    } catch {
      // ignore poll errors
    }
  }, [billId]);

  useEffect(() => {
    api
      .get("/api/payments/config")
      .then((config) => setStripeEnabled(isStripeEnabled(config)))
      .catch(() => setStripeEnabled(false));
  }, []);

  useEffect(() => {
    if (paymentResult !== "success" || paymentStatus === "paid") return undefined;

    refreshBill();
    const interval = setInterval(refreshBill, 2000);
    return () => clearInterval(interval);
  }, [paymentResult, paymentStatus, refreshBill]);

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const data = await api.post(`/api/bills/${billId}/checkout-session`, {});
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError("Could not start checkout. Please try again.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to start payment");
    } finally {
      setLoading(false);
    }
  }

  if (paymentStatus === "paid") {
    return (
      <p className="text-success text-sm mt-4">This bill has been paid. Thank you!</p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {paymentResult === "success" && (
        <div role="status" className="alert alert-info text-sm">
          <span>Payment submitted. This page will update when Stripe confirms payment.</span>
        </div>
      )}
      {paymentResult === "canceled" && (
        <div role="alert" className="alert alert-warning text-sm">
          <span>Payment was canceled. You can try again when ready.</span>
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}
      {stripeEnabled ? (
        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={loading}
          onClick={handlePay}
        >
          {loading ? "Redirecting to Stripe…" : "Pay with card"}
        </button>
      ) : (
        <p className="text-base-content/70 text-sm">
          Please pay at the counter when ready. Online card payment will appear here once
          Stripe is configured.
        </p>
      )}
    </div>
  );
}
