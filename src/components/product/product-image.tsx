import Image from "next/image";
import { GarmentArt } from "@/components/brand/garment-art";
import { cn } from "@/lib/utils";
import type { GarmentKind } from "@/lib/types";

/**
 * Product visual.
 *
 * Renders the real, self-hosted product photo (`/products/…`) when available and
 * falls back to the original GarmentArt illustration otherwise (e.g. an item an
 * admin added without an image). Renders inside a positioned wrapper so it works
 * whether the parent uses `aspect-[3/4]`, a fixed size, or a grid cell.
 */
export function ProductImage({
  kind,
  color,
  seed = 1,
  image,
  alt,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
}: {
  kind: GarmentKind;
  color?: string | null;
  seed?: number;
  image?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const safeColor = color || "#627264";

  if (!image) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <GarmentArt kind={kind} color={safeColor} seed={seed} label={alt} />
      </div>
    );
  }

  // Admins may paste an absolute URL; next/image only optimises configured
  // remote hosts, so fall back to a plain <img> for those.
  if (/^https?:\/\//i.test(image)) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
