/**
 * Fetch PREMIUM product photography for the VESTRA catalogue.
 *
 * Source: Unsplash (https://unsplash.com) — high-end, editorial-style
 * photography under the Unsplash License (free for commercial use, no
 * attribution required). We credit photographers anyway on /credits.
 *
 * Usage:  node scripts/fetch-product-images.mjs [--per-kind 11]
 *
 * Notes:
 *  - Uses Unsplash's public search endpoint with per-kind curated queries
 *    tuned so results look like a fashion brand's lookbook.
 *  - Only downloads from `images.unsplash.com` (skips `plus.unsplash.com`
 *    premium/watermarked shots), resized server-side via imgix params so the
 *    repo stays light.
 *  - Attribution for each file is recorded in
 *    `src/lib/data/product-images.json` (surfaced on the /credits page).
 *  - Deterministic: reruns overwrite the same filenames.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PER_KIND = Number(getArg("--per-kind") ?? 11);
const ONLY = getArg("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
const PAGE_SIZE = 30;
const MAX_PAGES = 2;
const MAX_BYTES = 1_800_000;
const MIN_WIDTH = 900;

const OUT_DIR = path.resolve("public/products");
const MANIFEST_PATH = path.resolve("src/lib/data/product-images.json");
const PATHS_PATH = path.resolve("src/lib/data/product-image-paths.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/**
 * Curated search queries per garment kind — tuned for clean, premium,
 * editorial product-style shots (the kind of photo a fashion brand ships).
 */
const KIND_QUERIES = {
  tshirt: ["t-shirt mockup", "plain t-shirt hanger", "white t-shirt fashion"],
  shirt: ["linen shirt fashion", "white shirt men fashion", "oxford shirt style"],
  hoodie: ["hoodie streetwear fashion", "hoodie product photo", "black hoodie fashion"],
  jacket: ["denim jacket product photo", "leather jacket fashion", "bomber jacket fashion"],
  dress: ["dress fashion editorial", "summer dress fashion model", "elegant dress style"],
  top: ["blouse fashion editorial", "woman blouse style", "crop top fashion"],
  jeans: ["jeans product photography", "denim jeans fashion model", "blue jeans style"],
  trousers: ["tailored trousers fashion", "chinos men fashion", "pants fashion editorial"],
  skirt: ["skirt fashion editorial", "midi skirt fashion", "pleated skirt style"],
  shorts: ["denim shorts fashion", "shorts fashion editorial", "tailored shorts style"],
  sneaker: ["sneakers product photography", "white sneakers studio shot", "minimal sneakers fashion"],
  bag: ["leather handbag product photography", "handbag studio shot", "tote bag fashion product"],
  watch: ["wristwatch product photography", "watch closeup studio", "chronograph watch", "watch on wrist fashion", "minimalist watch macro"],
  sunglasses: ["sunglasses product photography", "sunglasses studio shot", "aviator sunglasses fashion"],
  cap: ["cap product photography", "baseball cap studio shot", "cap fashion accessory"],
  necklace: ["necklace product photography", "gold necklace jewelry studio", "minimal jewelry necklace"],
};

/** Portrait looks best for apparel cards; squarish suits flat accessories. */
const KIND_ORIENTATION = {
  tshirt: "portrait",
  shirt: "portrait",
  hoodie: "portrait",
  jacket: "portrait",
  dress: "portrait",
  top: "portrait",
  jeans: "portrait",
  trousers: "portrait",
  skirt: "portrait",
  shorts: "portrait",
  sneaker: "squarish",
  bag: "squarish",
  watch: "squarish",
  sunglasses: "squarish",
  cap: "squarish",
  necklace: "squarish",
};

/** Alt-text words that signal a cluttered / non-product shot. */
const ALT_BLOCKLIST =
  /\b(pile|laundry|clothes ?rack|rack of|second[- ]hand|thrift|garage sale|market stall|flea market|mall|wardrobe|closet|messy|clothesline|clothespin|washing machine|donation|charity shop|litter)\b/i;

const USER_AGENT = "VESTRA-demo-image-fetcher/2.0 (+https://example.com)";

/** Download URL at a sane display size; forces jpg so filenames stay stable. */
function sizedUrl(raw) {
  const sep = raw.includes("?") ? "&" : "?";
  return `${raw}${sep}q=78&w=1000&fit=max&fm=jpg`;
}

