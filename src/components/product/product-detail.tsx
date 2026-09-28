"use client";

import { useState } from "react";
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
  const { add } = useCart();
  const { push } = useToast();
  const { isActive: isMember } = useMembership();
  const memberPrice = memberPriceFor(product.price);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [saved, setSaved] = useState(false);

  const color = product.colors[colorIdx];
  const off = discountPercent(product.mrp, product.price);
  const savings = (product.mrp - product.price) * qty;

  function grab() {
    if (!size) {
      push({ title: "Designate silhouette size first", variant: "error" });
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
    { id: "details", title: "01 // SARTORIAL ATTRIBUTES & DRAPE", body: product.description },
    {
      id: "size",
      title: "02 // ANATOMICAL SIZING SPECIFICATION",
      body: `Constructed in sizing ${product.sizes.join(", ")}. Cut silhouette: ${product.fits.join(", ")}. Reference atelier form is 5'8" wearing specimen ${product.sizes[Math.min(2, product.sizes.length - 1)]}. Calibrated strictly to continental European sizing standards.`,
    },
    {
      id: "care",
      title: "03 // TEXTILE PROVENANCE & PRESERVATION",
      body: `${product.sustainability.length ? product.sustainability.join(" · ") + ". " : ""}Dry clean only with specialist silk/wool solvents, or delicate hand wash in chilled water. Do not tumble. Press with warm iron over pressing cloth.`,
    },
  ];

  return (
    <div className="grid gap-10 text-left lg:grid-cols-2 lg:gap-16">
      {/* Editorial Flat Photographic Plate - NO CARD */}
      <div className="text-left lg:sticky lg:top-24 lg:self-start">
        <div className="relative overflow-hidden bg-surface-muted border border-foreground/20 text-left">
          <div className="aspect-[3/4] w-full">
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
              push({ title: saved ? "Removed from private archive" : "Saved to private archive", variant: "info" });
            }}
            aria-label="Save to archive"
            className="absolute right-3 top-3 flex items-center gap-1.5 border border-foreground/20 bg-background/90 px-2.5 py-1 text-left font-mono text-[9px] uppercase tracking-wider text-foreground transition hover:bg-background"
          >
            <IconImage type={saved ? "wishlist-active" : "wishlist"} size={14} className="border-none" />
            <span>{saved ? "ARCHIVED" : "SAVE"}</span>
          </button>

          {/* 3D Try-On Action - Left-aligned with Photo Indicator */}
          {product.tryOnReady && (
            <div className="absolute bottom-3 left-3 text-left">
              <Link
                href={`/try-on?product=${product.id}`}
                className="flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 text-left"
              >
                <IconImage type="tryon" size={14} className="border-none invert dark:invert-0" />
                <span className="text-left font-bold">ACTIVATE 3D VIRTUAL FITTING</span>
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

      {/* Editorial Specification & Buy Column - Strict Left Alignment */}
      <div className="flex flex-col text-left">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left">
          ATELIER REGISTRATION: {product.brand} · EDITION {product.id.toUpperCase()}
        </span>
        <h1 className="mt-2 font-serif text-3xl font-normal leading-tight tracking-tight text-foreground text-left sm:text-4xl lg:text-5xl">
          {product.name}
        </h1>

        <div className="mt-3 flex items-center gap-4 text-left">
          <Rating value={product.rating} count={product.ratingCount} />
          <span className="font-mono text-xs text-foreground/50 text-left">
            VIBE: {product.vibes.join(" / ").toUpperCase()}
          </span>
        </div>

        {/* Valuation Block */}
        <div className="mt-6 flex flex-wrap items-baseline gap-3 text-left border-y border-foreground/15 py-4">
          <span className="font-mono text-3xl font-semibold text-foreground text-left">
            {formatINR(product.price)}
          </span>
          <span className="font-mono text-sm text-foreground/40 line-through text-left">
            {formatINR(product.mrp)}
          </span>
          {off > 0 && (
            <span className="font-mono text-xs uppercase tracking-wider text-foreground text-left">
              [{off}% REDUCTION]
            </span>
          )}
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-foreground/50 text-left">
          ALL DUTIES & RECONCILIATION TAXES INCLUDED IN NET VALUATION
        </p>

        {/* Member Privilege Valuation - Flat Hairline Box */}
        <div className="mt-5 border border-foreground/20 bg-surface p-4 text-left">
          <div className="flex items-center gap-2 text-left">
            <IconImage type="crown" size={16} />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground text-left">
              ATELIER PRIVILEGE VALUATION: {formatINR(memberPrice)}
            </span>
          </div>
          <p className="mt-1 font-serif text-xs italic text-foreground/60 text-left">
            {isMember ? "Automated concession reconciled at checkout." : "Reserve access with VESTRA One — ₹201 annually."}
          </p>
        </div>

        {/* Concession Offers Strip */}
        <div className="mt-5 border border-foreground/15 p-4 text-left">
          <div className="flex items-center gap-2 text-left mb-2">
            <IconImage type="gift" size={14} />
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-foreground text-left">
              APPLICABLE ATELIER CONCESSIONS
            </span>
          </div>
          <ul className="space-y-1.5 text-left">
            {COUPONS.slice(0, 3).map((c) => (
              <li key={c.code} className="flex items-baseline gap-2 text-left">
                <span className="font-mono text-xs font-semibold text-foreground text-left">[{c.code}]</span>
                <span className="font-serif text-xs italic text-foreground/70 text-left">
                  {c.label} — {c.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Color Specification */}
        <div className="mt-6 text-left">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
            CHROMATIC PIGMENT: <span className="font-semibold text-foreground">{color.name.toUpperCase()}</span>
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

        {/* Size Specification */}
        <div className="mt-6 text-left">
          <div className="flex items-baseline justify-between text-left">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
              SELECT PATTERN SIZING
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/60 text-right">
              [CONTINENTAL STANDARD]
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

        {/* Quantity Specification */}
        <div className="mt-6 flex items-center gap-4 text-left">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
            SPECIMEN QUANTITY
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
              [{product.stock} REMAINING IN ATELIER]
            </span>
          )}
        </div>

        {savings > 0 && (
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-foreground text-left">
            CUMULATIVE CONCESSION SAVINGS: {formatINR(savings)}
          </p>
        )}

        {/* Primary Actions with Photographic Thumbnails */}
        <div className="mt-8 flex gap-3 text-left">
          <button
            onClick={addToBag}
            className="flex flex-1 items-center justify-between border border-foreground bg-transparent px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background text-left"
          >
            <span className="text-left font-bold">ADD TO PRIVATE BAG</span>
            <IconImage type="bag" size={14} className="border-none" />
          </button>
          <button
            onClick={buyNow}
            className="flex flex-1 items-center justify-between border border-foreground bg-foreground px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 text-left"
          >
            <span className="text-left font-bold">DIRECT CHECKOUT</span>
            <IconImage type="arrow" size={14} className="border-none invert dark:invert-0" />
          </button>
        </div>

        {/* Provenance & Delivery Guarantees - Left-aligned */}
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-foreground/15 pt-5 text-left">
          <div className="text-left">
            <IconImage type="delivery" size={16} />
            <p className="mt-1 font-mono text-[10px] uppercase font-semibold text-foreground text-left">
              DISPATCH
            </p>
            <p className="font-serif text-xs italic text-foreground/55 text-left">
              Complimentary above ₹1,499
            </p>
          </div>
          <div className="text-left">
            <IconImage type="return" size={16} />
            <p className="mt-1 font-mono text-[10px] uppercase font-semibold text-foreground text-left">
              EXCHANGE
            </p>
            <p className="font-serif text-xs italic text-foreground/55 text-left">
              7-day atelier protocol
            </p>
          </div>
          <div className="text-left">
            <IconImage type="shield" size={16} />
            <p className="mt-1 font-mono text-[10px] uppercase font-semibold text-foreground text-left">
              PAYMENTS
            </p>
            <p className="font-serif text-xs italic text-foreground/55 text-left">
              Signed UPI intents
            </p>
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
                <p className="animate-fade-up pb-5 font-serif text-sm italic leading-relaxed text-foreground/75 text-left whitespace-pre-wrap">
                  {s.body}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
  