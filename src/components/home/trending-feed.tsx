"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { LookCard } from "@/components/product/look-card";
import { IconImage } from "@/components/ui/icon-image";
import { useInfiniteProducts } from "@/hooks/use-infinite-products";
import { LOOKS } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "trending", label: "RUNWAY POPULARITY", query: "sort=trending", code: "01" },
  { id: "new", label: "AUTUMN ARCHIVE DROPS", query: "sort=new", code: "02" },
  { id: "deals", label: "ACCESSIBLE SILHOUETTES", query: "sort=discount&maxPrice=999", code: "03" },
  { id: "rating", label: "ATELIER CURATOR CHOICE", query: "sort=rating&minRating=4.5", code: "04" },
];

export function TrendingFeed() {
  const [tab, setTab] = useState(TABS[0]);
  const { items, loading, loadingMore, hasMore, sentinelRef } =
    useInfiniteProducts(tab.query);

  const chunks = useMemo(() => {
    const out: Array<
      | { type: "products"; key: string; products: typeof items }
      | { type: "look"; key: string; look: (typeof LOOKS)[number] }
    > = [];
    items.forEach((p, i) => {
      out.push({ type: "products", key: `${p.id}-${i}`, products: [p] });
      if ((i + 1) % 6 === 0) {
        const look = LOOKS[Math.floor(i / 6) % LOOKS.length];
        out.push({ type: "look", key: `look-${i}`, look });
      }
    });
    return out;
  }, [items]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 text-left sm:px-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-6 border-b border-foreground/15 pb-6 text-left sm:flex-row sm:items-end">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 border border-foreground/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground text-left">
            <IconImage type="flame" size={12} className="border-none" />
            <span>CONTINUOUS RUNWAY FEED</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-foreground text-left sm:text-4xl lg:text-5xl">
            Live Atelier Catalogue & Lookbook
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-foreground/50 text-left">
            EXHAUSTIVE GARMENT ARCHIVE · CONTINUOUS LOAD AS YOU EXPLORE
          </p>
        </div>

        {/* Editorial Filter Tabs */}
        <div className="no-scrollbar flex w-full flex-wrap gap-2 text-left sm:w-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t)}
              className={cn(
                "border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition text-left",
                tab.id === t.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/20 text-foreground/70 hover:border-foreground",
              )}
            >
              <span className="text-[10px] opacity-60 mr-1.5">{t.code}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-10 text-left">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4 text-left">
              <div className="skeleton aspect-[3/4] w-full rounded-xl" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-10 text-left">
          {chunks.map((chunk, chunkIndex) =>
            chunk.type === "look" ? (
              <LookCard
                key={chunk.key}
                look={chunk.look}
                className="col-span-2 lg:col-span-1"
              />
            ) : (
              <ProductCard
                key={chunk.key}
                product={chunk.products[0]}
                priority={chunkIndex < 4}
              />
            ),
          )}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" aria-hidden />

      {loadingMore && (
        <div className="mt-10 flex items-center gap-2 text-left font-mono text-xs uppercase tracking-widest text-foreground/60">
          <IconImage type="check" size={14} className="border-none" />
          <span>LOADING SUBSEQUENT PIECES FROM ARCHIVE...</span>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="mt-12 border-t border-foreground/15 pt-6 text-left font-mono text-xs uppercase tracking-[0.2em] text-foreground/45">
          [ END OF RUNWAY ARCHIVE — ALL PUBLISHED PIECES PRESENTED ]
        </p>
      )}
    </section>
  );
}
