import type { Metadata } from "next";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import {
  BRAND_LEGAL_NAME,
  SUPPORT_EMAIL,
} from "@/lib/env-public";

export const metadata: Metadata = {
  title: "Terms & Conditions — VESTRA Atelier",
  description:
    "Statutory terms of patronage, order execution, and intellectual property governed under Indian commercial laws.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors"
      >
        <IconImage type="arrow" alt="Return" className="h-4 w-4 object-cover grayscale" />
        <span>← Back to Home</span>
      </Link>

      <header className="mt-8 border-l-2 border-foreground pl-6 text-left">
        <div className="flex items-center gap-2">
          <IconImage type="shield" alt="Charter" className="h-5 w-5 object-cover grayscale" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
            Legal Terms & Customer Agreement
          </span>
        </div>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
          Terms of Service
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
          Operated by {BRAND_LEGAL_NAME} · CIN: U18101MH2026PTC398214 · Effective: January 1, 2026
        </p>
      </header>

      <div className="mt-12 space-y-12 divide-y divide-line text-left">
        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Section 01
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Patronage Accord & Binding Contract
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            By browsing, requisitioning garments, or subscribing to Atelier Patronage through this digital storefront, you enter into a legally binding agreement with {BRAND_LEGAL_NAME} under the Indian Contract Act, 1872 and the Information Technology Act, 2000.
          </p>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Section 02
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Pricing, Valuation & GST Disclosure
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            All prices exhibited across catalog folios are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST) at statutory apparel tariff rates. We do not deploy deceptive dynamic pricing or manipulative dark patterns.
          </p>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Section 03
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Order Fulfillment & Direct Dispatch
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            Requisitions are verified and passed to insured air courier networks within 48 operational hours of successful payment confirmation. Expected transit duration ranges from 2 to 5 business days pan-India.
          </p>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Section 04
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Intellectual Property & Archival Photography
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            Garment cuts, silhouette patterns, typographic broadside layouts, and computational try-on shaders constitute proprietary intellectual creations of {BRAND_LEGAL_NAME}. Editorial photographs are exhibited under legitimate open licensing with complete attribution documented on our <Link href="/credits" className="underline text-foreground">Provenance Register</Link>.
          </p>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Section 05
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Governing Law & Exclusive Jurisdiction
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            This agreement is construed in accordance with the laws of the Republic of India. In the event of any judicial proceedings, the competent courts situated in Mumbai, Maharashtra shall possess exclusive jurisdiction.
          </p>
        </article>
      </div>

      <footer className="mt-16 border-t border-line pt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
        <span>Concierge Inquiries: {SUPPORT_EMAIL}</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">Privacy Charter</Link>
          <Link href="/cookies" className="hover:text-foreground underline underline-offset-4">Cookie Protocol</Link>
          <Link href="/refund-policy" className="hover:text-foreground underline underline-offset-4">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
