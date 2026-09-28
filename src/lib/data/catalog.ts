import { seeded } from "@/lib/utils";
import { imageFor } from "@/lib/data/product-images";
import type {
  Category,
  ColorOption,
  Coupon,
  GarmentKind,
  Gender,
  Look,
  Product,
  SkinTone,
} from "@/lib/types";

export const BRAND_NAME = "VESTRA";
export const BRAND_TAGLINE = "Wear your aura.";

/* ------------------------------------------------------------------ */
/* Taxonomy                                                            */
/* ------------------------------------------------------------------ */

export const CATEGORIES: Category[] = [
  { slug: "jackets", name: "Jackets & Tailoring", emoji: "🧥", blurb: "Sculpted wool & cashmere", kind: "jacket" },
  { slug: "shirts", name: "Shirts", emoji: "👔", blurb: "Oxford & silk twill", kind: "shirt" },
  { slug: "trousers", name: "Trousers", emoji: "👖", blurb: "Pleated & wide-leg wool", kind: "trousers" },
  { slug: "dresses", name: "Dresses", emoji: "👗", blurb: "Sculpted & fluid drape", kind: "dress" },
  { slug: "tops", name: "Knitwear & Tops", emoji: "👚", blurb: "Fine merino & cashmere", kind: "top" },
  { slug: "jeans", name: "Denim", emoji: "👖", blurb: "Selvedge & structured", kind: "jeans" },
  { slug: "skirts", name: "Skirts", emoji: "🩱", blurb: "Tailored midi & maxi", kind: "skirt" },
  { slug: "hoodies", name: "Atelier Hoodies", emoji: "🥷", blurb: "Cloud-soft French terry", kind: "hoodie" },
  { slug: "shorts", name: "Tailored Shorts", emoji: "🩳", blurb: "Linen & lightweight wool", kind: "shorts" },
  { slug: "footwear", name: "Footwear", emoji: "👟", blurb: "Hand-welted leather & runners", kind: "sneaker" },
  { slug: "bags", name: "Leather Goods", emoji: "👜", blurb: "Full-grain calfskin", kind: "bag" },
  { slug: "watches", name: "Horology", emoji: "⌚", blurb: "Mechanical & steel", kind: "watch" },
  { slug: "eyewear", name: "Eyewear", emoji: "🕶️", blurb: "Handcrafted acetate", kind: "sunglasses" },
  { slug: "jewellery", name: "Fine Jewellery", emoji: "💎", blurb: "Precious metals & gems", kind: "necklace" },
];

export const VIBES = [
  "Y2K",
  "Streetwear",
  "Minimal",
  "Old Money",
  "Athleisure",
  "Boho",
  "Techwear",
  "Coquette",
  "Grunge",
  "Preppy",
  "Cottagecore",
  "Indie",
] as const;

export const OCCASIONS = [
  "Casual",
  "Party",
  "Office",
  "Wedding",
  "Festive",
  "Date Night",
  "Gym",
  "Travel",
] as const;

export const FITS = ["Oversized", "Slim", "Relaxed", "Bodycon", "Regular", "Cropped"] as const;

export const SUSTAINABILITY = [
  "Organic Cotton",
  "Recycled",
  "Vegan",
  "Handmade",
  "Low Water",
] as const;

