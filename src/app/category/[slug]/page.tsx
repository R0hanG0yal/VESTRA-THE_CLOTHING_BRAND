import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { ShopWorkspace } from "@/components/shop/shop-workspace";
import { CATEGORIES, getCategory } from "@/lib/data/catalog";
import { imageFor } from "@/lib/data/product-images";
import { emptyFilters } from "@/lib/filters";
import { IconImage } from "@/components/ui/icon-image";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  return {
    title: category?.name ?? "Collection",
    description: category?.blurb,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const siblings = CATEGORIES.filter((c) => c.slug !== slug).slice(0, 8);

  return (
    <>
      <section className="border-b border-line bg-surface text-left">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-left">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors"
          >
            <IconImage name="arrow" alt="Back" className="h-4 w-4 object-cover grayscale" />
            <span>Archive Index // Back to all collections</span>
          </Link>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-end gap-6 text-left border-l-2 border-foreground pl-6">
            <div className="h-24 w-24 shrink-0 overflow-hidden border border-line bg-ink-900/5">
              <ProductImage
                kind={category.kind}
                color="#c8a96b"
                seed={category.slug.length * 7}
                image={imageFor(category.kind, 0)}
                alt={category.name}
                sizes="96px"
              />
            </div>
            <div className="text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 block">
                Department // {category.slug}
              </span>
              <h1 className="mt-1 font-serif text-4xl font-light tracking-tight sm:text-5xl text-foreground text-left">
                {category.name}
              </h1>
              <p className="mt-2 text-sm text-foreground/60 max-w-xl text-left font-sans">
                {category.blurb}
              </p>
            </div>
          </div>

          <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-1 text-left border-t border-line pt-4">
            {siblings.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="shrink-0 border border-line bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-foreground/70 transition hover:border-foreground hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="py-6 text-left">
        <ShopWorkspace initialFilters={emptyFilters({ category: slug })} syncUrl={false} />
      </div>
    </>
  );
}
