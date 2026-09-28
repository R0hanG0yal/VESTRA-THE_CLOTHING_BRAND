import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { ProductCard } from "@/components/product/product-card";
import { AddLookButton } from "@/components/product/add-look-button";
import { getLook, getProduct } from "@/lib/data/catalog";
import { discountPercent, formatINR } from "@/lib/utils";
import { IconImage } from "@/components/ui/icon-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const look = getLook(id);
  return { title: look ? `${look.title} — complete look` : "Look" };
}

export default async function LookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = getLook(id);
  if (!look) notFound();

  const items = look.productIds.map(getProduct).filter(Boolean);
  const hero = getProduct(look.heroId) ?? items[0];
  if (!hero) notFound();

  const off = discountPercent(look.mrp, look.bundlePrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left">
      <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
        <Link href="/" className="hover:text-foreground">Index</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">Curated</Link>
        <span>/</span>
        <span className="text-foreground">{look.title}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-start text-left">
        <div className="grid grid-cols-3 grid-rows-2 gap-3 border-l-2 border-foreground pl-4">
          <div className="col-span-3 row-span-2 sm:col-span-2 border border-line bg-ink-900/5">
            <ProductImage
              kind={hero.kind}
              color={hero.colors[0].hex}
              seed={hero.seed}
              image={hero.image}
              alt={hero.name}
              sizes="(min-width: 640px) 40vw, 100vw"
            />
          </div>
          {items.slice(1, 3).map((p) => (
            <div key={p!.id} className="border border-line bg-ink-900/5">
              <ProductImage
                kind={p!.kind}
                color={p!.colors[0].hex}
                seed={p!.seed}
                image={p!.image}
                alt={p!.name}
                sizes="25vw"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 text-left">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <IconImage name="sparkles" alt="Ensemble" className="h-4 w-4 object-cover grayscale" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
              Curated Silhouette // {items.length}-Piece Ensemble
            </span>
          </div>

          <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
            {look.title}
          </h1>

          <p className="mt-2 text-sm text-foreground/60 text-left font-sans">
            {look.vibe} — curated head-to-toe sartorial execution by the Atelier Studio.
          </p>

          <div className="mt-6 flex items-baseline gap-4 border-t border-line pt-6 text-left">
            <span className="font-serif text-3xl font-light tracking-tight text-foreground">{formatINR(look.bundlePrice)}</span>
            <span className="font-mono text-sm text-foreground/40 line-through">{formatINR(look.mrp)}</span>
            {off > 0 && <span className="font-mono text-xs uppercase tracking-wider text-foreground/80 border border-foreground/30 px-2 py-0.5">[{off}% SAVING]</span>}
          </div>
          <p className="mt-2 font-mono text-[11px] text-foreground/60 text-left">
            Ensemble privilege saves {formatINR(look.mrp - look.bundlePrice)} vs unbundled requisition
          </p>

          <div className="mt-8">
            <AddLookButton productIds={look.productIds} />
          </div>

          <div className="mt-10 border-t border-line pt-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 block mb-3">
              Included Specifications
            </span>
            <ul className="divide-y divide-line">
              {items.map((p) => (
                <li key={p!.id} className="flex items-center gap-4 py-3 text-left">
                  <div className="h-14 w-14 shrink-0 overflow-hidden border border-line bg-ink-900/5">
                    <ProductImage
                      kind={p!.kind}
                      color={p!.colors[0].hex}
                      seed={p!.seed}
                      image={p!.image}
                      alt={p!.name}
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <Link href={`/product/${p!.id}`} className="truncate font-serif text-sm font-normal text-foreground hover:underline block text-left">
                      {p!.name}
                    </Link>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45 mt-0.5 text-left">
                      {p!.brand} {"//"} {p!.colors[0].name}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-foreground/80">{formatINR(p!.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-20 border-t border-line pt-12 text-left">
        <div className="mb-8 border-l-2 border-foreground pl-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45">Components</span>
          <h2 className="font-serif text-3xl font-light text-foreground text-left">
            Individual Requisitions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {items.map((p) => (
            <ProductCard key={p!.id} product={p!} />
          ))}
        </div>
      </section>
    </div>
  );
}
