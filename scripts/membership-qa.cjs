/* Headless QA of the membership flow: join → dual prices → cart re-price → status. */
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

  // 1. Membership page renders with ₹201 and dual-price examples.
  await page.goto("http://localhost:3457/membership", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 800));
  const membership = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      has201: /₹201/.test(t),
      hasPerks: /30% off everything/i.test(t),
      memberPriceCount: [...document.querySelectorAll("span")].filter((s) =>
        /for members|member price/i.test(s.textContent),
      ).length,
    };
  });
  console.log("membership page:", JSON.stringify(membership));
  await page.screenshot({ path: "C:/tmp/vestra-membership.png", fullPage: true });

  // 2. Join from the page.
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle2" });
  await page.click('button:has(span), .brand-gradient') // join button (first gold CTA)
    .catch(() => {});
  // Click the join CTA specifically.
  const joined = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /Join for ₹201/.test(b.textContent));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  await new Promise((r) => setTimeout(r, 1500));
  const state = await page.evaluate(() => ({
    stored: localStorage.getItem("vestra_membership_v1"),
    cookie: document.cookie,
    statusVisible: /active/i.test(document.body.innerText),
  }));
  console.log("join clicked:", joined, JSON.stringify(state));
  await page.screenshot({ path: "C:/tmp/vestra-membership-active.png" });

  // 3. Product page shows dual pricing.
  await page.goto("http://localhost:3457/product/p0002", { waitUntil: "networkidle2" });
  const pdp = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      memberPrice: /member price/i.test(t),
      unlock: t.includes("Applied at checkout"),
    };
  });
  console.log("pdp (as member):", JSON.stringify(pdp));

  // 4. Cart re-prices with member savings.
  await page.goto("http://localhost:3457/shop", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Quick add"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  // pick a size and add
  await page.evaluate(() => {
    const size = [...document.querySelectorAll("button")].find((b) => /^(M|L|30|32|UK 8)$/.test(b.textContent.trim()));
    if (size) size.click();
  });
  await page.evaluate(() => {
    const add = [...document.querySelectorAll("button")].find((b) => /Add \w+ to bag|Added/.test(b.textContent));
    if (add) add.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.goto("http://localhost:3457/cart", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  const cart = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      memberSavingsRow: /Member savings \(VESTRA One\)/i.test(t),
      crownPrice: /Crown/.test(document.body.innerHTML) || /VESTRA One/.test(t),
    };
  });
  console.log("cart (as member):", JSON.stringify(cart));
  await page.screenshot({ path: "C:/tmp/vestra-cart-member.png", fullPage: true });

  // 5. Cancel → prices revert.
  await page.goto("http://localhost:3457/membership", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /Cancel membership/.test(b.textContent));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  const cancelled = await page.evaluate(() => ({
    stored: localStorage.getItem("vestra_membership_v1"),
  }));
  console.log("cancel:", JSON.stringify(cancelled));

  await browser.close();
  console.log("DONE");
})().catch((e) => {
  console.error("QA failed:", e.message);
  process.exit(1);
});
