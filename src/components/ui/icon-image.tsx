"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type IconImageType =
  | "bag"
  | "search"
  | "user"
  | "tryon"
  | "theme"
  | "wishlist"
  | "wishlist-active"
  | "rating"
  | "shield"
  | "delivery"
  | "authentic"
  | "return"
  | "filter"
  | "wallet"
  | "sparkles"
  | "menu"
  | "close"
  | "arrow"
  | "plus"
  | "check"
  | "gift"
  | "palette"
  | "scan"
  | "flame"
  | "layers"
  | "lock"
  | "crown"
  | "help"
  | "order"
  | "trash";

const IMAGE_MAP: Record<IconImageType, string> = {
  bag: "/products/bag-01.jpg",
  search: "/products/jacket-04.jpg",
  user: "/products/dress-01.jpg",
  tryon: "/products/dress-03.jpg",
  theme: "/products/sunglasses-01.jpg",
  wishlist: "/products/necklace-01.jpg",
  "wishlist-active": "/products/necklace-03.jpg",
  rating: "/products/watch-01.jpg",
  shield: "/products/watch-02.jpg",
  delivery: "/products/sneaker-01.jpg",
  authentic: "/products/shirt-01.jpg",
  return: "/products/jacket-02.jpg",
  filter: "/products/shirt-03.jpg",
  wallet: "/products/bag-04.jpg",
  sparkles: "/products/dress-02.jpg",
  menu: "/products/jacket-06.jpg",
  close: "/products/jacket-07.jpg",
  arrow: "/products/top-01.jpg",
  plus: "/products/tshirt-01.jpg",
  check: "/products/shirt-05.jpg",
  gift: "/products/necklace-04.jpg",
  palette: "/products/top-03.jpg",
  scan: "/products/sunglasses-02.jpg",
  flame: "/products/hoodie-01.jpg",
  layers: "/products/trousers-01.jpg",
  lock: "/products/watch-03.jpg",
  crown: "/products/necklace-05.jpg",
  help: "/products/shirt-07.jpg",
  order: "/products/jacket-08.jpg",
  trash: "/products/cap-01.jpg",
};

/**
 * Photographic icon chip. Accepts either `type` or the legacy `name` alias,
 * and sizes from the `size` prop OR Tailwind size classes in `className`.
 */
export function IconImage({
  type,
  name,
  className,
  size,
  alt = "",
}: {
  type?: IconImageType;
  name?: IconImageType;
  className?: string;
  size?: number;
  alt?: string;
}) {
  const iconType = type ?? name;
  const src = (iconType && IMAGE_MAP[iconType]) || "/products/jacket-01.jpg";

  return (
    <span
      className={cn(
        "relative inline-block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-none border border-foreground/20 bg-surface-muted align-middle select-none transition-transform hover:scale-105",
        className,
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      <Image src={src} alt={alt} fill sizes={`${size ?? 18}px`} className="object-cover" unoptimized />
    </span>
  );
}
