export type GarmentKind =
  | "tshirt"
  | "shirt"
  | "hoodie"
  | "jacket"
  | "dress"
  | "top"
  | "jeans"
  | "trousers"
  | "skirt"
  | "shorts"
  | "sneaker"
  | "heel"
  | "bag"
  | "watch"
  | "sunglasses"
  | "cap"
  | "necklace"
  | "belt";

export type Gender = "women" | "men" | "unisex";

export type AccessorySlot =
  | "footwear"
  | "bag"
  | "watch"
  | "eyewear"
  | "cap"
  | "jewellery"
  | "belt";

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
  kind: GarmentKind;
}

export interface ColorOption {
  name: string;
  hex: string;
  /** Warm | cool | neutral undertone grouping used by the style advisor. */
  tone: "warm" | "cool" | "neutral";
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  kind: GarmentKind;
  gender: Gender;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  colors: ColorOption[];
  sizes: string[];
  vibes: string[];
  occasions: string[];
  fits: string[];
  sustainability: string[];
  description: string;
  tryOnReady: boolean;
  stock: number;
  accessorySlot?: AccessorySlot;
  createdAt: string;
  /** Deterministic seed used to render the product artwork. */
  seed: number;
  /** Real, self-hosted product photo (under /public/products). */
  image?: string;
  /** Admins can unpublish a product without deleting it. */
  active: boolean;
}

/** A curated "complete the look" bundle (Myntra style). */
export interface Look {
  id: string;
  title: string;
  vibe: string;
  productIds: string[];
  heroId: string;
  bundlePrice: number;
  mrp: number;
}

export interface Coupon {
  code: string;
  label: string;
  type: "percent" | "flat" | "shipping" | "bogo";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  /** Restrict to a category slug, if any. */
  category?: string;
  bank?: string;
  description: string;
  expiresAt: string;
  /** Admins can deactivate a coupon without deleting it. Defaults to true. */
  active?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  mrp: number;
  size: string;
  color: string;
  colorHex: string;
  kind: GarmentKind;
  qty: number;
  seed: number;
  /** Real product photo path, carried through for cart/order thumbnails. */
  image?: string;
}

export interface WalletTxn {
  id: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  createdAt: string;
}

export interface AppliedCoupon {
  code: string;
  label: string;
  discount: number;
  description: string;
}

export interface OrderTotals {
  subtotal: number;
  mrpTotal: number;
  productDiscount: number;
  memberDiscount?: number;
  couponDiscount: number;
  cardDiscount: number;
  shipping: number;
  walletUsed: number;
  total: number;
  cashbackEarned: number;
  /** Extended: MRP-vs-price savings shown as a separate ledger line. */
  mrpDiscount?: number;
  /** Extended: institutional (card) offer object for checkout display. */
  bankOffer?: { bank: string; label: string; discount: number } | null;
}

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totals: OrderTotals;
  address: Address;
  paymentMethod: string;
  status: "placed" | "packed" | "shipped" | "delivered";
  createdAt: string;
}

export type SkinToneId =
  | "fair"
  | "light"
  | "medium"
  | "olive"
  | "tan"
  | "deep"
  | "rich";

export interface SkinTone {
  id: SkinToneId;
  label: string;
  hex: string;
  undertone: "warm" | "cool" | "neutral";
  best: ColorOption[];
  avoid: ColorOption[];
}
