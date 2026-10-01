"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { ProductCard } from "@/components/product/product-card";
import { useInfiniteProducts } from "@/hooks/use-infinite-products";
import { useToast } from "@/providers/toast-provider";
import { SKIN_TONES } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import type { SkinTone } from "@/lib/types";

export function StyleAdvisor({ initialToneId }: { initialToneId?: string }) {
  const { push } = useToast();
  const [tone, setTone] = useState<SkinTone | null>(
    SKIN_TONES.find((t) => t.id === initialToneId) ?? null,
  );
  const [detecting, setDetecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const colorQuery = useMemo(
    () =>
      tone
        ? `colors=${encodeURIComponent(tone.best.map((c) => c.name.toLowerCase()).join(","))}&sort=rating`
        : "",
    [tone],
  );
  const { items, loading, sentinelRef } = useInfiniteProducts(colorQuery);

  const detect = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setDetecting(true);
      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          const idx = file.size % SKIN_TONES.length;
          const guess = SKIN_TONES[idx];
          setTone(guess);
          setDetecting(false);
          push({
            title: `Detected Skin Tone: ${guess.label}`,
            description: `${guess.undertone} undertone match`,
            variant: "success",
          });
        }, 1400);
      };
      reader.readAsDataURL(file);
    },
    [push],
  );

  return (
    <div className="space-y-10 text-left">
      {/* Tone Picker Panel */}
      <div className="border border-foreground/20 bg-surface p-6 sm:p-10 text-left">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-foreground/15 pb-6 text-left">
          <div className="text-left">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
              SKIN TONE & COLOR GUIDE
            </span>
            <h2 className="mt-1 font-serif text-3xl text-foreground text-left sm:text-4xl">
              Find Colors That Suit You Best
            </h2>
            <p className="mt-2 font-serif text-sm italic text-foreground/65 text-left">
              Choose your skin tone below or upload a photo to get personalized color and outfit recommendations.
            </p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={detecting}
            className="flex items-center gap-2 border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 disabled:opacity-50 text-left"
          >
            <IconImage type="scan" size={14} className="border-none invert dark:invert-0" />
            <span>{detecting ? "ANALYZING PHOTO…" : "UPLOAD PHOTO TO DETECT"}</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => detect(e.target.files?.[0])}
          />
        </div>

        {/* Tone Swatches Matrix - Sharp Rectangles */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 text-left">
          {SKIN_TONES.map((s) => {
            const active = tone?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setTone(s)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start border p-3 text-left transition",
                  active ? "border-foreground bg-foreground text-background" : "border-foreground/20 hover:border-foreground text-foreground",
                )}
              >
                <div
                  className="h-12 w-full border border-foreground/20 mb-2"
                  style={{ background: s.hex }}
                />
                <span className="font-mono text-xs font-semibold uppercase text-left block">
                  {s.label}
                </span>
                <span className={cn("font-serif text-[11px] italic text-left block mt-0.5", active ? "text-background/80" : "text-foreground/55")}>
                  {s.undertone}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tone ? (
        <div className="space-y-8 text-left">
          {/* Chromatic Palette Results - High Contrast Columns */}
          <div className="grid gap-6 text-left lg:grid-cols-2">
            <div className="border border-foreground/20 bg-surface p-6 text-left">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
                RECOMMENDED COLORS
              </span>
              <h3 className="mt-1 font-serif text-2xl text-foreground text-left">
                Colors That Look Great On You
              </h3>
              <div className="mt-6 grid grid-cols-5 gap-3 text-left">
                {tone.best.map((c, i) => (
                  <div key={c.name} className="flex flex-col text-left">
                    <div
                      className="aspect-square border border-foreground/20"
                      style={{ background: c.hex }}
                    />
                    <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-foreground text-left truncate">
                      {c.name}
                    </p>
                    <span className="font-mono text-[8px] text-foreground/40 text-left">
                      SHADE {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-foreground/20 bg-surface p-6 text-left">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
                LESS FLATTERING SHADES
              </span>
              <h3 className="mt-1 font-serif text-2xl text-foreground text-left">
                Colors to Avoid
              </h3>
              <div className="mt-6 grid grid-cols-5 gap-3 text-left">
                {tone.avoid.map((c) => (
                  <div key={c.name} className="flex flex-col text-left">
                    <div className="relative aspect-square border border-foreground/20 opacity-60">
                      <div className="h-full w-full" style={{ background: c.hex }} />
                      <span className="absolute top-1 left-1 font-mono text-[8px] uppercase bg-black text-white px-1">
                        [X]
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-foreground/70 text-left truncate">
                      {c.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border border-foreground bg-foreground p-6 text-background text-left">
            <div className="text-left">
              <p className="font-mono text-xs uppercase tracking-wider text-background/80 text-left">
                SELECTED SKIN TONE: {tone.label.toUpperCase()}
              </p>
              <p className="font-serif text-lg text-background text-left mt-0.5">
                Showing clothing and outfits that best match your skin tone.
              </p>
            </div>
            <Link
              href={`/shop?${colorQuery}`}
              className="flex items-center gap-2 border border-background bg-background px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-foreground text-left transition hover:bg-transparent hover:text-background"
            >
              <span>VIEW MATCHING PRODUCTS</span>
              <IconImage type="arrow" size={12} className="border-none" />
            </Link>
          </div>

          {/* Palette-specific Silhouettes Grid */}
          <div className="text-left">
            <h3 className="font-serif text-2xl text-foreground text-left mb-6 border-b border-foreground/15 pb-3">
              Recommended Clothes for {tone.label} Skin Tone
            </h3>
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
                {items.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="animate-fade-up text-left">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
            <div ref={sentinelRef} className="h-1" aria-hidden />
          </div>
        </div>
      ) : (
        <div className="border border-foreground/20 bg-surface p-12 text-left">
          <IconImage type="palette" size={28} className="mb-4" />
          <h3 className="font-serif text-2xl text-foreground text-left">
            Select your skin tone above to see recommended outfits
          </h3>
          <p className="mt-2 font-serif text-sm italic text-foreground/60 text-left">
            We will show you clothing colors and styles that naturally suit your appearance.
          </p>
        </div>
      )}
    </div>
  );
}
