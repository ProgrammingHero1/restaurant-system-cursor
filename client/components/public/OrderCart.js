"use client";

export default function OrderCart({ items, menuItems, onUpdateQty, onRemove }) {
  const availableItems = menuItems.filter((m) => m.available);

  function addItem(menuItem) {
    const existing = items.find((i) => i.menuItemId === menuItem._id);
    if (existing) {
      onUpdateQty(menuItem._id, existing.qty + 1);
    } else {
      onUpdateQty(menuItem._id, 1);
    }
  }

  const subtotal = items.reduce((sum, entry) => {
    const menuItem = menuItems.find((m) => m._id === entry.menuItemId);
    return sum + (menuItem ? menuItem.price * entry.qty : 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="font-semibold text-lg mb-4">Add items</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-3 p-3 rounded-box border border-base-300 bg-base-100"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-base-content/70">
                  ${Number(item.price).toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm shrink-0"
                onClick={() => addItem(item)}
              >
                Add
              </button>
            </div>
          ))}
          {!availableItems.length && (
            <p className="text-base-content/70 text-sm">No available menu items.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-4">Your order</h2>
        {!items.length ? (
          <p className="text-base-content/70 text-sm">Cart is empty.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((entry) => {
              const menuItem = menuItems.find((m) => m._id === entry.menuItemId);
              if (!menuItem) return null;
              return (
                <li
                  key={entry.menuItemId}
                  className="flex items-center justify-between gap-3 p-3 rounded-box border border-base-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{menuItem.name}</p>
                    <p className="text-sm text-base-content/70">
                      ${Number(menuItem.price).toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-xs btn-circle"
                      onClick={() =>
                        onUpdateQty(entry.menuItemId, Math.max(0, entry.qty - 1))
                      }
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{entry.qty}</span>
                    <button
                      type="button"
                      className="btn btn-xs btn-circle"
                      onClick={() => onUpdateQty(entry.menuItemId, entry.qty + 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => onRemove(entry.menuItemId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="divider" />
        <p className="text-right font-semibold text-lg">
          Subtotal: ${subtotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
