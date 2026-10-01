import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api";
import { CATEGORIES } from "@/lib/data/catalog";
import { listProducts } from "@/lib/data/products-repo";
import { discountPercent } from "@/lib/utils";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 48;

function csv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20);
}

function matches(product: Product, params: URLSearchParams): boolean {
  const q = params.get("q")?.trim().toLowerCase();
  if (q) {
    const hay = [
      product.name,
      product.brand,
      product.category,
      product.gender,
      ...product.vibes,
      ...product.occasions,
      ...product.fits,
      ...product.colors.map((c) => c.name),
    ]
      .join(" ")
      .toLowerCase();
    if (!q.split(/\s+/).every((token) => hay.includes(token))) return false;
  }

  const category = params.get("category");
  if (category && category !== "all" && product.category !== category) return false;

  const gender = params.get("gender");
  if (gender && gender !== "all" && product.gender !== gender) return false;

  const vibes = csv(params.get("vibes"));
  if (vibes.length && !vibes.some((v) => product.vibes.map((x) => x.toLowerCase()).includes(v)))
    return false;

  const occasions = csv(params.get("occasions"));
  if (occasions.length && !occasions.some((o) => product.occasions.map((x) => x.toLowerCase()).includes(o)))
    return false;

  const fits = csv(params.get("fits"));
  if (fits.length && !fits.some((f) => product.fits.map((x) => x.toLowerCase()).includes(f)))
    return false;

  const colors = csv(params.get("colors"));
  if (colors.length && !colors.some((c) => product.colors.map((x) => x.name.toLowerCase()).includes(c)))
    return false;

  const sustainability = csv(params.get("sustainability"));
  if (sustainability.length && !sustainability.some((s) => product.sustainability.map((x) => x.toLowerCase()).includes(s)))
    return false;

  const sizes = csv(params.get("sizes"));
  if (sizes.length && !sizes.some((s) => product.sizes.map((x) => x.toLowerCase()).includes(s)))
    return false;

  const min = Number(params.get("minPrice") ?? 0);
  const max = Number(params.get("maxPrice") ?? Infinity);
  if (product.price < min || product.price > max) return false;

  const minRating = Number(params.get("minRating") ?? 0);
  if (product.rating < minRating) return false;

  const minDiscount = Number(params.get("minDiscount") ?? 0);
  if (discountPercent(product.mrp, product.price) < minDiscount) return false;

  return true;
}

function sortProducts(items: Product[], sort: string | null): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "discount":
      return copy.sort(
        (a, b) => discountPercent(b.mrp, b.price) - discountPercent(a.mrp, a.price),
      );
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "new":
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "trending":
    default:
      return copy.sort((a, b) => b.ratingCount - a.ratingCount);
  }
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "products", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get("limit") ?? 24)));
  const sort = searchParams.get("sort");

  let items = (await listProducts()).filter((p) => matches(p, searchParams));
  items = sortProducts(items, sort);

  const total = items.length;
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit);
  const hasMore = start + limit < total;

  return NextResponse.json(
    {
      items: pageItems,
      page,
      total,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      categories: CATEGORIES.length,
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
