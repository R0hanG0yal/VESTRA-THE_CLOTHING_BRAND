import manifest from "./product-images.json";

/**
 * Full attribution for the downloaded product photography.
 *
 * Kept out of the client bundle on purpose (see `product-images.ts` for the
 * lightweight path map). Only server components — currently the /credits page —
 * should import this.
 */

export interface ProductImageCredit {
  file: string;
  title: string;
  creator: string;
  license: string;
  licenseVersion: string;
  licenseUrl: string;
  source: string;
  landing: string;
  width: number | null;
  height: number | null;
}

type Pools = Record<string, ProductImageCredit[]>;

const IMAGE_MANIFEST = manifest as {
  generatedAt: string;
  source: string;
  note: string;
  perKind?: number;
  pools: Pools;
};

const pools: Pools = IMAGE_MANIFEST.pools ?? {};

/** Flat list of every downloaded image with its attribution, for /credits. */
export function allImageCredits(): { kind: string; credit: ProductImageCredit }[] {
  return Object.entries(pools).flatMap(([kind, list]) =>
    list.map((credit) => ({ kind, credit })),
  );
}

export const IMAGE_KIND_LABELS: Record<string, string> = {
  tshirt: "T-Shirts",
  shirt: "Shirts",
  hoodie: "Hoodies",
  jacket: "Jackets",
  dress: "Dresses",
  top: "Tops",
  jeans: "Jeans",
  trousers: "Trousers",
  skirt: "Skirts",
  shorts: "Shorts",
  sneaker: "Footwear",
  bag: "Bags",
  watch: "Watches",
  sunglasses: "Eyewear",
  cap: "Caps",
  necklace: "Jewellery",
};
