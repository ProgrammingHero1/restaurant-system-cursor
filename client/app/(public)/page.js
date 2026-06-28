import Link from "next/link";
import HomeActionCards from "@/components/public/HomeActionCards";

export default function HomePage() {
  return (
    <>
      <div className="hero bg-base-200 py-16 md:py-24">
        <div className="hero-content text-center px-4">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">
              Welcome
            </p>
            <h1 className="text-4xl md:text-5xl font-bold">The Corner Kitchen</h1>
            <p className="py-6 text-base-content/80 text-lg">
              Fresh food, warm service, and a relaxed dining experience.
              Browse our menu, order at your table, or reserve ahead — all in a few taps.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/menu" className="btn btn-primary">
                View menu
              </Link>
              <Link href="/order" className="btn btn-outline">
                Order at table
              </Link>
            </div>
          </div>
        </div>
      </div>

      <HomeActionCards />

      <section className="bg-base-100 border-t border-base-300 py-10">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-xl font-semibold mb-2">Dining with us tonight?</h2>
          <p className="text-base-content/70 text-sm mb-4">
            Reserve a table for groups of any size. Walk-ins are always welcome when seats are available.
          </p>
          <Link href="/reserve" className="btn btn-accent btn-sm">
            Make a reservation
          </Link>
        </div>
      </section>
    </>
  );
}
