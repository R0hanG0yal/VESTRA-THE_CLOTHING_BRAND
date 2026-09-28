/**
 * Post-process the downloaded image set.
 *
 *  - Trims each kind's pool to the exact number of products that use it (so we
 *    don't ship dozens of unused files), deleting the extras.
 *  - Emits `product-image-paths.json` — a lightweight `kind -> [file]` map that
 *    is safe to import from client components, keeping the full attribution
 *    data (titles/creators/licences) server-side only.
 *
 * Usage: node scripts/build-image-manifest.mjs
 */

import { readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const FULL = path.resolve("src/lib/data/product-images.json");
const PATHS = path.resolve("src/lib/data/product-image-paths.json");
const IMG_DIR = path.resolve("public/products");

// Mirrors CATEGORIES order in src/lib/data/catalog.ts. 168 products across 16
// kinds → the first 8 kinds get 11 products, the rest get 10.
const CATEGORIES = [
  "tshirt",
  "shirt",
  "hoodie",
  "jacket",
  "dress",
  "top",
  "jeans",
  "trousers",
  "skirt",
  "shorts",
  "sneaker",
  "bag",
  "watch",
  "sunglasses",
  "cap",
  "necklace",
];
const counts = Object.fromEntries(CATEGORIES.map((k, i) => [k, i < 8 ? 11 : 10]));

const manifest = JSON.parse(await readFile(FULL, "utf8"));
const paths = {};
let kept = 0;
let removed = 0;

for (const [kind, pool] of Object.entries(manifest.pools)) {
  const n = counts[kind] ?? pool.length;
  for (let i = n; i < pool.length; i++) {
    try {
      await unlink(path.join(IMG_DIR, pool[i].file));
      removed++;
    } catch {
      /* already gone */
    }
  }
  manifest.pools[kind] = pool.slice(0, n);
  paths[kind] = manifest.pools[kind].map((e) => e.file);
  kept += manifest.pools[kind].length;
}

await writeFile(FULL, JSON.stringify(manifest, null, 2) + "\n");
await writeFile(PATHS, JSON.stringify(paths, null, 2) + "\n");

console.log(`kept ${kept} images, removed ${removed} unused files.`);
