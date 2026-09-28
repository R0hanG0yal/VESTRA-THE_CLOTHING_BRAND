"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { IconImage } from "@/components/ui/icon-image";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { getProduct } from "@/lib/data/catalog";
import { cn, discountPercent, formatINR } from "@/lib/utils";
import type { Look } from "@/lib/types";

export function LookCard({ look, className }: { look: Look; className?: string }) {
  const { add } = useCart();
  const { push } = useToast();
  const items = look.productIds.map(getProduct).filter(Boolean);
  const hero = getProduct(look.heroId) ?? items[0];

  const off = discountPercent(look.mrp, look.bundlePrice);

  function addAll() {
    items.forEach((p) => {
      if (!p) return;
      add({
        productId: p.id,
        name: p.name,
        price: p.price,
        mrp: p.mrp,
        size: p.sizes[Math.min(2, p.sizes.length - 1)],
        color: p.colors[0].name,
        colorHex: p.colors[0].hex,
        kind: p.kind,
        seed: p.seed,
        image: p.image,
      });
    });
    push({
      title: "Complete Look Archived",
      description: `${items.length} pieces · ${look.title}`,
      variant: "success",
    });
  }

  if (!hero) return null;

  return (
    <article
      className={cn(
        "group relative flex flex-col text-left border-b border-foreground/15 pb-6",
        className,
      )}
    >
      <Link href={`/look/${look.id}`} className="relative block aspect-[4/5] overflow-hidden bg-surface-muted">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-foreground/15">
          <div className="relative col-span-2 row-span-2 sm:col-span-1 sm:row-span-2">
            <ProductImage
              kind={hero.kind}
              color={hero.colors[0].hex}
              seed={hero.seed}
              image={hero.image}
              alt={hero.name}
              sizes="(min-width: 640px) 25vw, 50vw"
            />
          </div>
          {items.slice(1, 4).map((p) => (
            <div key={p!.id} className="relative bg-surface-muted">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Editorial Badge with photo indicator */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-white/20 bg-black/85 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white text-left">
          <IconImage type="layers" size={12} className="border-none" />
          {items.length}-PIECE ENSEMBLE
        </div>

        <div className="absolute inset-x-3 bottom-3 text-left text-white">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/70 text-left">
            EDITION · {look.vibe}
          </p>
          <h3 className="mt-0.5 font-serif text-xl leading-tight text-white text-left">
            {look.title}
          </h3>
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3 text-left">
        <div className="text-left">
          <div className="flex items-baseline gap-2 text-left">
            <span className="font-mono text-sm font-semibold text-foreground text-left">
              {formatINR(look.bundlePrice)}
            </span>
            <span className="font-mono text-xs text-foreground/40 line-through text-left">
              {formatINR(look.mrp)}
            </span>
            {off > 0 && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground text-left">
                [{off}% BUNDLE REDUCTION]
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-foreground/50 text-left">
            ALL {items.length} ARCHIVAL PIECES INCLUDED
          </p>
        </div>
        <button
          onClick={addAll}
          className="flex items-center justify-center border border-foreground bg-foreground px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-background transition hover:opacity-90 shrink-0 text-center font-bold"
        >
          <span>ACQUIRE ALL</span>
        </button>
      </div>
    </article>
  );
}
