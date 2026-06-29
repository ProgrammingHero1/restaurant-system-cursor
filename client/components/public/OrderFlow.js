"use client";

import { useEffect, useState } from "react";
import TablePicker from "@/components/public/TablePicker";
import OrderCart from "@/components/public/OrderCart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api, ApiError } from "@/lib/api";

export default function OrderFlow() {
  const [step, setStep] = useState(1);
  const [tableId, setTableId] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await api.get("/api/menu-items?available=true");
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load menu");
      } finally {
        setLoadingMenu(false);
      }
    }
    loadMenu();
  }, []);

  function updateQty(menuItemId, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, qty } : i
        );
      }
      return [...prev, { menuItemId, qty }];
    });
  }

  function removeItem(menuItemId) {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!tableId) {
      setError("Please select a table.");
      return;
    }
    if (!cart.length) {
      setError("Please add at least one item.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.post("/api/orders", {
        tableId,
        items: cart.map(({ menuItemId, qty }) => ({ menuItemId, qty })),
        customerName,
        notes,
      });
      setSuccess(order);
      setStep(3);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (success && step === 3) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div role="status" className="alert alert-success mb-6">
          <span>Order placed successfully!</span>
        </div>
        <p className="text-lg font-semibold mb-2">
          Table {success.tableNumber}
        </p>
        <p className="text-base-content/70 mb-4">
          Order ID: {success._id}
        </p>
        <p className="text-sm text-base-content/60">
          Your order is pending. Staff will begin preparation shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      <div className="steps w-full mb-8">
        <div className={`step ${step >= 1 ? "step-primary" : ""}`}>Table</div>
        <div className={`step ${step >= 2 ? "step-primary" : ""}`}>Items</div>
        <div className={`step ${step >= 3 ? "step-primary" : ""}`}>Confirm</div>
      </div>

      {step === 1 && (
        <section>
          <h2 className="font-semibold text-xl mb-4">Select your table</h2>
          <TablePicker value={tableId} onChange={setTableId} />
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!tableId}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          {loadingMenu ? (
            <LoadingSpinner />
          ) : (
            <>
              <OrderCart
                items={cart}
                menuItems={menuItems}
                onUpdateQty={updateQty}
                onRemove={removeItem}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <label className="form-control">
                  <span className="label-text">Name (optional)</span>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </label>
                <label className="form-control sm:col-span-2">
                  <span className="label-text">Notes (optional)</span>
                  <textarea
                    className="textarea textarea-bordered"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-between">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !cart.length}
                >
                  {submitting ? "Placing order…" : "Place order"}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </form>
  );
}
