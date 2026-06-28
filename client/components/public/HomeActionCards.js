import Link from "next/link";

const actions = [
  {
    href: "/menu",
    title: "Browse Menu",
    description: "See our starters, mains, drinks, and desserts.",
    btnClass: "btn-primary",
    cta: "View menu",
  },
  {
    href: "/order",
    title: "Place Order",
    description: "Pick a table and order from your phone.",
    btnClass: "btn-secondary",
    cta: "Order now",
  },
  {
    href: "/reserve",
    title: "Reserve a Table",
    description: "Book ahead for your party size and preferred time.",
    btnClass: "btn-accent",
    cta: "Book table",
  },
];

export default function HomeActionCards() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8">What would you like to do?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {actions.map((action) => (
          <div key={action.href} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">{action.title}</h3>
              <p className="text-base-content/70 text-sm flex-1">{action.description}</p>
              <div className="card-actions justify-end mt-4">
                <Link href={action.href} className={`btn btn-sm ${action.btnClass}`}>
                  {action.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
