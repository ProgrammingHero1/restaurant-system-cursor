import Link from "next/link";
import MenuCategorySection from "@/components/public/MenuCategorySection";
import { api } from "@/lib/api";
import { MENU_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function groupByCategory(items) {
  const grouped = new Map();

  for (const item of items) {
    const category = item.category || "Other";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category).push(item);
  }

  const ordered = [];

  for (const category of MENU_CATEGORIES) {
    if (grouped.has(category)) {
      ordered.push({ category, items: grouped.get(category) });
      grouped.delete(category);
    }
  }

  for (const [category, categoryItems] of grouped) {
    ordered.push({ category, items: categoryItems });
  }

  return ordered;
}

export default async function MenuPage() {
  let items = [];
  let fetchError = null;

  try {
    items = await api.get("/api/menu-items");
  } catch (err) {
    fetchError = err.message || "Failed to load menu";
  }

  const sections = groupByCategory(items);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-1">
            Our menu
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">Browse &amp; order</h1>
          <p className="text-base-content/70 mt-2 max-w-xl">
            Fresh dishes made in-house. When you&apos;re ready, head to order and pick your table.
          </p>
        </div>
        <Link href="/order" className="btn btn-primary shrink-0">
          Order now
        </Link>
      </div>

      {fetchError ? (
        <div role="alert" className="alert alert-error mb-8">
          <span>{fetchError}</span>
        </div>
      ) : null}

      {!fetchError && sections.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-base-content/70">No menu items yet. Check back soon.</p>
        </div>
      ) : null}

      {sections.length > 0 ? (
        <>
          <nav className="flex flex-wrap gap-2 mb-10">
            {sections.map(({ category }) => (
              <a
                key={category}
                href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
                className="btn btn-sm btn-outline"
              >
                {category}
              </a>
            ))}
          </nav>

          <div className="space-y-12">
            {sections.map(({ category, items: categoryItems }) => (
              <MenuCategorySection
                key={category}
                category={category}
                items={categoryItems}
              />
            ))}
          </div>

          <div className="mt-16 text-center border-t border-base-300 pt-10">
            <p className="text-base-content/70 mb-4">
              Ready to order from your table?
            </p>
            <Link href="/order" className="btn btn-primary">
              Order now
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
