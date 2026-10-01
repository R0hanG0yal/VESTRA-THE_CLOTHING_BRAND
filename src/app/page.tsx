import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { TrendingFeed } from "@/components/home/trending-feed";
import { ScrollZoomShowcase } from "@/components/home/scroll-zoom-showcase";
import { Reveal } from "@/components/ui/reveal";
import { PressableLink } from "@/components/ui/pressable-link";
import { BRAND_NAME, CATEGORIES, getProduct } from "@/lib/data/catalog";
import { imageFor } from "@/lib/data/product-images";
import { IconImage } from "@/components/ui/icon-image";
import { MEMBERSHIP_PRICE } from "@/lib/member-pricing";
import { formatINR } from "@/lib/utils";
import { HeroCarousel } from "@/components/home/hero-carousel";

const FEATURED_RUNWAY_LOOKS = [
  {
    number: "Look 01",
    name: "Smoked Sage Kimono-Cut Blazer",
    fabric: "580 GSM Fluid Wool Crepe",
    loom: "Biella Atelier Reserve",
    edition: "Batch of 18",
    price: "₹14,800",
    image: "/editorial/look-smoked-sage.jpg",
    slug: "jackets",
  },
  {
    number: "Look 02",
    name: "Graphite Carapace Double-Breasted Coat",
    fabric: "640 GSM Worsted Melton",
    loom: "Combed Virgin Wool",
    edition: "Batch of 12",
    price: "₹18,500",
    image: "/editorial/look-graphite-carapace.jpg",
    slug: "jackets",
  },
];

const MEMBERSHIP_HIGHLIGHTS = [
  {
    code: "01 // DISCOUNT",
    title: "~30% Off Every Order",
    desc: "Flat ~30% off every product, every order.",
  },
  {
    code: "02 // PRIORITY",
    title: "48-Hour Early Access",
    desc: "Shop new arrivals 48 hours before everyone else.",
  },
  {
    code: "03 // SHIPPING",
    title: "Free Express Shipping",
    desc: "Free insured shipping on every order.",
  },
  {
    code: "04 // REWARDS",
    title: "2x Reward Credits",
    desc: "Earn double store credit on every purchase.",
  },
];

const LUXURY_SHADES = [
  { name: "Sage", hex: "#627264" },
  { name: "Pearl", hex: "#F3F2EE" },
  { name: "Slate", hex: "#858986" },
  { name: "Terracotta", hex: "#8e523f" },
  { name: "Navy", hex: "#3d5470" },
  { name: "Cashmere", hex: "#d8d2c5" },
  { name: "Cedar", hex: "#7e584f" },
  { name: "Pine", hex: "#38483b" },
];

