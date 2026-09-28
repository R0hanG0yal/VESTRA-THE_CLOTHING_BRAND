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
    code: "01 // VALUATION",
    title: "~30% Archival Valuation",
    desc: "Preferential guild pricing unlocked automatically on every single garment and archival edition.",
  },
  {
    code: "02 // PRIORITY",
    title: "48-Hour Early Drop Allocations",
    desc: "Inspect and reserve new seasonal batch releases 48 hours prior to open public release.",
  },
  {
    code: "03 // COURIER",
    title: "Complimentary Direct Carriage",
    desc: "Zero minimum threshold. Every acquisition ships direct via insured expedited courier.",
  },
  {
    code: "04 // WALLET",
    title: "Double Credit Rebate Accrual",
    desc: "Compounded credit reserves directly deposited to your atelier wallet on all dispatches.",
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
          SECTION 01 — IMMERSIVE HERO (Shorter & Refined Proportion)
          Full-bleed editorial image with dedicated top navbar clearance.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[68vh] lg:min-h-[74vh] max-h-[740px] text-left overflow-hidden">
        {/* Shorter hero image with lowered object position for clear navbar headroom */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/editorial/hero-architectural-pavilion.jpg"
            alt="Haute editorial campaign: Model wearing architectural double-breasted coat in sage-green cashmere wool with pleated slate trousers and leather handbag in a minimalist modernist pavilion"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%]"
          />
          {/* Top, left, and bottom gradient overlays for navbar clarity and typography contrast */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,14,20,0.85) 0%, rgba(11,14,20,0.35) 20%, transparent 45%), linear-gradient(to right, rgba(11,14,20,0.78) 0%, rgba(11,14,20,0.48) 45%, rgba(11,14,20,0.12) 70%, transparent 100%), linear-gradient(to top, rgba(11,14,20,0.85) 0%, rgba(11,14,20,0.2) 35%, transparent 65%)",
            }}
          />
          {/* Subtle accent ambient glow */}
          <div
            className="absolute top-0 left-0 w-[50%] h-[40%]"
            style={{
              background: "linear-gradient(to bottom right, rgba(98,114,100,0.15), transparent)",
            }}
          />
        </div>

        {/* Content over the hero image — with top padding for floating navbar clearance */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 flex flex-col justify-end min-h-[68vh] lg:min-h-[74vh] max-h-[740px] pt-28 sm:pt-32 pb-12 lg:pb-16 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end text-left">
            {/* Left column: Hero copy */}
            <div className="lg:col-span-7 text-left">
              <Reveal>
                <span className="label-ui text-[10px] tracking-[0.2em] text-left block" style={{ color: "rgba(232,231,227,0.6)" }}>
                  Autumn / Winter Collection 2024
                </span>
              </Reveal>

              {/* MASSIVE ITALIC CORMORANT HEADING */}
              <Reveal delay={80}>
                <h1
                  className="mt-4 text-left"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(3.5rem, 6.5vw, 6.5rem)",
                    fontWeight: 400,
                    fontStyle: "italic",
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                    color: "#EDECE8",
                  }}
                >
                  The Art of<br />
                  Considered<br />
                  Dressing.
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p
                  className="mt-6 max-w-lg text-[15px] leading-relaxed text-left"
                  style={{ fontFamily: "var(--font-sans)", color: "rgba(232,231,227,0.7)" }}
                >
                  Hand-padded horsehair canvas, sculpted silhouettes, and zero synthetic
                  fusing. Pure wool architecture tailored for the modern frame.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-8 flex flex-wrap items-center gap-4 text-left">
                  <PressableLink
                    href="/shop"
                    className="btn-accent px-8 py-4 label-ui text-[12px] tracking-[0.15em] text-left"
                  >
                    Explore the Collection
                  </PressableLink>
                  <Link
                    href="/try-on"
                    className="glass-chip px-7 py-3.5 label-ui text-[12px] tracking-[0.15em] text-left"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      color: "#E8E7E3",
                    }}
                  >
                    Virtual Try-On
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right column: Glass stat panel */}
            <div className="lg:col-span-5 text-left">
              <Reveal delay={320}>
                <div
                  className="p-6 text-left"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(24px) saturate(1.3)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span className="label-ui text-[9px] tracking-[0.2em] block text-left mb-5" style={{ color: "rgba(232,231,227,0.45)" }}>
                    Atelier Specifications
                  </span>
                  <div className="grid grid-cols-3 gap-6 text-left">
                    {[
                      { value: "16", label: "Sartorial Houses" },
                      { value: "100%", label: "Hand-Basted" },
                      { value: "48H", label: "Express Delivery" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <dt
                          className="text-3xl text-left"
                          style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic", color: "#E8E7E3" }}
                        >
                          {stat.value}
                        </dt>
                        <dd
                          className="text-[10px] mt-1 text-left"
                          style={{ fontFamily: "var(--font-sans)", color: "rgba(232,231,227,0.55)" }}
                        >
                          {stat.label}
                        </dd>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/10 text-left">
                    <p className="text-[11px] leading-relaxed text-left" style={{ fontFamily: "var(--font-sans)", color: "rgba(232,231,227,0.4)" }}>
                      Certified domestic weavers & European certified wool reserves. No petroleum-based synthetics.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-md border-y border-white/10 text-left">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-4 sm:px-8 text-left">
          {[
            { icon: "shield" as const, text: "Encrypted Settlement" },
            { icon: "authentic" as const, text: "Traceable Fiber Origin" },
            { icon: "return" as const, text: "7-Day Easy Exchange" },
            { icon: "delivery" as const, text: "Insured Express Carriage" },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-2.5 text-[12px] text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
              <IconImage type={item.icon} size={14} className="grayscale opacity-60" />
              {item.text}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ CAMPAIGN IMAGERY — SECONDARY EDITORIAL ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 text-left">
        {/* Full Cinematic Editorial Image */}
        <Reveal>
          <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-md text-left">
            <div className="aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.4/1] relative w-full">
              <Image
                src="/editorial/hero-campaign-trio.jpg"
                alt="Three models wearing pearl white and matte slate tailored business suits in a minimalist architectural studio"
                fill
                sizes="100vw"
                className="object-cover object-[center_30%] transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-left bg-black/45 backdrop-blur-md border-t border-white/10 flex items-center justify-between"
            >
              <span className="label-ui text-[10px] tracking-wider text-left text-white/85">
                Campaign AW24 — Pearl & Slate Tailored Suiting
              </span>
              <span className="label-ui text-[9px] tracking-widest text-left text-white/60 hidden sm:inline-block">
                Architectural Reserve
              </span>
            </div>
          </div>
        </Reveal>

        {/* Editorial Content Below Image — Making Full Use of Free Space */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] border border-white/10 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between text-left">
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-7 text-left">
              <Reveal delay={80}>
                <span className="label-ui text-[10px] tracking-[0.2em] block text-left" style={{ color: "var(--text-subtle)" }}>
                  The Edit // AW24
                </span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-normal text-left" style={{ color: "var(--text-primary)" }}>
                  Fluid Silhouette. <span className="italic">Heavy Drape.</span>
                </h2>
                <p className="mt-3 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                  Examining the physical weight of unwashed worsted wool and fluid wool crepe against the natural lines of the human frame. Each piece is hand-basted to a batch of fewer than twenty.
                </p>
              </Reveal>
            </div>

            {/* Right Column: Free Space Utilized with Specifications & Green Button on the Right */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-5 text-left lg:text-right">
              <Reveal delay={160}>
                <div className="space-y-1.5 text-left lg:text-right">
                  <div className="flex items-center lg:justify-end gap-2 text-[11px] font-mono" style={{ color: "var(--accent)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span>Batch 01 // 20 Allocated Units</span>
                  </div>
                  <p className="text-[12px]" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                    Pure Biella Reserve Worsted Crepe · Zero Synthetic Fusing
                  </p>
                </div>
              </Reveal>

              <Reveal delay={220}>
                <PressableLink
                  href="/shop"
                  className="btn-accent px-8 py-3.5 label-ui text-[11px] tracking-[0.18em] text-left shrink-0 inline-flex items-center gap-3"
                >
                  <span>View Runway Catalogue</span>
                  <span aria-hidden="true">→</span>
                </PressableLink>
              </Reveal>
            </div>
          </div>
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
              Seasonal Runway Picks
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
                      <span className="label-ui text-[9px] block" style={{ color: "var(--text-subtle)" }}>Fabrication</span>
                      <span className="font-medium mt-0.5 block" style={{ color: "var(--text-primary)" }}>{item.fabric}</span>
                    </div>
                    <div>
                      <span className="label-ui text-[9px] block" style={{ color: "var(--text-subtle)" }}>Provenance</span>
                      <span className="font-medium mt-0.5 block" style={{ color: "var(--text-primary)" }}>{item.loom}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 text-left border-t border-white/10">
                    <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}>{item.price}</span>
                    <Link
                      href={`/category/${item.slug}`}
                      className="btn-outline px-5 py-2.5 label-ui text-[11px] tracking-[0.15em] text-left"
                    >
                      Reserve
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 03 — ATELIER PATRON PRIVILEGE MEMBERSHIP AD
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 text-left">
        <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/20 dark:border-white/12 p-8 sm:p-12 lg:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-left">
          
          {/* Subtle Ambient Radial Glow inside the card */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-surface-muted/30 blur-[100px]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center text-left">
            
            {/* Visual Column: Editorial Patron Card & Drape Silhouette */}
            <div className="lg:col-span-5 text-left">
              <Reveal>
                <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-white/20 dark:border-white/15 shadow-2xl">
                  <Image
                    src="/editorial/atelier-patron-membership.jpg"
                    alt="VESTRA Atelier Patron Membership Card and haute couture sage sculptural drape"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Floating Liquid Glass Pass Badge */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 p-3.5 flex items-center justify-between text-left">
                    <div className="text-left">
                      <p className="label-ui text-[9px] tracking-[0.2em] text-white/70">
                        Atelier Guild Roll
                      </p>
                      <p className="font-serif text-sm font-medium text-white italic">
                        Patron Pass — {formatINR(MEMBERSHIP_PRICE)}/Year
                      </p>
                    </div>
                    <span className="label-ui text-[9px] font-mono border border-white/30 rounded-full px-2.5 py-1 text-white/90 bg-white/10">
                      Patron Tier
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Content Column: Editorial Copy, Privileges & Action Buttons */}
            <div className="lg:col-span-7 text-left">
              <Reveal delay={80}>
                <div className="flex items-center gap-2 mb-2 text-left">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="label-ui text-[10px] tracking-[0.25em] uppercase text-left" style={{ color: "var(--accent)" }}>
                    Patron Privilege Roll // Annual Membership
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-left leading-[1.08]" style={{ color: "var(--text-primary)" }}>
                  One Membership. <br />
                  <span className="italic font-normal">Complete Atelier Access.</span>
                </h2>

                <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-left max-w-xl" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                  Enrol in the {BRAND_NAME} Guild for {formatINR(MEMBERSHIP_PRICE)} annually. Unlock immediate ~30% preferential archival valuation, 48-hour priority access to limited edition drops, and bespoke complimentary white-glove carriage.
                </p>
              </Reveal>

              {/* 4-Item Luxury Privilege Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left border-y border-white/15 py-6">
                {MEMBERSHIP_HIGHLIGHTS.map((privilege, i) => (
                  <Reveal key={privilege.title} delay={120 + i * 40}>
                    <div className="p-3.5 rounded-xl bg-white/[0.04] dark:bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-left">
                      <div className="flex items-center gap-2 text-left">
                        <span className="font-mono text-[9px] text-accent/80">{privilege.code}</span>
                        <h3 className="label-ui text-[11px] tracking-wider font-semibold text-left" style={{ color: "var(--text-primary)" }}>
                          {privilege.title}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                        {privilege.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Action Buttons & Guarantee */}
              <Reveal delay={300}>
                <div className="mt-8 flex flex-wrap items-center gap-4 text-left">
                  <Link
                    href="/membership"
                    className="flex items-center gap-3 rounded-full px-7 py-3.5 bg-foreground text-background hover:opacity-90 transition-all shadow-lg label-ui text-xs tracking-[0.18em] font-medium text-left cursor-pointer"
                  >
                    <span>Acquire Patron Pass — {formatINR(MEMBERSHIP_PRICE)}/yr</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/membership"
                    className="rounded-full px-6 py-3.5 bg-white/10 hover:bg-white/20 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-white/20 text-foreground transition-all label-ui text-xs tracking-[0.15em] text-left"
                  >
                    Inspect Dual Valuation
                  </Link>
                </div>
                <p className="mt-3.5 text-[11px] text-left font-mono" style={{ color: "var(--text-subtle)" }}>
                  Instant digital activation · Re-prices all items in shopping bag immediately · Cancel anytime
                </p>
              </Reveal>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 04 — DEPARTMENTAL CATEGORY RAIL
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 text-left">
        <div className="pb-6 text-left border-b border-white/10">
          <Reveal>
            <span className="label-ui text-[10px] tracking-[0.2em] text-left block" style={{ color: "var(--text-subtle)" }}>
              Departments
            </span>
            <h2 className="mt-2 text-left" style={{ color: "var(--text-primary)" }}>
              Fourteen Houses. One Standard.
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
          SECTION 05 — 3D VIRTUAL FITTING STUDIO
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 text-left">
        <div className="grid gap-10 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 sm:p-14 lg:grid-cols-2 text-left">
          <div className="text-left">
            <Reveal>
              <span className="label-ui text-[10px] tracking-[0.2em] text-left block" style={{ color: "var(--text-subtle)" }}>
                Spatial Fitting
              </span>
              <h2 className="mt-3 text-left" style={{ color: "var(--text-primary)" }}>
                Three Taps from Pose to Perfect Fit.
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <ol className="mt-8 space-y-4 text-[13px] text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                {[
                  "Capture or upload a single pose photograph — processed ephemerally with zero biometric cloud storage.",
                  "Calibrate volumetric drape simulation with millimeter shoulder width and hem fall estimation.",
                  "Inspect 360-degree kinematic garment rotation verified against our 16 department size indexes.",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-left">
                    <span className="text-[12px] font-semibold shrink-0" style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>0{i + 1}</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 text-left">
                <PressableLink
                  href="/try-on"
                  className="btn-accent px-8 py-3.5 label-ui text-[12px] tracking-[0.15em] text-left"
                >
                  Launch Virtual Fitting
                </PressableLink>
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left border-l border-white/10">
            {["p0023", "p0051"].map((id) => {
              const p = getProduct(id);
              if (!p) return null;
              return (
                <Reveal key={id} delay={120}>
                  <div className="bg-white/[0.02] backdrop-blur-md text-left group ml-4 lg:ml-6 border border-white/10 hover:border-white/20 transition-all">
                    <div className="aspect-[3/4] overflow-hidden bg-surface-muted/30">
                      <ProductImage
                        kind={p.kind}
                        color={p.colors[0].hex}
                        seed={p.seed}
                        image={p.image}
                        alt={p.name}
                        sizes="33vw"
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 text-left border-t border-white/10">
                      <p className="text-xs truncate text-left" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{p.name}</p>
                      <p className="text-[10px] text-left mt-0.5" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>{p.brand}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 06 — CHROMATIC PALETTE
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 text-left">
        <div className="grid items-center gap-10 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 sm:p-14 lg:grid-cols-[1.3fr_1fr] text-left">
          <div className="text-left">
            <Reveal>
              <span className="label-ui text-[10px] tracking-[0.2em] text-left block" style={{ color: "var(--text-subtle)" }}>
                Colour Science
              </span>
              <h2 className="mt-3 text-left" style={{ color: "var(--text-primary)" }}>
                Mineral & Earth Chromatic Equilibrium
              </h2>
              <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-left" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                Curated luxury palettes designed to illuminate natural skin undertones
                without synthetic glare.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-8 text-left">
                <PressableLink
                  href="/style-advisor"
                  className="btn-accent px-7 py-3.5 label-ui text-[12px] tracking-[0.15em] text-left"
                >
                  Open Chromatic Scanner
                </PressableLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="grid grid-cols-4 gap-3 text-left">
              {LUXURY_SHADES.map((shade) => (
                <div
                  key={shade.name}
                  className="bg-white/[0.02] backdrop-blur-md p-2.5 text-left group transition-colors border border-white/10 hover:border-white/20"
                >
                  <div
                    className="aspect-square"
                    style={{ background: shade.hex, border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <span className="mt-2 text-[10px] block text-left truncate transition-colors" style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}>
                    {shade.name}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SECTION 07 — SCROLL-ZOOM SHOWCASE ═══ */}
      <ScrollZoomShowcase />

      {/* ═══ SECTION 08 — TRENDING FEED ═══ */}
      <TrendingFeed />

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
                Share your personal patron token. Credit is auto-settled into both ledgers instantly.
              </p>
            </Reveal>
          </div>
          <Reveal delay={100}>
            <Link
              href="/refer"
              className="btn-accent inline-flex shrink-0 items-center gap-3 px-8 py-4 label-ui text-[12px] tracking-[0.15em] text-left"
            >
              <IconImage type="gift" size={14} className="border-none invert dark:invert-0 opacity-80" />
              <span>Generate Token</span>
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
