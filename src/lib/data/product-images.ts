import paths from "./product-image-paths.json";

/**
 * Real product photography paths.
 *
 * The images under `public/products/` were downloaded from Openverse
 * (https://openverse.org) by `scripts/fetch-product-images.mjs`, filtered to
 * commercial-use CC licences. This module is intentionally lightweight
 * (kind → filenames) so it is safe to import from client components; the full
 * attribution data lives in the server-only `image-credits` module.
 */

const IMAGE_PATHS = paths as Record<string, string[]>;

/** Public path for the ordinal-th image of a kind (wraps around the pool). */
export function imageFor(kind: string, ordinal = 0): string | undefined {
  const pool = IMAGE_PATHS[kind];
  if (!pool || pool.length === 0) return undefined;
  const idx = ((ordinal % pool.length) + pool.length) % pool.length;
  return `/products/${pool[idx]}`;
}
