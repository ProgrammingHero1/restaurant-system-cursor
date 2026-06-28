import Link from "next/link";

export default function HomePage() {
  return (
    <div className="hero bg-base-200 py-16">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">Restaurant</h1>
          <p className="py-4">Welcome — browse our menu, place an order, or reserve a table.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/menu" className="btn btn-primary">
              Menu
            </Link>
            <Link href="/order" className="btn btn-secondary">
              Order
            </Link>
            <Link href="/reserve" className="btn btn-accent">
              Reserve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
