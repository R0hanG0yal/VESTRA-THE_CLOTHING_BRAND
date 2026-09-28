import type { Metadata } from "next";
import { ShopWorkspace } from "@/components/shop/shop-workspace";
import { emptyFilters, parseFilters } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Filter by vibe, colour, fit and more — a feed that never stops loading.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }

  const filters = params.toString() ? parseFilters(params) : emptyFilters();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {filters.q ? `“${filters.q}”` : "The whole wardrobe"}
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Modern filters, endless scroll, zero dead ends.
          </p>
        </div>
      </section>
      <div className="py-6">
        <ShopWorkspace initialFilters={filters} />
      </div>
    </>
  );
}
