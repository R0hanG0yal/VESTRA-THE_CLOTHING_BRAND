"use client";

import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { BRAND_NAME, BRAND_TAGLINE, CATEGORIES } from "@/lib/data/catalog";
import { BRAND_LEGAL_NAME, CORPORATE_DETAILS } from "@/lib/env-public";

const TRUST = [
  {
    iconType: "shield" as const,
    title: "ENCRYPTED SETTLEMENT",
    detail: "PCI-DSS compliant 256-bit encrypted UPI intent and card settlement rails.",
  },
  {
    iconType: "return" as const,
    title: "7-DAY ATELIER RETURNS",
    detail: "Doorstep courier collection with full refunds to source payment within 2–4 banking days.",
  },
  {
    iconType: "delivery" as const,
    title: "METRO 48H DISPATCH",
    detail: "Express insured transit across Indian tier 1 & 2 cities with live tracking ledger.",
  },
  {
    iconType: "authentic" as const,
    title: "PROVENANCE VERIFIED",
    detail: "Traceable textiles sourced from certified artisanal mills with zero synthetic dilution.",
  },
];

export function SiteFooter() {
  const handleOpenCookieSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vestra_open_cookie_preferences"));
    }
  };

  return (
    <footer className="mt-10 sm:mt-16 border-t border-white/15 bg-white/[0.02] dark:bg-white/[0.01] backdrop-blur-xl text-left">
      {/* ═══ TRUST & REASSURANCE STRIP ═══ */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 text-left border-b border-white/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-left">
          {TRUST.map((t) => (
            <div
              key={t.title}
              className="rounded-xl p-2.5 sm:p-3.5 bg-white/[0.03] dark:bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <IconImage type={t.iconType} size={15} className="grayscale opacity-75 mb-1.5" />
                <p className="label-ui text-[9px] sm:text-[10px] font-bold tracking-wider text-foreground text-left uppercase">
                  {t.title}
                </p>
                <p className="mt-0.5 text-left text-[9px] sm:text-[11px] text-foreground/65 leading-snug font-sans">
                  {t.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MAIN EDITORIAL FOOTER COLUMNS ═══ */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-10 text-left">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 text-left">
          
          {/* Brand & Provenance Card */}
          <div className="text-left lg:col-span-5">
            <Link href="/" className="inline-block text-left group">
              <span
                className="font-serif italic text-xl sm:text-2xl uppercase tracking-[0.16em] text-foreground font-normal transition-opacity group-hover:opacity-75 text-left"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {BRAND_NAME}
              </span>
            </Link>
            
            <p className="mt-0.5 label-ui text-[8px] sm:text-[9px] tracking-[0.2em] text-foreground/45 text-left uppercase">
              Haute Édition · Studio Archive
            </p>
            
            <p className="mt-2 max-w-md text-left text-[11px] sm:text-xs leading-relaxed text-foreground/75 font-serif italic">
              {BRAND_TAGLINE}. Architectural silhouettes, responsive digital fitting calibration, and calibrated pigment palettes designed for human form.
            </p>

            <div className="mt-3 rounded-xl p-2.5 sm:p-3.5 bg-white/[0.03] dark:bg-white/[0.02] border border-white/10 text-left max-w-md">
              <p className="label-ui text-[8px] sm:text-[9px] tracking-wider text-foreground/60 text-left font-semibold">
                Established in Jaipur · Owned by Rohan Goyal
              </p>
              <p className="font-sans text-[10px] sm:text-[11px] font-medium text-foreground text-left mt-0.5">
                Digital Direction by DAGEROZ digital agency
              </p>
              <p className="mt-1 font-mono text-[9px] text-foreground/60 text-left">
                Contact: <a href="mailto:dageroz@gmail.com" className="underline hover:text-foreground">dageroz@gmail.com</a>
              </p>
              <p className="mt-0.5 font-mono text-[8px] sm:text-[9px] text-foreground/50 leading-tight text-left">
                CIN: {CORPORATE_DETAILS.cin} · GSTIN: {CORPORATE_DETAILS.gstin}
              </p>
              <p className="mt-0.5 font-mono text-[8px] sm:text-[9px] text-foreground/45 leading-tight text-left">
                {CORPORATE_DETAILS.registeredOffice}
              </p>
            </div>
          </div>

          {/* Responsive 3-Column Links Directory */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-2 sm:gap-6 text-left">
            {/* 01 // COLLECTIONS */}
            <div className="text-left">
              <h3 className="label-ui text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.25em] text-foreground/50 text-left mb-2 sm:mb-3 uppercase font-bold">
                01 // Collections
              </h3>
              <ul className="space-y-1 sm:space-y-1.5 text-left">
                {CATEGORIES.slice(0, 7).map((c) => (
                  <li key={c.slug} className="text-left">
                    <Link
                      href={`/category/${c.slug}`}
                      className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 02 // ATELIER SUITE */}
            <div className="text-left">
              <h3 className="label-ui text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.25em] text-foreground/50 text-left mb-2 sm:mb-3 uppercase font-bold">
                02 // Suite
              </h3>
              <ul className="space-y-1 sm:space-y-1.5 text-left">
                <li className="text-left">
                  <Link href="/try-on" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    3D Fit Studio
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/style-advisor" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Style Advisor
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/shop?sort=trending" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Lookbook Index
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/membership" className="font-sans text-[10px] sm:text-[12px] text-accent font-medium hover:underline hover:translate-x-0.5 transition-all text-left block truncate">
                    Patron Pass (₹201)
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/refer" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Refer & Earn (₹250)
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/account" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Order Ledger
                  </Link>
                </li>
              </ul>
            </div>

            {/* 03 // STATUTORY & LEGAL */}
            <div className="text-left">
              <h3 className="label-ui text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.25em] text-foreground/50 text-left mb-2 sm:mb-3 uppercase font-bold">
                03 // Statutory
              </h3>
              <ul className="space-y-1 sm:space-y-1.5 text-left">
                <li className="text-left">
                  <Link href="/privacy" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Privacy [DPDP]
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/terms" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Terms
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/refund-policy" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Refunds
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/cookies" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Cookie Audit
                  </Link>
                </li>
                <li className="text-left">
                  <Link href="/credits" className="font-sans text-[10px] sm:text-[12px] text-foreground/75 hover:text-foreground hover:translate-x-0.5 transition-all text-left block truncate">
                    Textile Credits
                  </Link>
                </li>
                <li className="text-left">
                  <button
                    type="button"
                    onClick={handleOpenCookieSettings}
                    className="font-sans text-[10px] sm:text-[12px] text-left text-foreground/75 hover:text-foreground hover:underline cursor-pointer block truncate"
                    aria-label="Manage cookie consent and tracking preferences"
                  >
                    Cookies
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ═══ SUB-FOOTER BAR ═══ */}
      <div className="border-t border-white/10 px-3 py-3 sm:px-6 sm:py-4 text-left">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 text-left md:flex-row md:items-center">
          <div className="text-left">
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-foreground/50 text-left">
              © {new Date().getFullYear()} {BRAND_LEGAL_NAME}. ALL TRADEMARKS REGISTERED.
            </p>
            <p className="font-mono text-[8px] text-foreground/40 mt-0.5 text-left">
              Jaipur, India · Governed by the IT Act, 2000 & DPDP Act, 2023.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-left">
            <Link
              href="/privacy"
              className="label-ui text-[9px] tracking-wider text-foreground/60 hover:text-foreground text-left"
            >
              DPDP Notice
            </Link>
            <Link
              href="/refund-policy"
              className="label-ui text-[9px] tracking-wider text-foreground/60 hover:text-foreground text-left"
            >
              Returns
            </Link>
            <Link
              href="/credits"
              className="label-ui text-[9px] tracking-wider text-foreground/60 hover:text-foreground text-left"
            >
              Attribution
            </Link>
            <Link
              href="/admin"
              className="label-ui text-[9px] tracking-wider text-foreground/60 hover:text-foreground text-left"
            >
              Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

