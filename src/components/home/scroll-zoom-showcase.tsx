"use client";

import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { PRODUCTS, getProduct } from "@/lib/data/catalog";
import type { GarmentKind } from "@/lib/types";
import { IconImage } from "@/components/ui/icon-image";

export function ScrollZoomShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* keep default */
    }
    if (reduced) {
      setProgress(1);
      return;
    }

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const raw = (vh * 0.85 - rect.top) / (rect.height * 0.72);
        setProgress(Math.min(1, Math.max(0, raw)));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const zoom = 0.85 + 0.15 * progress;
  const hero = getProduct("p0008") ?? PRODUCTS[0];

  const features = [
    { iconName: "tryon" as const, title: "3D Virtual Try-On", copy: "Try on clothes virtually in 3D on your phone before ordering." },
    { iconName: "palette" as const, title: "Colour Matching", copy: "Find the best outfits and shades that match your skin tone." },
    { iconName: "delivery" as const, title: "Fast Express Delivery", copy: "Free express delivery across India on orders above ₹1,499." },
    { iconName: "authentic" as const, title: "100% Genuine Quality", copy: "Authentic premium fabrics with secure UPI payments and easy returns." },
  ];

  return (
    <section ref={sectionRef} className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-left">
      <div className="mb-12 border-l-2 border-foreground pl-6 text-left">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45">
          Why Shop With Us
        </span>
        <h2 className="mt-2 font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl text-left">
          Modern Style. Perfect Fit Guaranteed.
        </h2>
        <p className="mt-2 text-sm text-foreground/60 max-w-xl text-left font-sans">
          Premium tailored clothing designed for everyday comfort, office wear, and special occasions.
        </p>
      </div>

      {/* Frame without cards or rounded corners */}
      <div
        className="relative mx-auto overflow-hidden border border-line bg-surface text-left"
        style={{
          width: `${zoom * 100}%`,
          transition: "width 0.15s linear",
          willChange: "width",
        }}
      >
        <div className="relative aspect-[16/9]">
          <ProductImage
            kind={hero.kind as GarmentKind}
            color={hero.colors[0].hex}
            seed={hero.seed}
            image={hero.image}
            alt={hero.name}
            sizes="(min-width: 1280px) 100vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-end justify-between gap-4 sm:inset-x-10 sm:bottom-10 text-left">
            <div className="min-w-0 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/60 block">
                Specimen // Archive Cut
              </span>
              <p className="font-serif text-3xl font-light text-white sm:text-4xl truncate text-left">
                {hero.name}
              </p>
            </div>
            <div className="shrink-0 border border-white/20 bg-black/60 px-5 py-3 backdrop-blur-md text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/60 block text-left">
                Confidence
              </span>
              <p className="font-mono text-2xl font-light text-white text-left">94.8% Fit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unboxed architectural features grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-b border-line divide-y md:divide-y-0 md:divide-x divide-line text-left">
        {features.map((item, idx) => (
          <div key={item.title} className="p-8 text-left">
            <div className="flex items-center gap-3">
              <IconImage
                name={item.iconName}
                alt={item.title}
                className="h-10 w-10 object-cover grayscale"
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                0{idx + 1} {"//"} Spec
              </span>
            </div>
            <h3 className="mt-6 font-serif text-xl font-normal text-foreground text-left">
              {item.title}
            </h3>
            <p className="mt-2 font-sans text-xs text-foreground/60 leading-relaxed text-left">
              {item.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
