/* Focused cart member-pricing QA using seeded cart storage. */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const puppeteer = require("puppeteer-core");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
function findChrome() {
  for (const p of CHROME_CANDIDATES) if (fs.existsSync(p)) return p;
  return execSync("where chrome", { encoding: "utf8" }).split("\n")[0].trim();
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Grab a real product's price from the API.
  const products = await (await fetch("http://localhost:3457/api/products?limit=1")).json();
  const p = (products.items ?? products.products ?? products)[0] ?? products.items?.[0];
  console.log("seed product:", p?.id, p?.price);

  const cartItem = {
    productId: p.id,
    name: p.name,
    price: p.price,
    mrp: p.mrp,
    size: p.sizes[0],
    color: p.colors[0].name,
    colorHex: p.colors[0].hex,
    kind: p.kind,
    qty: 1,
    seed: p.seed,
    image: p.image,
  };

  // --- As MEMBER ---
  await page.goto("http://localhost:3457/membership", { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle2" });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /Join for ₹201/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate((item) => {
    localStorage.setItem("vestra_cart_v1", JSON.stringify([item]));
  }, cartItem);
  await page.goto("http://localhost:3457/cart", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 900));
  const member = await page.evaluate(() => {
    const t = document.body.innerText;
    const grab = (re) => {
      const m = t.match(re);
      return m ? m[1] : null;
    };
    return {
      savingsRow: /Member savings \(VESTRA One\)/i.test(t),
      savingsValue: grab(/Member savings \(VESTRA One\)\s*−\s*(₹[\d,]+)/i),
      total: grab(/Total\s*₹([\d,]+)/i),
      crownLinePrice: grab(/₹[\d,]+\s*\n?\s*₹[\d,]+/),
      upsellHidden: !/Members pay/.test(t),
    };
  });
  console.log("cart as member:", JSON.stringify(member));

  // Expected: member total = memberPriceFor(price)
  const expectedMember = Math.max(99, Math.round(p.price * 0.7 / 10) * 10 - 1);
  console.log("expected member line:", expectedMember, "| total incl. shipping logic");

  // --- As NON-MEMBER (fresh profile) ---
  await page.evaluate(() => localStorage.clear());
  await page.evaluate((item) => {
    localStorage.setItem("vestra_cart_v1", JSON.stringify([item]));
  }, cartItem);
  await page.goto("http://localhost:3457/cart", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 900));
  const nonMember = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      savingsRow: /Member savings/i.test(t),
      upsellVisible: /Members pay/.test(t),
      normalTotal: (t.match(/Total\s*₹([\d,]+)/i) || [])[1] ?? null,
    };
  });
  console.log("cart as non-member:", JSON.stringify(nonMember));
  console.log("expected normal line:", p.price);

  await page.screenshot({ path: "C:/tmp/vestra-cart-nonmember.png", fullPage: true });
  await browser.close();
  console.log("DONE");
})().catch((e) => {
  console.error("QA failed:", e.message);
  process.exit(1);
});
