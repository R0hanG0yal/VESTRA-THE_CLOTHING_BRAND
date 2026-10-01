import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductCard } from "@/components/product/product-card";
import { getCategory, productsBySlot } from "@/lib/data/catalog";
import { getProductById, listProducts } from "@/lib/data/products-repo";
import { IconImage } from "@/components/ui/icon-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product?.name ?? "Piece",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, all] = await Promise.all([getProductById(id), listProducts()]);
  if (!product) notFound();

  const category = getCategory(product.category);

  // "Complete the look" — pull one item from each accessory slot.
  const slots = ["footwear", "bag", "watch", "eyewear"] as const;
  const accessories = slots
    .map((slot) => productsBySlot(slot, product.id)[product.seed % productsBySlot(slot).length])
    .filter(Boolean);

  const related = all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-6 font-mono text-[10px] uppercase tracking-widest text-foreground/50 sm:px-6 lg:px-8 text-left">
        <Link href="/" className="hover:text-foreground">Index</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">Catalog</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pb-32 sm:pb-36 lg:px-8 text-left">
        <ProductDetail product={product} />

        {/* Complete the look */}
        {accessories.length > 0 && (
          <section className="mt-24 border-t border-line pt-12 text-left">
            <div className="mb-8 border-l-2 border-foreground pl-4 flex items-center justify-between text-left">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
                  Harmonized Requisition
                </span>
                <h2 className="mt-1 font-serif text-3xl font-light text-foreground text-left">
                  Complementary Accoutrements
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <IconImage name="palette" alt="Curated" className="h-5 w-5 object-cover grayscale" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
                  Styled by Atelier
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-12">
              {accessories.map((p) => (
                <ProductCard key={p!.id} product={p!} />
              ))}
            </div>
          </section>
        )}

        {/* Look suggestions */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-line pt-12 text-left">
            <div className="mb-8 border-l-2 border-foreground pl-4 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
                Category Lineage
              </span>
              <h2 className="mt-1 font-serif text-3xl font-light text-foreground text-left">
                Parallel Silhouettes
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-12">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
