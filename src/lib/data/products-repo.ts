import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, PRODUCTS } from "@/lib/data/catalog";
import {
  allProducts,
  findProduct,
  putProduct,
  removeProduct,
  resetProducts,
} from "@/lib/server/product-store";
import { imageFor } from "@/lib/data/product-images";
import { seeded } from "@/lib/utils";
import type {
  AccessorySlot,
  ColorOption,
  GarmentKind,
  Gender,
  Product,
} from "@/lib/types";
import type { ProductWriteInput } from "@/lib/security/validation";

/**
 * Product repository.
 *
 * Reads/writes the `products` table when Supabase is configured, and falls back
 * to an in-memory store seeded from the static catalogue otherwise. Because the
 * storefront feed and product pages also read through here, admin edits are
 * reflected across the shop.
 */

const VALID_KINDS = new Set<string>([
  ...CATEGORIES.map((c) => c.kind),
  "sneaker",
  "heel",
  "bag",
  "watch",
  "sunglasses",
  "cap",
  "necklace",
  "belt",
]);

const CATEGORY_KIND = new Map(CATEGORIES.map((c) => [c.slug, c.kind]));

interface ProductRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  kind: string;
  gender: string;
  price: number;
  mrp: number;
  rating: number;
  rating_count: number;
  colors: ColorOption[] | null;
  sizes: string[] | null;
  vibes: string[] | null;
  occasions: string[] | null;
  fits: string[] | null;
  sustainability: string[] | null;
  description: string;
  image: string | null;
  try_on_ready: boolean;
  stock: number;
  accessory_slot: string | null;
  seed: number;
  active: boolean;
  created_at: string;
}

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    category: r.category,
    kind: (VALID_KINDS.has(r.kind) ? r.kind : "tshirt") as GarmentKind,
    gender: (["women", "men", "unisex"].includes(r.gender) ? r.gender : "unisex") as Gender,
    price: Number(r.price),
    mrp: Number(r.mrp),
    rating: Number(r.rating),
    ratingCount: Number(r.rating_count),
    colors: r.colors?.length ? r.colors : [{ name: "Onyx", hex: "#111114", tone: "neutral" }],
    sizes: r.sizes?.length ? r.sizes : ["S", "M", "L", "XL"],
    vibes: r.vibes ?? [],
    occasions: r.occasions ?? [],
    fits: r.fits?.length ? r.fits : ["Regular"],
    sustainability: r.sustainability ?? [],
    description: r.description,
    image: r.image ?? undefined,
    tryOnReady: r.try_on_ready,
    stock: Number(r.stock),
    accessorySlot: (r.accessory_slot as AccessorySlot | null) ?? undefined,
    createdAt: r.created_at,
    seed: Number(r.seed),
    active: r.active,
  };
}

function productToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    kind: p.kind,
    gender: p.gender,
    price: p.price,
    mrp: p.mrp,
    rating: p.rating,
    rating_count: p.ratingCount,
    colors: p.colors,
    sizes: p.sizes,
    vibes: p.vibes,
    occasions: p.occasions,
    fits: p.fits,
    sustainability: p.sustainability,
    description: p.description,
    image: p.image ?? null,
    try_on_ready: p.tryOnReady,
    stock: p.stock,
    accessory_slot: p.accessorySlot ?? null,
    seed: p.seed,
    active: p.active,
    created_at: p.createdAt,
  };
}

/** Compose a full Product from partial admin input, merging over an optional base. */
function applyInput(input: ProductWriteInput, base: Product | undefined, forcedId: string): Product {
  const category = input.category ?? base?.category ?? "jackets";
  const kind = (
    input.kind && VALID_KINDS.has(input.kind)
      ? input.kind
      : base?.kind ?? CATEGORY_KIND.get(category) ?? "jacket"
  ) as GarmentKind;
  const price = input.price ?? base?.price ?? 999;
  const mrp = input.mrp ?? base?.mrp ?? Math.round(price * 1.6);
  const id = base?.id ?? forcedId;

  return {
    id,
    name: input.name ?? base?.name ?? "Untitled piece",
    brand: input.brand ?? base?.brand ?? "VESTRA",
    category,
    kind,
    gender: input.gender ?? base?.gender ?? "unisex",
    price,
    mrp: Math.max(mrp, price),
    rating: base?.rating ?? 4.5,
    ratingCount: base?.ratingCount ?? 0,
    colors: input.colors?.length
      ? input.colors
      : base?.colors ?? [{ name: "Onyx", hex: "#111114", tone: "neutral" }],
    sizes: input.sizes?.length ? input.sizes : base?.sizes ?? ["S", "M", "L", "XL"],
    vibes: input.vibes ?? base?.vibes ?? [],
    occasions: input.occasions ?? base?.occasions ?? [],
    fits: input.fits?.length ? input.fits : base?.fits ?? ["Regular"],
    sustainability: input.sustainability ?? base?.sustainability ?? [],
    description:
      input.description ?? base?.description ?? "A new VESTRA piece, freshly added by the studio.",
    tryOnReady: input.tryOnReady ?? base?.tryOnReady ?? true,
    stock: input.stock ?? base?.stock ?? 25,
    accessorySlot: base?.accessorySlot,
    createdAt: base?.createdAt ?? new Date().toISOString(),
    seed: base?.seed ?? Math.floor(seeded(id, 3) * 10_000),
    image:
      input.image ?? base?.image ?? imageFor(kind, Math.floor(seeded(id, 21) * 1000)),
    active: input.active ?? base?.active ?? true,
  };
}

/** Next free product id, derived from the products in the ACTIVE backend. */
function nextIdFrom(products: Product[]): string {
  const max = products.reduce((m, p) => {
    const n = Number(p.id.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `p${String(max + 1).padStart(4, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

export async function listProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return allProducts().filter((p) => p.active);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error || !data) return allProducts().filter((p) => p.active);
  return (data as ProductRow[]).map(rowToProduct);
}

export async function listProductsForAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return allProducts();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return allProducts();
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = await createClient();
  if (!supabase) return findProduct(id);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return findProduct(id);
  return rowToProduct(data as ProductRow);
}

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

export async function createProduct(input: ProductWriteInput): Promise<Product> {
  // Derive the id from the configured backend so ids never collide with rows
  // that exist only in Supabase (not just the static catalogue).
  const existing = await listProductsForAdmin();
  const product = applyInput(input, undefined, nextIdFrom(existing));
  const supabase = await createClient();
  if (!supabase) return putProduct(product);

  const { data, error } = await supabase
    .from("products")
    .insert(productToRow(product))
    .select("*")
    .single();
  if (error || !data) return putProduct(product);
  return rowToProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductWriteInput,
): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;
  const merged = applyInput(input, existing, existing.id);

  const supabase = await createClient();
  if (!supabase) return putProduct(merged);

  const { data, error } = await supabase
    .from("products")
    .update(productToRow(merged))
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return putProduct(merged);
  return rowToProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return removeProduct(id);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return false;
  return true;
}

/** Seed the `products` table from the static catalogue. */
export async function seedCatalog(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return resetProducts();

  const { data: existing } = await supabase.from("products").select("id");
  if (existing && existing.length > 0) return 0;

  const { error } = await supabase.from("products").insert(PRODUCTS.map(productToRow));
  if (error) return 0;
  return PRODUCTS.length;
}
