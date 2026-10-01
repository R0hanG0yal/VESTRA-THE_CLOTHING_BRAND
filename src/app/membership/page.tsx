import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { JoinButton } from "@/components/membership/join-button";
import { MemberStatusCard } from "@/components/membership/member-status-card";
import { Reveal } from "@/components/ui/reveal";
import { PRODUCTS, BRAND_NAME } from "@/lib/data/catalog";
import { formatINR } from "@/lib/utils";
import { MEMBERSHIP_PRICE, memberPriceFor } from "@/lib/member-pricing";
import { IconImage } from "@/components/ui/icon-image";

export const metadata: Metadata = {
  title: `VIP Member Club — ${BRAND_NAME}`,
  description: `Annual member pass for ${formatINR(MEMBERSHIP_PRICE)}/year: ~30% off all products, early access to new arrivals, free express delivery, and 2x reward points.`,
};

const EXAMPLE_IDS = ["p0002", "p0010", "p0028", "p0046"];

const PERKS = [
  {
    iconName: "sparkles" as const,
    code: "01",
    title: "~30% Off Every Order",
    detail: "Save roughly 30% on every single product across our entire catalog automatically.",
  },
  {
    code: "02",
    iconName: "delivery" as const,
    title: "Free Express Delivery",
    detail: "No minimum order value required. Fast insured delivery right to your doorstep.",
  },
  {
    code: "03",
    iconName: "wishlist" as const,
    title: "48-Hour Early Access",
    detail: "Shop new arrivals and limited-edition collections 48 hours before anyone else.",
  },
  {
    code: "04",
    iconName: "wallet" as const,
    title: "2X Store Credit & Rewards",
    detail: "Earn double cashback and store credit on every purchase to use on future orders.",
  },
  {
    code: "05",
    iconName: "tryon" as const,
    title: "Unlimited 3D Virtual Try-On",
    detail: "Try on any outfit virtually in 3D and get personal colour matching recommendations.",
  },
  {
    code: "06",
    iconName: "authentic" as const,
    title: "30-Day Easy Returns",
    detail: "Hassle-free 30-day returns with free doorstep pickup across India.",
  },
];

