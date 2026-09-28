"use client";

import { useState } from "react";
import { IconImage } from "@/components/ui/icon-image";
import {
  FILTER_GROUPS,
  PRICE_MAX,
  countActiveFilters,
  type ShopFilters,
} from "@/lib/filters";
import { cn, formatINR } from "@/lib/utils";

interface Props {
  filters: ShopFilters;
  onChange: (next: ShopFilters) => void;
  onClose?: () => void;
  hideHeader?: boolean;
}

function Section({
  title,
  children,
  hint,
  defaultOpen = true,
  count = 0,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/20 dark:border-white/10 py-3.5 text-left transition-colors">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left py-1 group cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="label-ui text-[12px] tracking-[0.2em] font-bold text-foreground uppercase transition-opacity group-hover:opacity-80">
            {title}
          </span>
          {count > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.2 font-mono text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hint && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-foreground/50 hidden sm:inline">
              {hint}
            </span>
          )}
          <span
            className={cn(
              "font-mono text-[12px] text-foreground/60 transition-transform duration-300 transform",
              open ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
      </button>

      {open && <div className="mt-2.5 pt-1 animate-fade-in text-left">{children}</div>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl px-3 py-1.5 font-mono text-[12px] uppercase tracking-wider transition-all duration-200 text-left border cursor-pointer select-none",
        active
          ? "border-foreground bg-foreground text-background font-bold shadow-md scale-[1.02]"
          : "border-white/35 dark:border-white/15 bg-white/40 dark:bg-white/[0.06] hover:bg-white/70 dark:hover:bg-white/[0.14] hover:border-white/50 text-foreground font-semibold shadow-xs"
      )}
    >
      {children}
    </button>
  );
}

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function FilterPanel({ filters, onChange, onClose, hideHeader = false }: Props) {
  const active = countActiveFilters(filters);

  const reset = () => {
    onChange({
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
  };

  return (
    <div className="flex h-full flex-col text-left">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-white/25 dark:border-white/15 pb-3.5 mb-1 text-left">
          <div className="flex items-center gap-2 text-left">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground/10 border border-foreground/20">
              <IconImage type="filter" size={14} className="opacity-90 grayscale" />
            </div>
            <div>
              <h3 className="label-ui text-sm uppercase tracking-[0.2em] font-bold text-foreground text-left">
                Specification Filter
              </h3>
              <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/50 block">
                {active > 0 ? `${active} active criteria` : "Full Archive"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-left">
            {active > 0 && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-white/30 bg-white/30 dark:bg-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-foreground font-bold hover:bg-foreground hover:text-background transition-all text-left cursor-pointer"
              >
                Reset ({active})
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filter panel"
                className="rounded-full p-2 hover:bg-white/20 text-foreground transition-colors cursor-pointer"
              >
                <IconImage type="close" size={16} className="opacity-90" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 text-left space-y-0.5 custom-scrollbar">
        {/* 01 Target Demographic */}
        <Section
          title="01 // Demographic"
          count={filters.gender !== "all" ? 1 : 0}
          defaultOpen={true}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {[
              { value: "all", label: "ALL CLIENTS" },
              { value: "women", label: "FEMME" },
              { value: "men", label: "HOMME" },
              { value: "unisex", label: "UNISEX" },
            ].map((g) => (
              <Chip
                key={g.value}
                active={filters.gender === g.value}
                onClick={() => onChange({ ...filters, gender: g.value })}
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </Section>

        {/* 02 Sartorial Vibe */}
        <Section
          title="02 // Aesthetic Vibe"
          hint="Registers"
          count={filters.vibes.length}
          defaultOpen={true}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {FILTER_GROUPS.vibes.map((v) => (
              <Chip
                key={v}
                active={filters.vibes.includes(v)}
                onClick={() => onChange({ ...filters, vibes: toggle(filters.vibes, v) })}
              >
                {`#${v}`}
              </Chip>
            ))}
          </div>
        </Section>

        {/* 03 Valuation Price Range */}
        <Section
          title="03 // Price Range"
          hint={`${formatINR(filters.minPrice)} – ${formatINR(filters.maxPrice)}`}
          count={(filters.minPrice > 0 || filters.maxPrice < PRICE_MAX) ? 1 : 0}
          defaultOpen={true}
        >
          <div className="space-y-3.5 text-left pt-1">
            {/* Quick Price Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "< ₹2,000", min: 0, max: 2000 },
                { label: "₹2k – ₹4k", min: 2000, max: 4000 },
                { label: "All Rates", min: 0, max: PRICE_MAX },
              ].map((p) => {
                const isSelected = filters.minPrice === p.min && filters.maxPrice === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onChange({ ...filters, minPrice: p.min, maxPrice: p.max })}
                    className={cn(
                      "py-2 px-2 rounded-xl font-mono text-[11px] uppercase font-bold tracking-wider border transition-all cursor-pointer text-center",
                      isSelected
                        ? "bg-foreground text-background border-foreground font-bold shadow-xs"
                        : "bg-white/30 dark:bg-white/[0.06] hover:bg-white/60 border-white/20 text-foreground/80"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[12px] text-foreground/80 font-bold">
                <span>MIN: {formatINR(filters.minPrice)}</span>
                <span>MAX: {formatINR(filters.maxPrice)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={PRICE_MAX}
                step={100}
                value={filters.maxPrice}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    maxPrice: Math.max(Number(e.target.value), filters.minPrice + 100),
                  })
                }
                aria-label="Filter maximum price ceiling"
                className="w-full accent-foreground cursor-pointer h-1.5 bg-foreground/20 rounded-lg appearance-none"
              />
            </div>
          </div>
        </Section>

        {/* 04 Chromatic Swatches */}
        <Section
          title="04 // Color Palette"
          hint="Tactile Swatches"
          count={filters.colors.length}
          defaultOpen={true}
        >
          <div className="grid grid-cols-6 gap-2 text-left pt-1">
            {FILTER_GROUPS.colors.map((c) => {
              const on = filters.colors.includes(c.name.toLowerCase());
              return (
                <button
                  type="button"
                  key={c.name}
                  title={`${c.name} (${c.hex})`}
                  aria-label={`Filter color ${c.name}`}
                  aria-pressed={on}
                  onClick={() =>
                    onChange({
                      ...filters,
                      colors: toggle(filters.colors, c.name.toLowerCase()),
                    })
                  }
                  className={cn(
                    "relative flex h-8 w-full items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer shadow-xs",
                    on
                      ? "border-foreground ring-2 ring-foreground scale-105 shadow-md"
                      : "border-white/35 dark:border-white/20 hover:scale-105 opacity-85 hover:opacity-100"
                  )}
                  style={{ background: c.hex }}
                >
                  {on && (
                    <span className="h-2 w-2 rounded-full bg-white shadow-md" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* 05 Cut & Fit */}
        <Section
          title="05 // Silhouette & Fit"
          count={filters.fits.length}
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {FILTER_GROUPS.fits.map((f) => (
              <Chip
                key={f}
                active={filters.fits.includes(f)}
                onClick={() => onChange({ ...filters, fits: toggle(filters.fits, f) })}
              >
                {f}
              </Chip>
            ))}
          </div>
        </Section>

        {/* 06 Sizing */}
        <Section
          title="06 // Sizing Specification"
          count={filters.sizes.length}
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {FILTER_GROUPS.sizes.map((s) => (
              <Chip
                key={s}
                active={filters.sizes.includes(s)}
                onClick={() => onChange({ ...filters, sizes: toggle(filters.sizes, s) })}
              >
                {s}
              </Chip>
            ))}
          </div>
        </Section>

        {/* 07 Occasion Context */}
        <Section
          title="07 // Occasion Context"
          count={filters.occasions.length}
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {FILTER_GROUPS.occasions.map((o) => (
              <Chip
                key={o}
                active={filters.occasions.includes(o)}
                onClick={() =>
                  onChange({ ...filters, occasions: toggle(filters.occasions, o) })
                }
              >
                {o}
              </Chip>
            ))}
          </div>
        </Section>

        {/* 08 Archive Reduction Discount */}
        <Section
          title="08 // Discount Rebate"
          count={filters.minDiscount > 0 ? 1 : 0}
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {FILTER_GROUPS.discounts.map((d) => (
              <Chip
                key={d}
                active={filters.minDiscount === d}
                onClick={() =>
                  onChange({ ...filters, minDiscount: filters.minDiscount === d ? 0 : d })
                }
              >
                {d}% + Off
              </Chip>
            ))}
          </div>
        </Section>

        {/* 09 Rating Score */}
        <Section
          title="09 // Patron Quality Score"
          count={filters.minRating > 0 ? 1 : 0}
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {FILTER_GROUPS.ratings.map((r) => (
              <Chip
                key={r}
                active={filters.minRating === r}
                onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
              >
                ★ {r}.0 & Above
              </Chip>
            ))}
          </div>
        </Section>

        {/* 10 Sustainable Provenance */}
        <Section
          title="10 // Sustainable Textiles"
          count={filters.sustainability.length}
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5 text-left">
            {FILTER_GROUPS.sustainability.map((s) => (
              <Chip
                key={s}
                active={filters.sustainability.includes(s)}
                onClick={() =>
                  onChange({
                    ...filters,
                    sustainability: toggle(filters.sustainability, s),
                  })
                }
              >
                {s}
              </Chip>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