async function search(query, orientation, page) {
  const url =
    "https://unsplash.com/napi/search/photos?" +
    new URLSearchParams({
      query,
      orientation,
      per_page: String(PAGE_SIZE),
      page: String(page),
    }).toString();

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.status === 429) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.results) ? json.results : [];
    } catch {
      await sleep(1000 * (attempt + 1));
    }
  }
  return [];
}

function isUsable(item) {
  if (!item?.urls?.raw) return false;
  // Skip the premium (`plus.unsplash.com`) tier — those carry watermarks.
  if (!item.urls.raw.startsWith("https://images.unsplash.com/")) return false;
  if (item.mature) return false;
  if (item.width && item.width < MIN_WIDTH) return false;
  const alt = item.alt_description ?? item.description ?? "";
  if (ALT_BLOCKLIST.test(alt)) return false;
  return true;
}

async function download(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) return null;
      const len = Number(res.headers.get("content-length") ?? 0);
      if (len && len > MAX_BYTES) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0 || buf.length > MAX_BYTES) return null;
      return buf;
    } catch {
      await sleep(800 * (attempt + 1));
    }
  }
  return null;
}

function creditFor(item, file) {
  return {
    file,
    title: (item.alt_description ?? item.description ?? "Unsplash photograph").slice(0, 160),
    creator: (item.user?.name ?? "Unknown").slice(0, 120),
    license: "Unsplash",
    licenseVersion: "",
    licenseUrl: "https://unsplash.com/license",
    source: "Unsplash",
    landing: item.links?.html ?? `https://unsplash.com/photos/${item.id}`,
    width: item.width ?? null,
    height: item.height ?? null,
  };
}

async function fetchKind(kind, queries, orientation) {
  const seen = new Set();
  const candidates = [];

  for (const q of queries) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const results = await search(q, orientation, page);
      if (results.length === 0) break;
      for (const item of results) {
        if (!isUsable(item) || seen.has(item.id)) continue;
        seen.add(item.id);
        candidates.push(item);
      }
      await sleep(300); // be polite to the public endpoint
      if (candidates.length >= PER_KIND * 3) break;
    }
    if (candidates.length >= PER_KIND * 3) break;
  }

  // Keep Unsplash's relevance ranking (it is already editorial-quality), but
  // lightly prefer larger originals for crispness on wide layouts.
  candidates.sort(
    (a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0),
  );

  const pool = [];
  let saved = 0;
  for (const item of candidates) {
    if (saved >= PER_KIND) break;
    const buf = await download(sizedUrl(item.urls.raw));
    if (!buf) continue;
    saved += 1;
    const file = `${kind}-${String(saved).padStart(2, "0")}.jpg`;
    await writeFile(path.join(OUT_DIR, file), buf);
    pool.push(creditFor(item, file));
    process.stdout.write(`  ${kind}: ${file} (${Math.round(buf.length / 1024)}KB)\n`);
  }
  return pool;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const pools = {};
  let total = 0;
  for (const [kind, queries] of Object.entries(KIND_QUERIES)) {
    if (ONLY && !ONLY.includes(kind)) continue;
    const orientation = KIND_ORIENTATION[kind] ?? "portrait";
    process.stdout.write(`Fetching ${kind} (${orientation})…\n`);
    const pool = await fetchKind(kind, queries, orientation);
    pools[kind] = pool;
    total += pool.length;
    if (pool.length < PER_KIND) {
      process.stdout.write(`  ⚠ only ${pool.length}/${PER_KIND} usable for ${kind}\n`);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: "Unsplash (https://unsplash.com)",
    note: "Editorial product photography under the Unsplash License (free for commercial use). See /credits for attribution.",
    perKind: PER_KIND,
    pools,
  };
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  const paths = Object.fromEntries(
    Object.entries(pools).map(([kind, list]) => [kind, list.map((c) => c.file)]),
  );
  await writeFile(PATHS_PATH, JSON.stringify(paths, null, 2) + "\n");

  process.stdout.write(
    `\nDone. ${total} images across ${Object.keys(pools).length} kinds written to public/products/.\n` +
      `Manifest: ${path.relative(process.cwd(), MANIFEST_PATH)}\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
