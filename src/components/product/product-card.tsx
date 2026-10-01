"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { formatINR, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export const ProductCard = memo(function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const { add } = useCart();
  const { push } = useToast();
  const [added, setAdded] = useState(false);
  const color = product.colors[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      size: product.sizes?.[0] || "M",
      color: color?.name || "Standard",
      colorHex: color?.hex || "#627264",
      kind: product.kind,
      seed: product.seed,
      image: product.image,
    });
    setAdded(true);
    push({
      title: "Added to Bag",
      description: `${product.name} (${product.sizes?.[0] || "M"})`,
      variant: "success",
    });
    setTimeout(() => setAdded(false), 1600);
  };

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "group relative flex flex-col bg-white/80 dark:bg-white/[0.04] rounded-2xl border border-foreground/10 dark:border-white/10 p-2 sm:p-3 text-left transition-all duration-300 shadow-xs hover:shadow-lg hover:border-foreground/30",
        className,
      )}
    >
      {/* ── Photographic Frame ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-muted/30 text-left">
        <ProductImage
          kind={product.kind}
          color={color?.hex || "#627264"}
          seed={product.seed}
          image={product.image}
          alt={product.name}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 50vw"
          priority={priority}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Rating Badge (if available) */}
        {product.rating > 0 && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            <span className="text-amber-400">★</span>
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Quick-Add Action Button */}
        <div className="absolute bottom-2 right-2 z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-semibold tracking-wider cursor-pointer shadow-md transition-all duration-200",
              "bg-black/80 hover:bg-black text-white border-white/20",
              added && "bg-accent text-white border-accent scale-105"
            )}
            title="Add to Shopping Bag"
            aria-label={`Add ${product.name} to Shopping Bag`}
          >
            {added ? (
              <>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Added</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Bag</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Product Information & Pricing (Visible, Bold & Clear) ── */}
      <div className="mt-2.5 sm:mt-3 flex flex-col items-start text-left w-full">
        {/* Brand / Category Lineage */}
        <span className="font-mono text-[9px] sm:text-[11px] uppercase tracking-wider text-foreground/50 line-clamp-1 text-left font-medium">
          {product.brand || "VESTRA Atelier"}
        </span>

        {/* Title */}
        <h3 className="mt-0.5 text-xs sm:text-sm md:text-base font-semibold text-foreground leading-snug line-clamp-1 transition-opacity group-hover:opacity-80 text-left">
          {product.name}
        </h3>

        {/* Price & Discount Row */}
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5 sm:gap-2 text-left">
          <span className="text-xs sm:text-sm md:text-base font-bold text-foreground">
            {formatINR(product.price)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[10px] sm:text-xs text-foreground/45 line-through">
                {formatINR(product.mrp)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {discount}% off
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
});
