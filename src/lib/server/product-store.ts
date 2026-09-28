import { PRODUCTS } from "@/lib/data/catalog";
import type { Product } from "@/lib/types";

/**
 * Demo-mode mutable product store.
 *
 * Used when Supabase is not configured so the admin dashboard is fully
 * functional offline. It is seeded from the static catalogue on first use and
 * lives in server memory (per-process). With Supabase configured the repos
 * read/write Postgres instead and this store is bypassed.
 */

const store = new Map<string, Product>();
let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  for (const product of PRODUCTS) store.set(product.id, structuredClone(product));
  seeded = true;
}

export function allProducts(): Product[] {
  ensureSeeded();
  return [...store.values()];
}

export function findProduct(id: string): Product | undefined {
  ensureSeeded();
  return store.get(id);
}

export function putProduct(product: Product): Product {
  ensureSeeded();
  store.set(product.id, product);
  return product;
}

export function removeProduct(id: string): boolean {
  ensureSeeded();
  return store.delete(id);
}

export function resetProducts(): number {
  store.clear();
  seeded = false;
  ensureSeeded();
  return store.size;
}
