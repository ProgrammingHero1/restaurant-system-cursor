function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function MenuCard({ item }) {
  const unavailable = item.available === false;

  return (
    <div
      className={`card bg-base-100 shadow-md border border-base-200 ${
        unavailable ? "opacity-50 grayscale" : ""
      }`}
    >
      <div className="card-body p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
          <span className="font-bold text-primary whitespace-nowrap">
            {formatPrice(item.price)}
          </span>
        </div>
        {item.description ? (
          <p className="text-sm text-base-content/70 mt-1">{item.description}</p>
        ) : null}
        {unavailable ? (
          <div className="mt-2">
            <span className="badge badge-ghost badge-sm">Unavailable</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
