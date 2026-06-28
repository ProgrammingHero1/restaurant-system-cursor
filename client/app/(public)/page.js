import Link from "next/link";

export default function HomePage() {
  return (
    <div className="hero min-h-screen bg-base-200">
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
          <p className="mt-8 text-sm opacity-60">
            DaisyUI theme active — <span className="badge badge-primary">corporate</span>
          </p>
        </div>
      </div>
    </div>
  );
}
