"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { formatINR, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
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

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        "group relative flex flex-col bg-transparent border border-transparent p-3 text-left transition-all duration-500",
        "hover:bg-white/[0.04] hover:border-white/10 hover:backdrop-blur-md",
        className,
      )}
    >
      {/* ── Minimalist Photographic Frame ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-muted/30 text-left">
        <ProductImage
          kind={product.kind}
          color={color?.hex || "#627264"}
          seed={product.seed}
          image={product.image}
          alt={product.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* ── Glass Quick-Add Action Button ──
            Mobile: Floating transparent glass button at bottom-right of the image
            PC: Flashes in immediately when user hovers over the image */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-medium tracking-wider label-ui cursor-pointer shadow-lg transition-all duration-200",
              "bg-black/50 hover:bg-black/75 text-white border-white/20 backdrop-blur-xl",
              "md:opacity-0 md:translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0",
              added && "bg-accent text-white border-accent scale-105 !opacity-100 !translate-y-0"
            )}
            title="Add to Shopping Bag"
            aria-label={`Add ${product.name} to Shopping Bag`}
          >
            {added ? (
              <>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Added</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Bag</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Essential Title & Single Clean Price (Zero Clutter) ── */}
      <div className="mt-4 flex flex-col items-start text-left">
        <h3
          className="text-lg sm:text-xl font-normal text-foreground leading-snug line-clamp-1 transition-opacity group-hover:opacity-75 text-left"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {product.name}
        </h3>
        <p
          className="mt-1.5 text-sm font-light tracking-wider text-foreground/75 text-left"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {formatINR(product.price)}
        </p>
      </div>
    </Link>
  );
}
