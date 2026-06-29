"use client";

import { useEffect, useState } from "react";
import { MENU_CATEGORIES } from "@/lib/constants";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  available: true,
};

function validateForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required";
  }

  if (form.price === "" || form.price === null || form.price === undefined) {
    errors.price = "Price is required";
  } else {
    const price = Number(form.price);
    if (Number.isNaN(price)) {
      errors.price = "Price must be a number";
    } else if (price < 0) {
      errors.price = "Price cannot be negative";
    }
  }

  if (!form.category.trim()) {
    errors.category = "Category is required";
  }

  return errors;
}

export default function MenuItemForm({ item, onSave, onClose, serverError = "" }) {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [customCategory, setCustomCategory] = useState(false);

  useEffect(() => {
    if (item) {
      const category = item.category || "";
      setForm({
        name: item.name || "",
        description: item.description || "",
        price: item.price != null ? String(item.price) : "",
        category,
        available: item.available !== false,
      });
      setCustomCategory(category !== "" && !MENU_CATEGORIES.includes(category));
    } else {
      setForm(emptyForm);
      setCustomCategory(false);
    }
    setFieldErrors({});
  }, [item]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleCategorySelect(value) {
    if (value === "__other__") {
      setCustomCategory(true);
      handleChange("category", "");
      return;
    }
    setCustomCategory(false);
    handleChange("category", value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      available: form.available,
    });
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">
          {item ? "Edit menu item" : "Add menu item"}
        </h3>

        {serverError && (
          <div role="alert" className="alert alert-error text-sm mb-4">
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control w-full">
            <span className="label-text">Name</span>
            <input
              type="text"
              className={`input input-bordered w-full ${fieldErrors.name ? "input-error" : ""}`}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {fieldErrors.name && (
              <span className="label-text-alt text-error">{fieldErrors.name}</span>
            )}
          </label>

          <label className="form-control w-full">
            <span className="label-text">Description</span>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text">Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`input input-bordered w-full ${fieldErrors.price ? "input-error" : ""}`}
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
            {fieldErrors.price && (
              <span className="label-text-alt text-error">{fieldErrors.price}</span>
            )}
          </label>

          <div className="form-control w-full">
            <span className="label-text">Category</span>
            {customCategory ? (
              <>
                <input
                  type="text"
                  className={`input input-bordered w-full ${fieldErrors.category ? "input-error" : ""}`}
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="Enter custom category"
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs self-start mt-1"
                  onClick={() => {
                    setCustomCategory(false);
                    handleChange("category", MENU_CATEGORIES[0] || "");
                  }}
                >
                  Use preset category
                </button>
              </>
            ) : (
              <select
                className={`select select-bordered w-full ${fieldErrors.category ? "select-error" : ""}`}
                value={form.category}
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {MENU_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__other__">Other…</option>
              </select>
            )}
            {fieldErrors.category && (
              <span className="label-text-alt text-error">{fieldErrors.category}</span>
            )}
          </div>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={form.available}
              onChange={(e) => handleChange("available", e.target.checked)}
            />
            <span className="label-text">Available on menu</span>
          </label>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? "Save changes" : "Add item"}
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