export default function HomePage() {
  return (
    <div className="pb-24 text-left">
      {/* ═══════════════════════════════════════════════════════════
          SECTION 01 — E-COMMERCE HERO CAROUSEL
          ═══════════════════════════════════════════════════════════ */}
      <HeroCarousel />

      {/* ═══ TRUST BAR ═══ */}
      <section className="bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-md border-y border-white/10 text-left">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-4 sm:px-8 text-left">
          {[
            { icon: "shield" as const, text: "Secure Payment" },
            { icon: "authentic" as const, text: "Genuine Products" },
            { icon: "return" as const, text: "7-Day Easy Returns" },
            { icon: "delivery" as const, text: "Fast Express Delivery" },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-2.5 text-[12px] text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
              <IconImage type={item.icon} size={14} className="grayscale opacity-60" />
              {item.text}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 08 — TRENDING FEED (MOVED UP FOR BETTER CONVERSION) ═══ */}
      <TrendingFeed />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 04 — DEPARTMENTAL CATEGORY RAIL (MOVED UP)
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 text-left">
        <div className="pb-6 text-left border-b border-white/10">
          <Reveal>
            <span className="label-ui text-[10px] tracking-[0.2em] text-left block" style={{ color: "var(--text-subtle)" }}>
              Departments
            </span>
            <h2 className="mt-2 text-left" style={{ color: "var(--text-primary)" }}>
              Shop By Category
            </h2>
          </Reveal>
        </div>

        <div className="no-scrollbar mt-10 flex gap-5 overflow-x-auto pb-6 text-left">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="w-56 shrink-0 bg-white/[0.02] backdrop-blur-md text-left transition-all duration-500 group border border-white/10 hover:border-white/20"
            >
              <div className="aspect-[3/4] overflow-hidden bg-surface-muted/30">
                <ProductImage
                  kind={c.kind}
                  color="#627264"
                  seed={c.slug.length * 7}
                  image={imageFor(c.kind, 0)}
                  alt={c.name}
                  sizes="224px"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-left border-t border-white/10">
                <p className="text-base text-left transition-colors" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                  {c.name}
                </p>
                <p className="text-[12px] truncate mt-1 text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════
          SECTION 02 — RUNWAY DIPTYCH
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 text-left">
        <div className="pb-6 text-left border-b border-white/10">
          <Reveal>
            <span className="label-ui text-[10px] tracking-[0.2em] text-left block" style={{ color: "var(--text-subtle)" }}>
              Featured Looks
            </span>
            <h2 className="mt-2 text-left" style={{ color: "var(--text-primary)" }}>
              Featured Looks
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {FEATURED_RUNWAY_LOOKS.map((item) => (
            <Reveal key={item.number}>
              <div className="bg-white/[0.02] backdrop-blur-md text-left group border border-white/10 hover:border-white/20 transition-all duration-500">
                <div className="aspect-[3/4] relative w-full overflow-hidden bg-surface-muted/30">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 text-left border-t border-white/10">
                  <div className="flex items-center justify-between text-left">
                    <span className="label-ui text-[10px]" style={{ color: "var(--text-subtle)" }}>{item.number}</span>
                    <span className="label-ui text-[10px]" style={{ color: "var(--text-subtle)" }}>{item.edition}</span>
                  </div>
                  {/* h3 gets Cormorant from base styles */}
                  <h3 className="mt-2 text-left text-xl font-normal" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                    {item.name}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 pt-4 text-[12px] text-left border-t border-white/10" style={{ fontFamily: "var(--font-sans)" }}>
                    <div>
                      <span className="label-ui text-[9px] block" style={{ color: "var(--text-subtle)" }}>Fabric</span>
                      <span className="font-medium mt-0.5 block" style={{ color: "var(--text-primary)" }}>{item.fabric}</span>
                    </div>
                    <div>
                      <span className="label-ui text-[9px] block" style={{ color: "var(--text-subtle)" }}>Made In</span>
                      <span className="font-medium mt-0.5 block" style={{ color: "var(--text-primary)" }}>{item.loom}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 text-left border-t border-white/10">
                    <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}>{item.price}</span>
                    <Link
                      href={`/category/${item.slug}`}
                      className="btn-outline px-5 py-2.5 label-ui text-[11px] tracking-[0.15em] text-left"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>









      {/* ═══════════════════════════════════════════════════════════
          SECTION 09 — REFERRAL
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 text-left">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 sm:p-14 flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left">
          <div className="text-left">
            <Reveal>
              <span className="label-ui text-[10px] tracking-[0.2em] block text-left" style={{ color: "var(--text-subtle)" }}>
                Refer & Earn
              </span>
              <h2 className="mt-2 text-left" style={{ color: "var(--text-primary)" }}>
                Give ₹250, Get ₹250 Store Credit
              </h2>
              <p className="mt-2 max-w-lg text-[13px] text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                Share your link. Both you and your friend get ₹250 store credit instantly.
              </p>
            </Reveal>
          </div>
          <Reveal delay={100}>
            <Link
              href="/refer"
              className="btn-accent inline-flex shrink-0 items-center gap-3 px-8 py-4 label-ui text-[12px] tracking-[0.15em] text-left"
            >
              <IconImage type="gift" size={14} className="border-none invert dark:invert-0 opacity-80" />
              <span>Get Your Referral Link</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <p className="mx-auto max-w-7xl px-5 sm:px-8 label-ui text-[10px] tracking-widest text-left" style={{ color: "var(--text-subtle)", opacity: 0.5 }}>
        {BRAND_NAME} Atelier · Autumn-Winter Monograph
      </p>
    </div>
  );
}
