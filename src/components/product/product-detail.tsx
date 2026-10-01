"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product/product-image";
import { Rating } from "@/components/ui/rating";
import { IconImage } from "@/components/ui/icon-image";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { memberPriceFor } from "@/lib/member-pricing";
import { useMembership } from "@/providers/membership-provider";
import { COUPONS } from "@/lib/data/catalog";
import { cn, discountPercent, formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { add, count } = useCart();
  const { push } = useToast();
  const { isActive: isMember } = useMembership();
  const memberPrice = memberPriceFor(product.price);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [saved, setSaved] = useState(false);
  const [concessionsOpen, setConcessionsOpen] = useState(false);
  const buySectionRef = useRef<HTMLDivElement>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const el = buySectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // The middle buy section is in view if its top has entered the viewport (with margin)
      // and its bottom hasn't scrolled completely past the top (with margin).
      const isInMid = rect.top < viewportHeight - 40 && rect.bottom > 60;

      // When the user is in the middle section interacting with colors, sizes, and inline buttons:
      // Hide the floating bar completely so it NEVER overlaps!
      // When the user is at the top of the page OR scrolled down past the middle:
      // Show the permanent action bar.
      setShowFloatingBar(!isInMid);
    };

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  const color = product.colors[colorIdx];
  const off = discountPercent(product.mrp, product.price);
  const savings = (product.mrp - product.price) * qty;

  function grab() {
    if (!size) {
      push({ title: "Designate silhouette size first", variant: "error" });
      buySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function addToBag() {
    if (!grab()) return;
    add(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        size: size!,
        color: color.name,
        colorHex: color.hex,
        kind: product.kind,
        seed: product.seed,
        image: product.image,
      },
      qty,
    );
    push({ title: "Archived to bag", description: `${qty} × ${product.name} (${size})`, variant: "success" });
  }

  function buyNow() {
    if (!grab()) return;
    add(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        size: size!,
        color: color.name,
        colorHex: color.hex,
        kind: product.kind,
        seed: product.seed,
        image: product.image,
      },
      qty,
    );
    router.push("/checkout");
  }

  const sections = [
    { id: "details", title: "01 // PRODUCT DETAILS & FABRIC", body: product.description },
    {
      id: "size",
      title: "02 // SIZE & FIT GUIDE",
      body: `Available sizes: ${product.sizes.join(", ")}. Fit style: ${product.fits.join(", ")}. Model is 5'8" wearing size ${product.sizes[Math.min(2, product.sizes.length - 1)]}. Standard Indian sizing.`,
    },
    {
      id: "care",
      title: "03 // MATERIAL & CARE INSTRUCTIONS",
      body: `${product.sustainability.length ? product.sustainability.join(" · ") + ". " : ""}Dry clean or gentle hand wash in cold water. Do not tumble dry. Iron on low to medium heat.`,
    },
  ];

  return (
    <div className="grid gap-10 text-left lg:grid-cols-2 lg:gap-16">
      {/* Editorial Flat Photographic Plate - NO CARD */}
      <div className="text-left lg:sticky lg:top-24 lg:self-start">
        <div className="relative overflow-hidden rounded-2xl bg-surface-muted border border-foreground/15 text-left shadow-md">
          <div className="aspect-[4/5] sm:aspect-[3/4] w-full max-h-[58vh] sm:max-h-none">
            <ProductImage
              kind={product.kind}
              color={color.hex}
              seed={product.seed}
              image={product.image}
              alt={product.name}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>

          {/* Wishlist Action with Image Indicator */}
          <button
            onClick={() => {
              setSaved((s) => !s);
              push({ title: saved ? "Removed from Wishlist" : "Saved to Wishlist", variant: "info" });
            }}
            aria-label="Save to wishlist"
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-foreground/20 bg-background/90 backdrop-blur-md px-3 py-1.5 text-left font-mono text-xs uppercase tracking-wider text-foreground transition hover:bg-background shadow-xs"
          >
            <span>{saved ? "★ WISHLISTED" : "☆ WISHLIST"}</span>
          </button>

          {/* 3D Try-On Action */}
          {product.tryOnReady && (
            <div className="absolute bottom-3 left-3 text-left">
              <Link
                href={`/try-on?product=${product.id}`}
                className="flex items-center gap-2 rounded-xl border border-foreground bg-foreground/95 backdrop-blur-md px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-background transition hover:opacity-90 text-left shadow-lg"
              >
                <span className="text-left font-bold">3D VIRTUAL TRY-ON</span>
              </Link>
            </div>
          )}
        </div>

        {/* Color Palette Swatches - Sharp Rectangles */}
        <div className="mt-4 flex gap-2.5 text-left">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setColorIdx(i)}
              aria-label={c.name}
              className={cn(
                "relative h-16 w-14 overflow-hidden border transition text-left",
                colorIdx === i ? "border-foreground ring-2 ring-foreground" : "border-foreground/25 hover:border-foreground",
              )}
            >
              <ProductImage
                kind={product.kind}
                color={c.hex}
                seed={product.seed}
                image={product.image}
                alt={product.name}
                sizes="64px"
              />
              <span
                className="pointer-events-none absolute inset-0"
                style={{ background: c.hex, opacity: 0.25 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Specification & Buy Column - Strict Left Alignment */}
      <div className="flex flex-col text-left">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60 text-left font-semibold">
          {product.brand} · ITEM #{product.id.toUpperCase()}
        </span>
        <h1 className="mt-2 font-serif text-3xl font-normal leading-tight tracking-tight text-foreground text-left sm:text-4xl lg:text-5xl">
          {product.name}
        </h1>

        <div className="mt-3 flex items-center gap-4 text-left">
          <Rating value={product.rating} count={product.ratingCount} />
          <span className="font-mono text-xs text-foreground/60 text-left font-medium">
            STYLE: {product.vibes.join(" / ").toUpperCase()}
          </span>
        </div>

        {/* Price Block */}
        <div className="mt-5 flex flex-wrap items-baseline gap-3 text-left border-y border-foreground/15 py-4">
          <span className="font-mono text-3xl font-bold text-foreground text-left">
            {formatINR(product.price)}
          </span>
          {product.mrp > product.price && (
            <>
              <span className="font-mono text-base text-foreground/45 line-through text-left">
                {formatINR(product.mrp)}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-left bg-emerald-500/10 px-2 py-0.5 rounded-md">
                {off}% OFF
              </span>
            </>
          )}
        </div>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-foreground/50 text-left">
          INCLUSIVE OF ALL TAXES & GST
        </p>

        {/* Member Privilege Price */}
        <div className="mt-5 border border-foreground/20 bg-surface p-4 text-left">
          <div className="flex items-center gap-2 text-left">
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground text-left">
              VIP MEMBER PRICE: {formatINR(memberPrice)}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground/60 text-left">
            {isMember ? "Member discount automatically applied at checkout." : "Join VESTRA VIP Club for ₹201/year to unlock this price."}
          </p>
        </div>

        {/* Coupon Offers Strip */}
        <div className="mt-5 border border-foreground/15 text-left transition-colors">
          <button
            type="button"
            onClick={() => setConcessionsOpen((o) => !o)}
            aria-expanded={concessionsOpen}
            className="flex w-full items-center justify-between p-4 text-left font-mono text-[10px] uppercase tracking-widest font-semibold text-foreground hover:bg-foreground/5 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 flex-wrap text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-foreground text-left">
                AVAILABLE COUPONS & OFFERS
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/80 font-bold text-left">
                {COUPONS.slice(0, 3).length} OFFERS
              </span>
            </div>
            <span className="font-mono text-xs text-foreground/60 transition-transform font-bold text-right">
              {concessionsOpen ? "[-]" : "[+]"}
            </span>
          </button>

          {concessionsOpen && (
            <div className="px-4 pb-4 pt-1 border-t border-foreground/10 animate-fade-up text-left">
              <ul className="space-y-2 text-left mt-2">
                {COUPONS.slice(0, 3).map((c) => (
                  <li
                    key={c.code}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 text-left p-2.5 rounded bg-foreground/[0.03] border border-foreground/10 hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex items-baseline gap-2 text-left">
                      <span className="font-mono text-xs font-bold text-foreground text-left">
                        [{c.code}]
                      </span>
                      <span className="text-xs text-foreground/75 text-left">
                        {c.label} — {c.description}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(c.code);
                          push({ title: `Coupon ${c.code} copied!`, variant: "success" });
                        }
                      }}
                      className="font-mono text-[9px] uppercase tracking-wider text-foreground/60 hover:text-foreground hover:underline self-end sm:self-auto cursor-pointer"
                    >
                      Copy Code
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Mid Buying Zone ── */}
        <div ref={buySectionRef} className="text-left">
          {/* Color Selection */}
          <div className="mt-6 text-left">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
              COLOR: <span className="font-semibold text-foreground">{color.name.toUpperCase()}</span>
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-2 text-left">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColorIdx(i)}
                  aria-label={c.name}
                  className={cn(
                    "h-7 w-7 border transition",
                    colorIdx === i ? "border-foreground ring-2 ring-foreground" : "border-foreground/30",
                  )}
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-6 text-left">
            <div className="flex items-baseline justify-between text-left">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
                SELECT SIZE
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/60 text-right">
                [STANDARD SIZING]
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2 text-left">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-12 border px-3 py-2 font-mono text-xs uppercase tracking-wider transition text-left",
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/25 hover:border-foreground text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mt-6 flex items-center gap-4 text-left">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
              QUANTITY
            </h3>
            <div className="inline-flex items-center border border-foreground/25 text-left">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-3 py-1 font-mono text-xs hover:bg-foreground/5 text-left"
              >
                -
              </button>
              <span className="border-x border-foreground/25 px-3 py-1 font-mono text-xs font-semibold text-left">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="px-3 py-1 font-mono text-xs hover:bg-foreground/5 text-left"
              >
                +
              </button>
            </div>
            {product.stock <= 10 && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/60 text-left">
                [ONLY {product.stock} LEFT IN STOCK]
              </span>
            )}
          </div>

          {savings > 0 && (
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold text-left">
              TOTAL SAVINGS: {formatINR(savings)}
            </p>
          )}

          {/* Primary Actions */}
          <div className="mt-8 flex gap-3 text-left">
            <button
              onClick={addToBag}
              className="flex flex-1 items-center justify-center border border-foreground bg-transparent px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background text-center font-bold cursor-pointer"
            >
              ADD TO BAG
            </button>
            <button
              onClick={buyNow}
              className="flex flex-1 items-center justify-center border border-foreground bg-foreground px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 text-center font-bold cursor-pointer"
            >
              BUY NOW
            </button>
          </div>

          {/* Shipping, Returns & Payments Guarantees */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-foreground/15 pt-5 text-left">
            <div className="text-left">
              <p className="font-mono text-[10px] uppercase font-semibold text-foreground text-left">
                DELIVERY
              </p>
              <p className="text-xs text-foreground/55 text-left">
                Free above ₹1,499
              </p>
            </div>
            <div className="text-left">
              <p className="font-mono text-[10px] uppercase font-semibold text-foreground text-left">
                RETURNS
              </p>
              <p className="text-xs text-foreground/55 text-left">
                7-day easy returns
              </p>
            </div>
            <div className="text-left">
              <p className="font-mono text-[10px] uppercase font-semibold text-foreground text-left">
                PAYMENTS
              </p>
              <p className="text-xs text-foreground/55 text-left">
                UPI, Cards & COD
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Accordion Sections */}
        <div className="mt-8 divide-y divide-foreground/15 border-y border-foreground/15 text-left">
          {sections.map((s) => (
            <div key={s.id} className="text-left">
              <button
                onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                aria-expanded={openSection === s.id}
                className="flex w-full items-center justify-between py-4 text-left font-mono text-xs uppercase tracking-wider text-foreground hover:underline"
              >
                <span className="text-left">{s.title}</span>
                <span className="font-mono text-sm text-foreground/60 text-right">
                  {openSection === s.id ? "[-]" : "[+]"}
                </span>
              </button>
              {openSection === s.id && (
                <p className="animate-fade-up pb-5 text-sm leading-relaxed text-foreground/75 text-left whitespace-pre-wrap">
                  {s.body}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Persistent Floating Action Bar (Transparent Blur) ── */}
      <aside
        aria-label="Quick Checkout Bar"
        aria-hidden={!showFloatingBar}
        className={cn(
          "fixed bottom-4 sm:bottom-6 inset-x-0 z-40 flex justify-center px-3 sm:px-6 pointer-events-none transition-all duration-500 ease-out",
          showFloatingBar
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto flex w-full max-w-xl sm:max-w-2xl items-center justify-between gap-3 sm:gap-4 rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5",
            "bg-white/40 dark:bg-white/[0.12] backdrop-blur-2xl border border-white/45 dark:border-white/20",
            "shadow-[0_16px_45px_rgba(0,0,0,0.28)]"
          )}
        >
          {/* Product Thumbnail & Details */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 text-left">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-full border border-white/40 dark:border-white/20 bg-surface">
              <ProductImage
                kind={product.kind}
                color={color.hex}
                seed={product.seed}
                image={product.image}
                alt={product.name}
                className="object-cover"
                sizes="44px"
              />
            </div>
            <div className="min-w-0 flex flex-col text-left">
              <span className="text-xs sm:text-sm font-semibold truncate text-foreground text-left">
                {product.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-left">
                <span className="font-bold text-foreground">
                  {formatINR(product.price)}
                </span>
                {size ? (
                  <span className="text-[10px] text-foreground/80 font-medium border border-foreground/20 rounded px-1.5 py-0.5 uppercase">
                    Size: {size}
                  </span>
                ) : (
                  <span className="text-[10px] text-foreground/50 hidden sm:inline">
                    Select size
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Quick Bag + Add to Bag & Checkout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Bag Link inside the bar — mobile only (desktop has bag in top nav) */}
            <Link
              href="/cart"
              aria-label={`Shopping bag with ${count} items`}
              title="View Shopping Bag"
              className="relative sm:hidden flex items-center justify-center h-8 w-8 rounded-full border border-white/40 dark:border-white/20 bg-white/40 hover:bg-white/60 dark:bg-white/[0.14] dark:hover:bg-white/[0.22] text-foreground transition-all duration-200 active:scale-95 shadow-xs shrink-0 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background shadow-xs">
                  {count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={addToBag}
              className="flex items-center justify-center rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold border border-white/50 dark:border-white/25 bg-white/40 hover:bg-white/60 dark:bg-white/[0.14] dark:hover:bg-white/[0.22] text-foreground transition-all duration-200 active:scale-95 shadow-xs uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add to Bag</span>
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="flex items-center justify-center rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-foreground text-background hover:opacity-90 transition-all duration-200 active:scale-95 shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              Checkout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Separate Mobile Floating Bag Button (ONLY when NOT using the bar) ── */}
      {!showFloatingBar && (
        <Link
          href="/cart"
          aria-label={`Shopping bag with ${count} items`}
          className="fixed bottom-5 right-4 z-40 sm:hidden pointer-events-auto flex items-center gap-1.5 rounded-full px-4 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-[0_12px_36px_rgba(0,0,0,0.4)] border border-white/30 active:scale-95 transition-all font-mono text-xs font-black animate-fade-in"
        >
          <span className="font-mono text-xs uppercase tracking-wider">Bag</span>
          <span className="font-mono text-xs font-black">({count})</span>
        </Link>
      )}
    </div>
  );
}
  