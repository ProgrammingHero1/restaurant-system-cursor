import MenuCard from "./MenuCard";

export default function MenuCategorySection({ category, items }) {
  if (!items.length) return null;

  return (
    <section className="scroll-mt-24" id={category.toLowerCase().replace(/\s+/g, "-")}>
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-base-300">
        {category}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <MenuCard key={String(item._id)} item={item} />
        ))}
      </div>
    </section>
  );
}