export const PALETTE: ColorOption[] = [
  { name: "Onyx", hex: "#111114", tone: "neutral" },
  { name: "Ivory", hex: "#f4f1ea", tone: "warm" },
  { name: "Beige", hex: "#d9c7ab", tone: "warm" },
  { name: "Olive", hex: "#5b6b3a", tone: "warm" },
  { name: "Navy", hex: "#1e2a52", tone: "cool" },
  { name: "Maroon", hex: "#6d2430", tone: "warm" },
  { name: "Rust", hex: "#a8532b", tone: "warm" },
  { name: "Emerald", hex: "#1f6f54", tone: "cool" },
  { name: "Cobalt", hex: "#2752c4", tone: "cool" },
  { name: "Lavender", hex: "#b9a7e6", tone: "cool" },
  { name: "Blush", hex: "#e6a8b5", tone: "warm" },
  { name: "Mustard", hex: "#c9962b", tone: "warm" },
  { name: "Chocolate", hex: "#4a3226", tone: "warm" },
  { name: "Sage", hex: "#9caf88", tone: "neutral" },
  { name: "Coral", hex: "#f4674f", tone: "warm" },
  { name: "Teal", hex: "#1b7a8c", tone: "cool" },
  { name: "Powder Blue", hex: "#a9c7e8", tone: "cool" },
  { name: "Wine", hex: "#5a1f3d", tone: "cool" },
];

const SIZES_APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZES_BOTTOM = ["26", "28", "30", "32", "34", "36"];
const SIZES_SHOES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
const SIZES_ONE = ["Free Size"];

const ACCESSORY_KINDS: GarmentKind[] = [
  "sneaker",
  "heel",
  "bag",
  "watch",
  "sunglasses",
  "necklace",
  "belt",
];

const SLOT_BY_KIND: Record<string, Product["accessorySlot"]> = {
  sneaker: "footwear",
  heel: "footwear",
  bag: "bag",
  watch: "watch",
  sunglasses: "eyewear",
  necklace: "jewellery",
  belt: "belt",
};

function sizesFor(kind: GarmentKind): string[] {
  if (["sneaker", "heel"].includes(kind)) return SIZES_SHOES;
  if (["bag", "watch", "sunglasses", "necklace"].includes(kind)) return SIZES_ONE;
  if (["jeans", "trousers", "shorts", "skirt", "belt"].includes(kind)) return SIZES_BOTTOM;
  return SIZES_APPAREL;
}

/* ------------------------------------------------------------------ */
/* Product generation (deterministic — no Math.random so SSR hydration  */
/* stays stable).                                                      */
/* ------------------------------------------------------------------ */

const ADJ: Record<string, string[]> = {
  shirt: ["Oversized", "Linen Blend", "Cuban Collar", "Oxford", "Satin", "Flannel"],
  hoodie: ["Cloud Fleece", "Half-Zip", "Garment-Dyed", "Puffer-Lined", "Cropped", "Acid-Wash"],
  jacket: ["Bomber", "Denim Trucker", "Utility", "Quilted", "Varsity", "Shacket"],
  dress: ["Slip", "Tiered Midi", "Bodycon", "Wrap", "Satin Maxi", "Corset"],
  top: ["Corset", "Knit Cami", "Bustier", "Puff-Sleeve", "Halter", "Ruched"],
  jeans: ["Straight-Leg", "Baggy", "Wide-Leg", "Skinny", "Barrel", "Low-Rise"],
  trousers: ["Pleated", "Cargo", "Tailored", "Wide-Leg", "Parachute", "Slim"],
  skirt: ["Pleated Mini", "Denim Maxi", "A-Line", "Cargo", "Slip", "Tiered"],
  shorts: ["Linen", "Denim", "Cycling", "Cargo", "Sweat", "Tailored"],
  sneaker: ["Retro Runner", "Chunky Court", "Skate Low", "Mesh Trainer", "Platform"],
  heel: ["Block-Heel Mule", "Strappy Sandal", "Kitten Heel", "Platform Loafer"],
  bag: ["Mini Shoulder", "Tote", "Crossbody", "Bucket", "Sling", "Clutch"],
  watch: ["Minimal Steel", "Chronograph", "Skeleton", "Slim Mesh", "Digital Retro"],
  sunglasses: ["Oval", "Cat-Eye", "Square", "Aviator", "Shield Wrap"],
  necklace: ["Layered Chain", "Pendant", "Pearl Strand", "Choker Set"],
  belt: ["Woven Leather", "Chain", "Reversible", "Statement Buckle"],
};

