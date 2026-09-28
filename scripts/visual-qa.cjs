/* Headless-Chrome visual QA for the redesigned VESTRA homepage. */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const puppeteer = require("puppeteer-core");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (fs.existsSync(p)) return p;
  try {
    return execSync("where chrome", { encoding: "utf8" }).split("\n")[0].trim();
  } catch {
    throw new Error("Chrome not found");
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--force-device-scale-factor=1"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  const failedUrls = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
  page.on("requestfailed", (r) => failedUrls.push(`${r.failure()?.errorText} ${r.url().slice(0, 120)}`));

  await page.goto("http://localhost:3457/", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1200));

  const report = await page.evaluate(() => {
    const out = { brokenImages: 0, imgsTotal: 0, checks: [] };
    const q = (sel) => document.querySelector(sel);
    const has = (name, cond) => out.checks.push(`${cond ? "PASS" : "FAIL"} ${name}`);

    document.querySelectorAll("img").forEach((img) => {
      out.imgsTotal++;
      if (img.complete && img.naturalWidth === 0) out.brokenImages++;
    });

    // Hero: obsidian section, editorial eyebrow, serif H1, gold CTA
    const hero = q('section.bg-ink-900');
    has("obsidian hero section", !!hero);
    const h1 = q("h1");
    has("serif display h1", !!h1 && /Cormorant/i.test(getComputedStyle(h1).fontFamily));
    has(
      "eyebrow copy",
      /obsidian edit/i.test(document.body.innerText),
    );
    const goldCta = [...document.querySelectorAll("a")].find((a) => a.textContent.includes("Begin the try-on"));
    has("gold primary CTA", !!goldCta && goldCta.className.includes("brand-gradient"));
    has(
      "gold CTA text is obsidian (contrast)",
      !!goldCta && getComputedStyle(goldCta).color === "rgb(11, 11, 11)",
    );

    // Product card treatment (home feed)
    const cardTitle = [...document.querySelectorAll("h3.font-display")].find((h) =>
      h.closest(".group"),
    );
    has("serif product titles", !!cardTitle);
    const goldPrice = [...document.querySelectorAll("span")].find((s) =>
      /₹/.test(s.textContent) && s.className.includes("text-brand-500"),
    );
    has("gold price accent", !!goldPrice);

    // Wordmark
    const wordmark = q(".wordmark");
    has(
      "Bodoni wordmark",
      !!wordmark && /Bodoni/i.test(getComputedStyle(wordmark).fontFamily),
    );

    // Palette sanity: no old violet anywhere in inline styles
    has("no legacy violet", !document.documentElement.outerHTML.includes("7c3aed"));

    return out;
  });

  // Screenshot: hero viewport
  await page.screenshot({ path: "C:/tmp/vestra-home-hero.png" });
  // Full page for layout review
  await page.screenshot({ path: "C:/tmp/vestra-home-full.png", fullPage: true });

  // Mobile pass
  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: "C:/tmp/vestra-home-mobile.png" });
  const mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );

  await browser.close();

  console.log(`images: ${report.imgsTotal} total, ${report.brokenImages} broken`);
  report.checks.forEach((c) => console.log(c));
  console.log(`mobile horizontal overflow: ${mobileOverflow ? "YES (bug)" : "none"}`);
  if (errors.length) {
    console.log("console errors:");
    errors.slice(0, 5).forEach((e) => console.log("  " + e));
  }
  if (failedUrls.length) {
    console.log("failed requests:");
    [...new Set(failedUrls)].slice(0, 8).forEach((u) => console.log("  " + u));
  }
})().catch((e) => {
  console.error("QA failed:", e.message);
  process.exit(1);
});
