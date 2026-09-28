import {
  CATEGORIES,
  FITS,
  OCCASIONS,
  PALETTE,
  SUSTAINABILITY,
  VIBES,
} from "@/lib/data/catalog";

export interface ShopFilters {
  q: string;
  category: string;
  gender: string;
  vibes: string[];
  occasions: string[];
  fits: string[];
  colors: string[];
  sizes: string[];
  sustainability: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  minDiscount: number;
  sort: string;
}

export const PRICE_MAX = 5000;

export function emptyFilters(overrides: Partial<ShopFilters> = {}): ShopFilters {
  return {
    q: "",
    category: "all",
    gender: "all",
    vibes: [],
    occasions: [],
    fits: [],
    colors: [],
    sizes: [],
    sustainability: [],
    minPrice: 0,
    maxPrice: PRICE_MAX,
    minRating: 0,
    minDiscount: 0,
    sort: "trending",
    ...overrides,
  };
}

export function serializeFilters(f: ShopFilters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category && f.category !== "all") p.set("category", f.category);
  if (f.gender && f.gender !== "all") p.set("gender", f.gender);
  if (f.vibes.length) p.set("vibes", f.vibes.join(","));
  if (f.occasions.length) p.set("occasions", f.occasions.join(","));
  if (f.fits.length) p.set("fits", f.fits.join(","));
  if (f.colors.length) p.set("colors", f.colors.join(","));
  if (f.sizes.length) p.set("sizes", f.sizes.join(","));
  if (f.sustainability.length) p.set("sustainability", f.sustainability.join(","));
  if (f.minPrice > 0) p.set("minPrice", String(f.minPrice));
  if (f.maxPrice < PRICE_MAX) p.set("maxPrice", String(f.maxPrice));
  if (f.minRating > 0) p.set("minRating", String(f.minRating));
  if (f.minDiscount > 0) p.set("minDiscount", String(f.minDiscount));
  if (f.sort && f.sort !== "trending") p.set("sort", f.sort);
  return p.toString();
}

export function parseFilters(params: URLSearchParams): ShopFilters {
  const list = (key: string) =>
    (params.get(key) ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  const num = (key: string, fallback: number) => {
    const v = Number(params.get(key));
    return Number.isFinite(v) && params.get(key) !== null ? v : fallback;
  };
  return emptyFilters({
    q: params.get("q") ?? "",
    category: params.get("category") ?? "all",
    gender: params.get("gender") ?? "all",
    vibes: list("vibes"),
    occasions: list("occasions"),
    fits: list("fits"),
    colors: list("colors"),
    sizes: list("sizes"),
    sustainability: list("sustainability"),
    minPrice: num("minPrice", 0),
    maxPrice: num("maxPrice", PRICE_MAX),
    minRating: num("minRating", 0),
    minDiscount: num("minDiscount", 0),
    sort: params.get("sort") ?? "trending",
  });
}

export function countActiveFilters(f: ShopFilters): number {
  return (
    f.vibes.length +
    f.occasions.length +
    f.fits.length +
    f.colors.length +
    f.sizes.length +
    f.sustainability.length +
    (f.gender !== "all" ? 1 : 0) +
    (f.category !== "all" ? 1 : 0) +
    (f.minPrice > 0 ? 1 : 0) +
    (f.maxPrice < PRICE_MAX ? 1 : 0) +
    (f.minRating > 0 ? 1 : 0) +
    (f.minDiscount > 0 ? 1 : 0)
  );
}

export const FILTER_GROUPS = {
  categories: CATEGORIES,
  vibes: VIBES,
  occasions: OCCASIONS,
  fits: FITS,
  sustainability: SUSTAINABILITY,
  colors: PALETTE,
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  discounts: [10, 30, 50, 70],
  ratings: [3, 4, 4.5],
  sorts: [
    { value: "trending", label: "Trending" },
    { value: "new", label: "Newest" },
    { value: "price-asc", label: "Price: Low → High" },
    { value: "price-desc", label: "Price: High → Low" },
    { value: "discount", label: "Biggest discount" },
    { value: "rating", label: "Top rated" },
  ],
} as const;
