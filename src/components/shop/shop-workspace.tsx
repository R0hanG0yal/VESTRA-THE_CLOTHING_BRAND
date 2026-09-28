"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { LookCard } from "@/components/product/look-card";
import { FilterPanel } from "@/components/shop/filter-panel";
import { IconImage } from "@/components/ui/icon-image";
import { useInfiniteProducts } from "@/hooks/use-infinite-products";
import {
  FILTER_GROUPS,
  PRICE_MAX,
  countActiveFilters,
  serializeFilters,
  type ShopFilters,
} from "@/lib/filters";
import { LOOKS } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 text-left">
          <div className="skeleton aspect-[3/4] w-full" />
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-3 w-2/3" />
        </div>
      ))}
    </>
  );
}

const SORT_DESCRIPTIONS: Record<string, string> = {
  trending: "Curated demand & atelier highlights",
  new: "Fresh cuts & newest season releases",
  "price-asc": "Accessible entry & foundation items",
  "price-desc": "Haute couture & luxury tailoring",
  discount: "Exclusive atelier price privileges",
  rating: "Highest 5★ patron connoisseur marks",
};

export function ShopWorkspace({
  initialFilters,
  syncUrl = true,
}: {
  initialFilters: ShopFilters;
  syncUrl?: boolean;
}) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<ShopFilters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [desktopSortOpen, setDesktopSortOpen] = useState(false);
  const [gridDensity, setGridDensity] = useState<2 | 3 | 4>(3);

  const bottomBarRef = useRef<HTMLDivElement>(null);
  const desktopSortRef = useRef<HTMLDivElement>(null);

  const query = useMemo(() => serializeFilters(filters), [filters]);
  const { items, loading, loadingMore, hasMore, total, error, sentinelRef, retry } =
    useInfiniteProducts(query);

  const activeCount = countActiveFilters(filters);

  const currentSortLabel = useMemo(() => {
    const found = FILTER_GROUPS.sorts.find((s) => s.value === filters.sort);
    return found ? found.label : "Trending";
  }, [filters.sort]);

  // Load saved grid density preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vestra_grid_density");
      if (saved === "2" || saved === "3" || saved === "4") {
        setGridDensity(Number(saved) as 2 | 3 | 4);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const handleSetDensity = (density: 2 | 3 | 4) => {
    setGridDensity(density);
    try {
      localStorage.setItem("vestra_grid_density", String(density));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!syncUrl) return;
    const next = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, "", next);
  }, [query, pathname, syncUrl]);

  // Handle outside click to close expanding panels and desktop sort dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bottomBarRef.current && !bottomBarRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
        setSortOpen(false);
      }
      if (desktopSortRef.current && !desktopSortRef.current.contains(e.target as Node)) {
        setDesktopSortOpen(false);
      }
    };
    if (filtersOpen || sortOpen || desktopSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filtersOpen, sortOpen, desktopSortOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFiltersOpen(false);
        setSortOpen(false);
        setDesktopSortOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const update = useCallback((next: ShopFilters) => setFilters(next), []);
  const featuredLooks = useMemo(() => LOOKS.slice(0, 4), []);

  const resetFilters = useCallback(() => {
    update({
      ...filters,
      gender: "all",
      vibes: [],
      occasions: [],
      fits: [],
      colors: [],
      sizes: [],
      sustainability: [],
      minPrice: 0,
      maxPrice: PRICE_MAX,
      minRating: 0,
      minDiscount: 0,
    });
  }, [filters, update]);

  return (
    <div className="mx-auto max-w-7xl px-4 text-left sm:px-6">
      <div className="lg:grid lg:grid-cols-[290px_1fr] lg:gap-10">
        {/* Desktop filter rail - Frosted Glass Luxury Panel */}
        <aside className="hidden lg:block text-left">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-white/40 dark:border-white/15 bg-white/40 dark:bg-white/[0.04] backdrop-blur-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-left custom-scrollbar">
            <FilterPanel filters={filters} onChange={update} />
          </div>
        </aside>

        <div className="text-left">
          {/* Desktop Top Editorial Toolbar */}
          <div className="hidden lg:flex flex-col gap-4 mb-6 pb-4 border-b border-foreground/10 text-left">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Silhouettes Registry count with subtle live pulse indicator */}
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                </span>
                <div>
                  <p className="label-ui text-xs tracking-[0.2em] text-foreground font-bold">
                    <span className="font-extrabold text-foreground">{total}</span> SILHOUETTES CATALOGUED
                  </p>
                  {filters.q && (
                    <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/60 mt-0.5">
                      FILTERED BY SEARCH: “{filters.q}”
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Grid Density Switcher & Bespoke Sort Dropdown */}
              <div className="flex items-center gap-4 text-left">
                {/* Grid Density View Switcher */}
                <div className="flex items-center gap-1.5 rounded-full border border-foreground/15 bg-white/40 dark:bg-white/[0.04] p-1 shadow-xs backdrop-blur-md">
                  <span className="px-2 font-mono text-[9px] uppercase tracking-widest text-foreground/50 font-bold">
                    VIEW:
                  </span>
                  {([2, 3, 4] as const).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => handleSetDensity(density)}
                      aria-label={`${density} column grid view`}
                      title={`${density} Columns View`}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer",
                        gridDensity === density
                          ? "bg-foreground text-background shadow-xs font-bold"
                          : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                      )}
                    >
                      {/* Geometric multi-column icons */}
                      <div className="flex items-center gap-[2px]">
                        {Array.from({ length: density }).map((_, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "h-3.5 rounded-[1px]",
                              density === 2 ? "w-1.5" : density === 3 ? "w-1" : "w-[3px]",
                              gridDensity === density ? "bg-background" : "bg-foreground/70"
                            )}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bespoke Luxury Sort Dropdown */}
                <div ref={desktopSortRef} className="relative text-left">
                  <button
                    type="button"
                    onClick={() => setDesktopSortOpen((v) => !v)}
                    aria-expanded={desktopSortOpen}
                    aria-label="Toggle sort order menu"
                    className={cn(
                      "flex items-center gap-2.5 rounded-full border px-4 py-2 transition-all cursor-pointer backdrop-blur-xl shadow-xs",
                      desktopSortOpen
                        ? "bg-foreground text-background border-foreground font-bold shadow-md"
                        : "border-foreground/20 bg-white/40 dark:bg-white/[0.04] hover:bg-foreground/10 text-foreground font-semibold"
                    )}
                  >
                    <span className="label-ui text-[9px] tracking-widest opacity-60 font-bold">
                      SORT:
                    </span>
                    <span className="font-mono text-xs uppercase font-bold tracking-wider">
                      {currentSortLabel}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[9px] transition-transform duration-200",
                        desktopSortOpen ? "rotate-180" : "rotate-0"
                      )}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </button>

                  {/* Popover Menu with Descriptions */}
                  {desktopSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/30 dark:border-white/15 bg-background/95 dark:bg-neutral-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in text-left">
                      <div className="px-3 py-2 border-b border-foreground/10 mb-1 flex items-center justify-between">
                        <span className="label-ui text-[9px] tracking-[0.2em] font-bold text-foreground/60 uppercase">
                          ARCHIVE ORDER
                        </span>
                        <span className="font-mono text-[9px] text-accent font-bold">6 OPTIONS</span>
                      </div>
                      <div className="space-y-1">
                        {FILTER_GROUPS.sorts.map((s) => {
                          const isSelected = filters.sort === s.value;
                          const desc = SORT_DESCRIPTIONS[s.value];
                          return (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => {
                                update({ ...filters, sort: s.value });
                                setDesktopSortOpen(false);
                              }}
                              className={cn(
                                "w-full rounded-xl px-3 py-2 text-left transition-all cursor-pointer flex items-start justify-between gap-2 border",
                                isSelected
                                  ? "bg-foreground text-background border-foreground font-bold shadow-xs"
                                  : "border-transparent hover:bg-foreground/10 text-foreground"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-xs uppercase font-bold tracking-wider leading-tight">
                                  {s.label}
                                </p>
                                {desc && (
                                  <p
                                    className={cn(
                                      "text-[10px] mt-0.5 leading-snug line-clamp-1 font-serif",
                                      isSelected ? "text-background/80" : "text-foreground/60"
                                    )}
                                  >
                                    {desc}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <span className="shrink-0 text-accent font-bold text-xs">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Quick-Filter Ribbon (One-click instant refinement) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-left">
              <span className="label-ui text-[9px] uppercase tracking-widest text-foreground/50 font-bold shrink-0">
                QUICK FILTERS:
              </span>

              {/* Femme / Homme / Unisex Quick Toggles */}
              {[
                { value: "women", label: "Femme" },
                { value: "men", label: "Homme" },
                { value: "unisex", label: "Unisex" },
              ].map((g) => {
                const isActive = filters.gender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => update({ ...filters, gender: isActive ? "all" : g.value })}
                    className={cn(
                      "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 shrink-0 border cursor-pointer",
                      isActive
                        ? "bg-foreground text-background border-foreground font-bold shadow-xs scale-[1.03]"
                        : "bg-white/40 dark:bg-white/[0.04] border-foreground/15 text-foreground hover:bg-foreground/10"
                    )}
                  >
                    {g.label} {isActive && "✓"}
                  </button>
                );
              })}

              {/* Vibe Pills */}
              {["minimalist", "architectural", "tailored", "avantgarde"].map((vibe) => {
                const isActive = filters.vibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() =>
                      update({
                        ...filters,
                        vibes: isActive
                          ? filters.vibes.filter((v) => v !== vibe)
                          : [...filters.vibes, vibe],
                      })
                    }
                    className={cn(
                      "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 shrink-0 border cursor-pointer",
                      isActive
                        ? "bg-foreground text-background border-foreground font-bold shadow-xs scale-[1.03]"
                        : "bg-white/40 dark:bg-white/[0.04] border-foreground/15 text-foreground hover:bg-foreground/10"
                    )}
                  >
                    #{vibe} {isActive && "✓"}
                  </button>
                );
              })}

              {/* Price Preset: Under 2k */}
              <button
                type="button"
                onClick={() =>
                  update({
                    ...filters,
                    minPrice: 0,
                    maxPrice: filters.maxPrice === 2000 ? PRICE_MAX : 2000,
                  })
                }
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 shrink-0 border cursor-pointer",
                  filters.maxPrice === 2000
                    ? "bg-foreground text-background border-foreground font-bold shadow-xs scale-[1.03]"
                    : "bg-white/40 dark:bg-white/[0.04] border-foreground/15 text-foreground hover:bg-foreground/10"
                )}
              >
                &lt; ₹2,000 {filters.maxPrice === 2000 && "✓"}
              </button>

              {/* High Rating */}
              <button
                type="button"
                onClick={() =>
                  update({
                    ...filters,
                    minRating: filters.minRating === 4 ? 0 : 4,
                  })
                }
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 shrink-0 border cursor-pointer",
                  filters.minRating === 4
                    ? "bg-foreground text-background border-foreground font-bold shadow-xs scale-[1.03]"
                    : "bg-white/40 dark:bg-white/[0.04] border-foreground/15 text-foreground hover:bg-foreground/10"
                )}
              >
                ★ 4.0+ Rated {filters.minRating === 4 && "✓"}
              </button>

              {/* Big Discount */}
              <button
                type="button"
                onClick={() =>
                  update({
                    ...filters,
                    minDiscount: filters.minDiscount === 30 ? 0 : 30,
                  })
                }
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 shrink-0 border cursor-pointer",
                  filters.minDiscount === 30
                    ? "bg-foreground text-background border-foreground font-bold shadow-xs scale-[1.03]"
                    : "bg-white/40 dark:bg-white/[0.04] border-foreground/15 text-foreground hover:bg-foreground/10"
                )}
              >
                30%+ Privilege {filters.minDiscount === 30 && "✓"}
              </button>
            </div>
          </div>

          {/* Active Filter Tags - Sharp Editorial Micro-Tags */}
          {activeCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-foreground/10 pb-4 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-bold text-left">
                ACTIVE FILTERS ({activeCount}):
              </span>
              {filters.gender !== "all" && (
                <button
                  type="button"
                  onClick={() => update({ ...filters, gender: "all" })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  DEMOGRAPHIC: {filters.gender} ✕
                </button>
              )}
              {filters.vibes.map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => update({ ...filters, vibes: filters.vibes.filter((x) => x !== v) })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  #{v} ✕
                </button>
              ))}
              {filters.fits.map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => update({ ...filters, fits: filters.fits.filter((x) => x !== v) })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  FIT: {v} ✕
                </button>
              ))}
              {filters.colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => update({ ...filters, colors: filters.colors.filter((x) => x !== c) })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  COLOR: {c} ✕
                </button>
              ))}
              {filters.sizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => update({ ...filters, sizes: filters.sizes.filter((x) => x !== s) })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  SIZE: {s} ✕
                </button>
              ))}
              {(filters.minPrice > 0 || filters.maxPrice < PRICE_MAX) && (
                <button
                  type="button"
                  onClick={() => update({ ...filters, minPrice: 0, maxPrice: PRICE_MAX })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  PRICE: ₹{filters.minPrice} – ₹{filters.maxPrice} ✕
                </button>
              )}
              {filters.minRating > 0 && (
                <button
                  type="button"
                  onClick={() => update({ ...filters, minRating: 0 })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  RATING: ★{filters.minRating}+ ✕
                </button>
              )}
              {filters.minDiscount > 0 && (
                <button
                  type="button"
                  onClick={() => update({ ...filters, minDiscount: 0 })}
                  className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-[10px] uppercase text-foreground font-bold text-left hover:bg-foreground/15 cursor-pointer shadow-xs"
                >
                  DISCOUNT: {filters.minDiscount}%+ ✕
                </button>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="font-mono text-[10px] uppercase tracking-wider text-accent font-bold underline hover:opacity-80 text-left ml-2 cursor-pointer"
              >
                CLEAR ALL CRITERIA
              </button>
            </div>
          )}

          {/* Grid of Unboxed Editorial Pieces with Dynamic Density */}
          {loading ? (
            <div
              className={cn(
                "grid grid-cols-2 gap-3 sm:gap-6 text-left",
                gridDensity === 2 && "lg:grid-cols-2 lg:gap-10",
                gridDensity === 3 && "lg:grid-cols-3 lg:gap-8",
                gridDensity === 4 && "lg:grid-cols-4 lg:gap-6"
              )}
            >
              <GridSkeleton count={gridDensity * 2} />
            </div>
          ) : error ? (
            <div className="border border-foreground/20 bg-surface/80 backdrop-blur-md p-12 text-left rounded-3xl shadow-sm">
              <p className="font-mono text-xs uppercase tracking-wider text-foreground font-bold text-left">
                ARCHIVE RETRIEVAL ERROR: {error}
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 rounded-full border border-foreground bg-foreground px-5 py-2 font-mono text-xs uppercase tracking-widest text-background font-bold text-left cursor-pointer hover:opacity-90 transition-all"
              >
                RETRY ARCHIVE QUERY
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="border border-foreground/20 bg-surface/80 backdrop-blur-md p-12 text-left rounded-3xl shadow-sm">
              <IconImage type="order" size={28} className="mb-4" />
              <h3 className="font-serif text-2xl text-foreground text-left">No silhouettes match specified criteria</h3>
              <p className="mt-2 font-serif text-sm italic text-foreground/75 text-left">
                Adjust or relax filtering parameters to view additional atelier archive items.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-background font-bold text-left cursor-pointer hover:opacity-90 transition-all"
              >
                RESET CATALOGUE FILTERS
              </button>
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-2 gap-3 sm:gap-6 text-left transition-all duration-300",
                gridDensity === 2 && "lg:grid-cols-2 lg:gap-10",
                gridDensity === 3 && "lg:grid-cols-3 lg:gap-8",
                gridDensity === 4 && "lg:grid-cols-4 lg:gap-6"
              )}
            >
              {items.map((p, i) => (
                <div key={`${p.id}-${i}`} className="animate-fade-up text-left">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="h-1" aria-hidden />

          {loadingMore && (
            <div className="mt-8 flex items-center gap-2 text-left font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
              <IconImage type="check" size={14} className="border-none" />
              <span>RETRIEVING SUBSEQUENT SILHOUETTES...</span>
            </div>
          )}

          {!hasMore && !loading && items.length > 0 && (
            <div className="mt-16 border-t border-foreground/15 pt-8 text-left">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground font-bold text-left">
                END OF SPECIFIED ARCHIVE REGISTER · {total} SILHOUETTES PRESENTED
              </p>
              <section className="mt-12 text-left">
                <div className="mb-6 flex items-center gap-2 text-left border-b border-foreground/10 pb-3">
                  <IconImage type="sparkles" size={16} />
                  <h2 className="font-serif text-2xl text-foreground text-left">
                    Curated Ensemble Edits
                  </h2>
                </div>
                <div className="grid gap-6 text-left sm:grid-cols-2 xl:grid-cols-4">
                  {featuredLooks.map((l) => (
                    <LookCard key={l.id} look={l} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SOFT AMBIENT BACKGROUND DIM OVERLAY (When Mobile Panels Open) ═══ */}
      {(filtersOpen || sortOpen) && (
        <div
          onClick={() => {
            setFiltersOpen(false);
            setSortOpen(false);
          }}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {/* ═══ FLOATING BOTTOM LIQUID GLASS EXPANDING TOOLBAR (Mobile & Tablet) ═══ */}
      <div
        ref={bottomBarRef}
        className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 flex flex-col items-center px-3 sm:px-6 pointer-events-none transition-all duration-300 lg:hidden"
      >
        {/* ── EXPANDING FILTERS SECTION (Solid High-Contrast Surface) ── */}
        {filtersOpen && (
          <div className="pointer-events-auto mb-2.5 w-full max-w-md rounded-3xl p-4 sm:p-6 bg-surface/98 dark:bg-[#121620]/98 backdrop-blur-3xl border border-foreground/20 dark:border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-fade-up text-left overflow-hidden transition-all duration-300 max-h-[72vh] flex flex-col text-foreground">
            {/* Header row inside expanding filter */}
            <div className="flex items-center justify-between border-b border-foreground/15 dark:border-white/15 pb-3 mb-2 text-left">
              <div className="flex items-center gap-2 text-left">
                <IconImage type="filter" size={14} className="opacity-90 grayscale" />
                <span className="text-xs sm:text-[13px] tracking-[0.2em] font-bold text-foreground text-left">
                  Archive Filters
                </span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="text-xs text-foreground font-bold hover:underline transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                [ Close Filters ]
              </button>
            </div>

            {/* Filter Panel Content */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar text-foreground">
              <FilterPanel filters={filters} onChange={update} hideHeader={true} />
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-3 mt-2 border-t border-foreground/15 dark:border-white/15 flex items-center justify-between gap-3 text-left">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-foreground font-bold underline cursor-pointer whitespace-nowrap"
                >
                  [ Reset ]
                </button>
              )}
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-full bg-foreground py-2.5 px-4 text-center text-xs tracking-widest text-background font-bold hover:opacity-90 transition-all cursor-pointer shadow-md uppercase"
              >
                Show {total} Silhouettes
              </button>
            </div>
          </div>
        )}

        {/* ── EXPANDING SORT SECTION (Solid High-Contrast Surface) ── */}
        {sortOpen && (
          <div className="pointer-events-auto mb-2.5 w-full max-w-sm rounded-3xl p-4 sm:p-5 bg-surface/98 dark:bg-[#121620]/98 backdrop-blur-3xl border border-foreground/20 dark:border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-fade-up text-left overflow-hidden transition-all duration-300 text-foreground">
            {/* Header row inside expanding sort */}
            <div className="flex items-center justify-between border-b border-foreground/15 dark:border-white/15 pb-2.5 mb-2.5 text-left">
              <span className="text-xs sm:text-[13px] tracking-[0.2em] font-bold text-foreground text-left whitespace-nowrap">
                Sort Archive Silhouettes
              </span>
              <button
                type="button"
                onClick={() => setSortOpen(false)}
                className="text-xs text-foreground font-bold hover:underline transition-colors cursor-pointer text-left whitespace-nowrap"
              >
                [ Close ]
              </button>
            </div>

            {/* Custom Sort Option Buttons */}
            <div className="space-y-1.5 text-left py-1">
              {FILTER_GROUPS.sorts.map((s) => {
                const isSelected = filters.sort === s.value;
                return (
                  <button
                    type="button"
                    key={s.value}
                    onClick={() => {
                      update({ ...filters, sort: s.value });
                      setSortOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all text-left text-xs font-mono tracking-wider cursor-pointer border",
                      isSelected
                        ? "bg-foreground text-background border-foreground font-bold shadow-sm"
                        : "bg-foreground/5 dark:bg-white/10 hover:bg-foreground/10 dark:hover:bg-white/15 border-foreground/15 dark:border-white/15 text-foreground font-semibold"
                    )}
                  >
                    <span>{s.label}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-accent dark:text-accent font-bold">✓ ACTIVE</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FLOATING PILL TOOLBAR BAR ── */}
        <div
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-center justify-between gap-2 rounded-full px-4 py-2 sm:py-2.5 transition-all duration-500",
            "bg-surface/95 dark:bg-[#121620]/95 backdrop-blur-2xl border border-foreground/20 dark:border-white/20 text-foreground",
            "shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
            (filtersOpen || sortOpen) && "border-foreground/40 dark:border-white/40 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
          )}
        >
          {/* Filter Toggle Trigger */}
          <button
            type="button"
            onClick={() => {
              setFiltersOpen((v) => !v);
              setSortOpen(false);
            }}
            aria-label={filtersOpen ? "Close filters" : "Open archive filters"}
            aria-expanded={filtersOpen}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-300 text-xs font-bold cursor-pointer border text-left",
              filtersOpen
                ? "bg-foreground text-background border-foreground font-bold shadow-sm"
                : "bg-foreground/10 hover:bg-foreground/15 dark:bg-white/10 dark:hover:bg-white/15 border-foreground/20 dark:border-white/20 text-foreground font-bold"
            )}
          >
            <IconImage type="filter" size={13} className="grayscale opacity-90" />
            <span>{filtersOpen ? "Close" : "Filters"}</span>
            {activeCount > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.2 font-mono text-[9px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>

          {/* Piece Counter */}
          <span className="font-mono text-xs text-foreground font-bold tracking-wider text-center">
            {total} Pieces
          </span>

          {/* Sort Toggle Trigger */}
          <button
            type="button"
            onClick={() => {
              setSortOpen((v) => !v);
              setFiltersOpen(false);
            }}
            aria-label={sortOpen ? "Close sort options" : "Open sort options"}
            aria-expanded={sortOpen}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-300 text-xs font-bold cursor-pointer border text-left uppercase tracking-wider",
              sortOpen
                ? "bg-foreground text-background border-foreground font-bold shadow-sm"
                : "bg-foreground/10 hover:bg-foreground/15 dark:bg-white/10 dark:hover:bg-white/15 border-foreground/20 dark:border-white/20 text-foreground font-bold"
            )}
          >
            <span>{currentSortLabel}</span>
            <span
              className={cn(
                "text-[10px] font-mono transition-transform duration-300 transform",
                sortOpen ? "rotate-180" : "rotate-0"
              )}
              aria-hidden="true"
            >
              ▼
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
