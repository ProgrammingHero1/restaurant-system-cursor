import StatusBadge from "@/components/ui/StatusBadge";

function formatPrice(value) {
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `$${n.toFixed(2)}`;
}

export default function BillSummary({ bill }) {
  return (
    <div className="max-w-lg mx-auto card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Your bill</h1>
            {bill.tableNumber != null && (
              <p className="text-base-content/70">Table {bill.tableNumber}</p>
            )}
          </div>
          <StatusBadge status={bill.paymentStatus} type="payment" />
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(bill.lineItems || []).map((line, i) => (
                <tr key={i}>
                  <td>{line.name}</td>
                  <td className="text-right">{line.qty}</td>
                  <td className="text-right">{formatPrice(line.price)}</td>
                  <td className="text-right">
                    {formatPrice(line.lineTotal ?? line.price * line.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divider my-2" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-base-content/70">Subtotal</dt>
            <dd>{formatPrice(bill.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-base-content/70">
              Tax ({((bill.taxRate ?? 0) * 100).toFixed(0)}%)
            </dt>
            <dd>{formatPrice(bill.tax)}</dd>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-base-300">
            <dt>Total</dt>
            <dd>{formatPrice(bill.total)}</dd>
          </div>
        </dl>

        {bill.paymentStatus === "paid" ? (
          <p className="text-success text-sm mt-4">This bill has been paid. Thank you!</p>
        ) : (
          <p className="text-base-content/70 text-sm mt-4">
            Please pay at the counter when ready.
          </p>
        )}
      </div>
    </div>
  );
}