export default function MembershipPage() {
  const examples = EXAMPLE_IDS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <div className="relative pb-24 text-left overflow-hidden">
      {/* ═══ MONUMENTAL EDITORIAL HERO SECTION ═══ */}
      <section className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 lg:px-8 text-left">
        <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/20 dark:border-white/12 p-8 sm:p-12 lg:p-16 shadow-[0_24px_70px_rgba(0,0,0,0.25)] text-left">
          
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center text-left">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left">
              <Reveal>
                <div className="flex items-center gap-2.5 mb-3 text-left">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="label-ui text-[10px] tracking-[0.25em] uppercase text-left" style={{ color: "var(--accent)" }}>
                    VIP Member Club Pass
                  </span>
                </div>

                <h1
                  className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.06] text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  Join the Club. <br />
                  <span className="italic font-normal">Save on Every Purchase.</span>
                </h1>

                <p
                  className="mt-5 text-base sm:text-lg leading-relaxed text-left max-w-xl"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--text-subtle)" }}
                >
                  Get VIP benefits for just <span className="font-semibold text-foreground">{formatINR(MEMBERSHIP_PRICE)}/year</span>: flat ~30% discount on every product, free express delivery, and 48-hour early access to new collections.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-8 flex flex-wrap items-center gap-4 text-left">
                  <JoinButton label={`JOIN VIP CLUB — ${formatINR(MEMBERSHIP_PRICE)}/YEAR`} />
                  <Link
                    href="/shop"
                    className="rounded-full px-6 py-4 bg-white/10 hover:bg-white/20 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-white/20 text-foreground transition-all label-ui text-xs tracking-[0.15em] text-left"
                  >
                    Browse Clothes First
                  </Link>
                </div>
                <p className="mt-4 text-[11px] text-left font-mono" style={{ color: "var(--text-subtle)" }}>
                  Instant digital activation · 30% discount applies to your bag right away · No hidden fees
                </p>
              </Reveal>
            </div>

            {/* Right Visual Column: Liquid Glass Editorial Pass */}
            <div className="lg:col-span-5 text-left">
              <Reveal delay={80}>
                <div className="group relative aspect-[4/4.5] w-full overflow-hidden rounded-2xl border border-white/25 dark:border-white/15 shadow-2xl">
                  <Image
                    src="/editorial/atelier-patron-membership.jpg"
                    alt="VESTRA Atelier Patron Membership Pass and haute couture sage sculptural drape"
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Floating Glass Pass Details */}
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/20 p-4 text-left">
                    <div className="flex items-center justify-between text-left">
                      <div className="text-left">
                        <span className="label-ui text-[9px] tracking-[0.2em] text-white/70 block">
                          ATELIER GUILD PASS // 2026-2027
                        </span>
                        <p className="font-serif text-base font-medium text-white italic mt-0.5">
                          Patron Accreditation — {formatINR(MEMBERSHIP_PRICE)}/Year
                        </p>
                      </div>
                      <span className="label-ui text-[9px] font-mono border border-accent/60 bg-accent/20 rounded-full px-3 py-1 text-white">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MEMBER STATUS CARD ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 text-left">
        <MemberStatusCard />
      </section>

      {/* ═══ DUAL VALUATION COMPARATIVE GALLERY ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-left">
        <div className="border-b border-white/15 pb-6 text-left">
          <Reveal>
            <span className="label-ui text-[10px] tracking-[0.25em] text-foreground/50 block">
              Comparative Valuation
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-light text-left" style={{ color: "var(--text-primary)" }}>
              Dual Valuation Ledger.
            </h2>
            <p className="mt-2 text-sm text-foreground/60 max-w-xl text-left font-sans">
              Every garment in the archive is appraised with both standard acquisition rate and patron guild valuation.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left">
          {examples.map((p, idx) => {
            const mp = memberPriceFor(p.price);
            return (
              <Reveal key={p.id} delay={idx * 60}>
                <div className="group rounded-3xl bg-white/[0.04] dark:bg-white/[0.02] backdrop-blur-xl border border-white/15 hover:border-white/30 transition-all duration-500 overflow-hidden text-left shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
                    <ProductImage
                      kind={p.kind}
                      color={p.colors[0].hex}
                      seed={p.seed}
                      image={p.image}
                      alt={p.name}
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-0.5 label-ui text-[9px] text-white">
                      Patron Val
                    </span>
                  </div>

                  <div className="p-5 text-left">
                    <span className="label-ui text-[9px] tracking-widest text-foreground/45 block">
                      {p.brand}
                    </span>
                    <h3 className="font-serif text-base font-normal text-foreground truncate mt-1 text-left">
                      {p.name}
                    </h3>

                    <div className="mt-3 flex items-baseline gap-3 text-left">
                      <span className="font-serif text-xl font-medium text-foreground">{formatINR(mp)}</span>
                      <span className="font-mono text-xs text-foreground/40 line-through">
                        {formatINR(p.price)}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-left">
                      <span className="label-ui text-[9px] tracking-wider text-accent font-medium">
                        Save {formatINR(p.price - mp)}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/50">
                        −{p.price > 0 ? Math.round(((p.price - mp) / p.price) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ═══ ENTITLEMENTS MANIFEST (PRIVILEGES MATRIX) ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-left">
        <div className="rounded-3xl bg-white/10 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/20 dark:border-white/12 p-8 sm:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.2)] text-left">
          
          <div className="border-b border-white/15 pb-6 text-left">
            <Reveal>
              <span className="label-ui text-[10px] tracking-[0.25em] text-foreground/50 block">
                Entitlements Manifest
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-light text-left" style={{ color: "var(--text-primary)" }}>
                Guaranteed Patron Privileges
              </h2>
              <p className="mt-2 text-sm text-foreground/60 text-left font-sans">
                Single annual subscription of {formatINR(MEMBERSHIP_PRICE)}. Comprehensive entitlement ledger active for 365 days.
              </p>
            </Reveal>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
            {PERKS.map((perk, i) => (
              <Reveal key={perk.title} delay={i * 50}>
                <div className="rounded-2xl bg-white/[0.04] dark:bg-white/[0.02] border border-white/10 hover:border-white/25 p-6 transition-all text-left">
                  <div className="flex items-center justify-between text-left">
                    <IconImage
                      name={perk.iconName}
                      alt={perk.title}
                      className="h-7 w-7 object-cover grayscale opacity-80"
                    />
                    <span className="font-mono text-[9px] text-accent/80">
                      {perk.code}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-normal text-foreground text-left">
                    {perk.title}
                  </h3>
                  <p className="mt-2 font-sans text-xs text-foreground/65 leading-relaxed text-left">
                    {perk.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FISCAL EQUILIBRIUM LEDGER ═══ */}
      <section id="join" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-left">
        <div className="grid gap-10 rounded-3xl bg-white/10 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/20 dark:border-white/12 p-8 sm:p-14 lg:grid-cols-2 text-left shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
          <div className="text-left">
            <Reveal>
              <span className="label-ui text-[10px] tracking-[0.25em] text-foreground/50 block">
                Fiscal Equilibrium
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-light text-left" style={{ color: "var(--text-primary)" }}>
                Equilibrium Achieved in Just Two Acquisitions.
              </h2>
              <ul className="mt-8 space-y-4 font-sans text-xs text-foreground/75 text-left">
                {[
                  "Average patron saves ₹1,100 per acquisition run at ~30% preferential valuation.",
                  "Zero delivery levies on all requisitions, including private capsule releases.",
                  "10% wallet rebates compound continuously across ongoing seasonal edits.",
                ].map((line, idx) => (
                  <li key={line} className="flex items-start gap-3 text-left">
                    <span className="font-mono text-xs text-accent shrink-0">0{idx + 1}.</span>
                    <span className="leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <JoinButton label={`ADD MEMBERSHIP TO BAG — ${formatINR(MEMBERSHIP_PRICE)}/YR`} />
              </div>
            </Reveal>
          </div>

          <div className="divide-y divide-white/15 border-y border-white/15 text-left self-center">
            {examples.slice(0, 3).map((p) => {
              const mp = memberPriceFor(p.price);
              return (
                <div key={p.id} className="flex items-center justify-between py-4 text-left">
                  <div className="min-w-0 text-left">
                    <p className="font-serif text-sm font-normal text-foreground truncate text-left">{p.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45 mt-0.5 text-left">
                      Standard {formatINR(p.price)} → Patron {formatINR(mp)}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 label-ui text-[10px] text-accent">
                    Save {formatINR(p.price - mp)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FAQ STIPULATIONS ═══ */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-left">
        <div className="border-b border-white/15 pb-4 text-left">
          <Reveal>
            <span className="label-ui text-[10px] tracking-[0.25em] text-foreground/50 block">
              Clarifications
            </span>
            <h2 className="mt-1 font-serif text-3xl font-light text-foreground text-left">
              Charter Stipulations
            </h2>
          </Reveal>
        </div>

        <div className="mt-8 space-y-3 text-left">
          {[
            {
              q: "Requisition and billing protocol",
              a: `${formatINR(MEMBERSHIP_PRICE)} billed on an annual cycle. Pass credentials stored cryptographically in client cache — no recurring auto-debit without explicit authorization.`,
            },
            {
              q: "Termination terms",
              a: "May be revoked at any juncture from patron dossier. Privileges remain active through concluded term date.",
            },
            {
              q: "Coupon and promotional accumulation",
              a: "Affirmative. Patron valuation acts as the baseline; promotional concession vouchers apply sequentially at checkout.",
            },
            {
              q: "Universal visibility",
              a: "Both standard valuation and patron indices remain transparently displayed across all catalog folios.",
            },
          ].map((f, i) => (
            <Reveal key={f.q} delay={i * 40}>
              <details className="group rounded-2xl bg-white/[0.04] dark:bg-white/[0.02] border border-white/10 p-5 text-left transition-all">
                <summary className="flex cursor-pointer items-center justify-between font-serif text-base font-normal text-foreground text-left">
                  <span>{f.q}</span>
                  <span className="font-mono text-xs text-foreground/40 group-open:rotate-90 transition-transform">
                    [+]
                  </span>
                </summary>
                <p className="mt-3 font-sans text-xs text-foreground/70 leading-relaxed max-w-2xl text-left">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <p className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 font-mono text-[10px] uppercase tracking-widest text-foreground/40 text-left">
        {BRAND_NAME} Patron Pass is a simulated charter — valuations shown for illustrative purposes.
      </p>
    </div>
  );
}