const NOUN: Record<string, string> = {
  shirt: "Shirt",
  hoodie: "Hoodie",
  jacket: "Jacket",
  dress: "Dress",
  top: "Top",
  jeans: "Jeans",
  trousers: "Trousers",
  skirt: "Skirt",
  shorts: "Shorts",
  sneaker: "Sneakers",
  heel: "Heels",
  bag: "Bag",
  watch: "Watch",
  sunglasses: "Sunglasses",
  necklace: "Necklace",
  belt: "Belt",
};

const BRANDS = [
  "VESTRA",
  "VESTRA Studio",
  "Aurra",
  "Nocturne",
  "Loom&Co.",
  "Kindred",
  "Bloom Street",
];

function pick<T>(arr: readonly T[], seed: number, offset = 0): T {
  return arr[Math.floor(seeded(String(seed), offset) * arr.length) % arr.length];
}

function pickMany<T>(arr: readonly T[], seed: number, count: number, salt = 0): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < count && i < 40; i++) {
    const v = arr[Math.floor(seeded(String(seed) + i, salt) * arr.length) % arr.length];
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

function buildProduct(index: number): Product {
  const seed = 1000 + index * 37;
  const category = CATEGORIES[index % CATEGORIES.length];
  const kind = category.kind;
  const isAccessory = ACCESSORY_KINDS.includes(kind);

  const adj = pick(ADJ[kind] ?? ["Classic"], seed, 1);
  const color = pick(PALETTE, seed, 2);
  const brand = pick(BRANDS, seed, 3);
  const noun = NOUN[kind] ?? "Piece";

  const base = isAccessory ? 799 + Math.floor(seeded(String(seed), 4) * 4200) : 999 + Math.floor(seeded(String(seed), 4) * 3600);
  const mrp = Math.round((base * (1.4 + seeded(String(seed), 5) * 0.9)) / 10) * 10;

  const genderPool: Gender[] = ["women", "men", "unisex"];
  const gender: Gender =
    ["dress", "top", "skirt", "heel"].includes(kind)
      ? "women"
      : pick(genderPool, seed, 6);

  const vibes = pickMany(VIBES, seed, 2 + Math.floor(seeded(String(seed), 7) * 2), 8);
  const occasions = pickMany(OCCASIONS, seed, 2, 9);
  const fits = pickMany(FITS, seed, 1, 10);
  const sustainability = pickMany(SUSTAINABILITY, seed, Math.floor(seeded(String(seed), 11) * 3), 12);

  const daysAgo = Math.floor(seeded(String(seed), 13) * 120);
  const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();

  const rating = Math.round((3.7 + seeded(String(seed), 14) * 1.3) * 10) / 10;

  const actualFits = fits.length ? fits : ["Regular"];
  const primaryFit = actualFits[0];
  const vibeStr = vibes.length > 0 ? vibes.join(" and ") : "timeless";
  const occStr = occasions.length > 0 ? occasions.join(" and ") : "any elevated setting";
  const susStr = sustainability.length > 0 ? ` As part of our commitment to the environment, this garment is crafted using ${sustainability.join(" and ")}.` : "";

  const descP1 = `The ${adj} ${noun} represents the pinnacle of modern atelier design. Rendered in an exclusive ${color.name} hue, this piece perfectly captures a ${vibeStr.toLowerCase()} aesthetic tailored for a ${primaryFit.toLowerCase()} fit.`;
  const descP2 = `Engineered for everyday elegance, it seamlessly bridges the gap between structural form and fluid function, making it an ideal choice for ${occStr.toLowerCase()}.${susStr}`;
  const descP3 = `Each detail has been meticulously considered—from the textural drape to the precision stitching—ensuring it remains a foundational wardrobe staple for seasons to come.`;

  const description = `${descP1}\n\n${descP2}\n\n${descP3}`;

  return {
    id: `p${(index + 1).toString().padStart(4, "0")}`,
    name: `${adj} ${noun}`,
    brand,
    category: category.slug,
    kind,
    gender,
    price: base,
    mrp,
    rating,
    ratingCount: 8 + Math.floor(seeded(String(seed), 15) * 54),
    colors: [color],
    sizes: sizesFor(kind),
    vibes,
    occasions,
    fits: actualFits,
    sustainability,
    description,
    tryOnReady: !isAccessory,
    stock: 4 + Math.floor(seeded(String(seed), 20) * 60),
    accessorySlot: SLOT_BY_KIND[kind],
    createdAt,
    seed,
    image: imageFor(kind, Math.floor(index / CATEGORIES.length)),
    active: true,
  };
}

export const PRODUCTS: Product[] = Array.from({ length: 168 }, (_, i) => buildProduct(i));

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsBySlot(slot: Product["accessorySlot"], exclude?: string): Product[] {
  return PRODUCTS.filter((p) => p.accessorySlot === slot && p.id !== exclude);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Looks — complete outfits with accessories                          */
/* ------------------------------------------------------------------ */

const LOOK_HEADLINE = [
  "Weekend In The City",
  "Neon Nights",
  "Soft Launch",
  "Off-Duty Muse",
  "Golden Hour",
  "Studio 54",
  "Monsoon Muse",
  "Rooftop Ready",
  "Main Character",
  "Quiet Luxury",
  "First Date Energy",
  "Airport Fit",
];

function buildLooks(): Look[] {
  const looks: Look[] = [];
  const mains = PRODUCTS.filter((p) => p.tryOnReady);
  for (let i = 0; i < 24; i++) {
    const hero = mains[(i * 7) % mains.length];
    const bottom = PRODUCTS.find(
      (p) => ["jeans", "trousers", "skirt", "shorts"].includes(p.kind) && p.gender === hero.gender,
    );
    const footwear = productsBySlot("footwear")[i % productsBySlot("footwear").length];
    const bag = productsBySlot("bag")[(i + 3) % productsBySlot("bag").length];
    const watch = productsBySlot("watch")[(i + 1) % productsBySlot("watch").length];
    const ids = [hero.id, bottom?.id, footwear?.id, bag?.id, watch?.id].filter(Boolean) as string[];
    const items = ids.map(getProduct).filter(Boolean) as Product[];
    const mrp = items.reduce((s, p) => s + p.mrp, 0);
    const bundlePrice = Math.round(items.reduce((s, p) => s + p.price, 0) * 0.88);
    looks.push({
      id: `look${(i + 1).toString().padStart(2, "0")}`,
      title: LOOK_HEADLINE[i % LOOK_HEADLINE.length],
      vibe: pick(VIBES, 500 + i, 1),
      productIds: ids,
      heroId: hero.id,
      bundlePrice,
      mrp,
    });
  }
  return looks;
}

export const LOOKS: Look[] = buildLooks();

export function getLook(id: string): Look | undefined {
  return LOOKS.find((l) => l.id === id);
}

/* ------------------------------------------------------------------ */
/* Coupons & offers                                                   */
/* ------------------------------------------------------------------ */

export const COUPONS: Coupon[] = [
  { code: "VESTRA20", label: "20% OFF", type: "percent", value: 20, minOrder: 1999, maxDiscount: 1500, description: "Flat 20% off on orders above ₹1,999", expiresAt: "2026-12-31" },
  { code: "NEW100", label: "₹100 OFF", type: "flat", value: 100, minOrder: 499, description: "₹100 off for first-time shoppers", expiresAt: "2026-12-31" },
  { code: "FREESHIP", label: "FREE DELIVERY", type: "shipping", value: 0, minOrder: 0, description: "Free delivery on any order", expiresAt: "2026-12-31" },
  { code: "DENIM15", label: "15% OFF DENIM", type: "percent", value: 15, minOrder: 999, maxDiscount: 800, category: "jeans", description: "15% off everything denim", expiresAt: "2026-12-31" },
  { code: "PARTY25", label: "25% OFF PARTY", type: "percent", value: 25, minOrder: 2499, maxDiscount: 2000, description: "25% off party-ready fits", expiresAt: "2026-12-31" },
  { code: "VESTRA500", label: "₹500 OFF", type: "flat", value: 500, minOrder: 3999, description: "₹500 off on big hauls above ₹3,999", expiresAt: "2026-12-31" },
];

export interface BankOffer {
  bank: "HDFC" | "ICICI" | "AXIS";
  label: string;
  detail: string;
  percent: number;
  flat?: number;
  maxDiscount: number;
  minSpend: number;
}

export const BANK_OFFERS: BankOffer[] = [
  { bank: "HDFC", label: "10% instant discount", detail: "on HDFC Credit Cards, min spend ₹2,499", percent: 10, maxDiscount: 1000, minSpend: 2499 },
  { bank: "ICICI", label: "₹300 instant discount", detail: "on ICICI Debit Cards, min spend ₹1,999", percent: 0, flat: 300, maxDiscount: 300, minSpend: 1999 },
  { bank: "AXIS", label: "15% instant discount", detail: "on Axis Credit Cards, min spend ₹2,999", percent: 15, maxDiscount: 1500, minSpend: 2999 },
];

/* ------------------------------------------------------------------ */
/* Skin tone advice                                                   */
/* ------------------------------------------------------------------ */

function byName(names: string[]): ColorOption[] {
  return names
    .map((n) => PALETTE.find((p) => p.name === n))
    .filter(Boolean) as ColorOption[];
}

export const SKIN_TONES: SkinTone[] = [
  {
    id: "fair", label: "Fair", hex: "#f6ddc9", undertone: "cool",
    best: byName(["Navy", "Lavender", "Powder Blue", "Emerald", "Wine"]),
    avoid: byName(["Beige", "Mustard", "Ivory"]),
  },
  {
    id: "light", label: "Light", hex: "#eec3a2", undertone: "neutral",
    best: byName(["Sage", "Teal", "Cobalt", "Blush", "Onyx"]),
    avoid: byName(["Ivory", "Coral"]),
  },
  {
    id: "medium", label: "Medium", hex: "#d69b72", undertone: "warm",
    best: byName(["Rust", "Emerald", "Ivory", "Coral", "Navy"]),
    avoid: byName(["Beige", "Sage"]),
  },
  {
    id: "olive", label: "Olive", hex: "#b5804f", undertone: "warm",
    best: byName(["Mustard", "Chocolate", "Teal", "Maroon", "Cobalt"]),
    avoid: byName(["Olive", "Sage"]),
  },
  {
    id: "tan", label: "Tan", hex: "#9c6a3f", undertone: "warm",
    best: byName(["Blush", "Emerald", "Lavender", "Ivory", "Wine"]),
    avoid: byName(["Rust", "Chocolate"]),
  },
  {
    id: "deep", label: "Deep", hex: "#6f4a2c", undertone: "neutral",
    best: byName(["Coral", "Powder Blue", "Mustard", "Ivory", "Teal"]),
    avoid: byName(["Chocolate", "Wine"]),
  },
  {
    id: "rich", label: "Rich", hex: "#43291a", undertone: "neutral",
    best: byName(["Ivory", "Coral", "Blush", "Powder Blue", "Emerald"]),
    avoid: byName(["Chocolate", "Onyx"]),
  },
];

export function getSkinTone(id: string): SkinTone | undefined {
  return SKIN_TONES.find((s) => s.id === id);
}

/** Products that contain at least one of the given colour names. */
export function productsMatchingColors(names: string[]): Product[] {
  const set = new Set(names.map((n) => n.toLowerCase()));
  return PRODUCTS.filter((p) => p.colors.some((c) => set.has(c.name.toLowerCase())));
}
