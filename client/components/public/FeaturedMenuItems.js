import Link from "next/link";
import MenuCard from "@/components/public/MenuCard";

export default function FeaturedMenuItems({ items }) {
  if (!items?.length) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Featured dishes</h2>
          <p className="text-base-content/70 text-sm mt-1">
            A taste of what&apos;s on the menu tonight
          </p>
        </div>
        <Link href="/menu" className="btn btn-outline btn-sm self-start">
          See full menu
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
