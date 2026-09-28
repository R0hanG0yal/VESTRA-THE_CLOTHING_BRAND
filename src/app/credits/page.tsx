import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/data/catalog";
import { BRAND_LEGAL_NAME, CORPORATE_DETAILS } from "@/lib/env-public";

export const metadata: Metadata = {
  title: "Image Licensing & Textile Provenance Credits | VESTRA Atelier",
  description:
    "Comprehensive copyright attribution, photography licensing declarations, and intellectual property compliance under Indian Copyright Act, 1957.",
};

const PHOTO_LICENSES = [
  {
    category: "Garment & Editorial Photography",
    source: "Unsplash Creative Community",
    license: "Unsplash License (Commercial & Editorial Use Permitted)",
    details: "All editorial campaign lookbook portraits and garment silhouettes are published under royalty-free commercial licenses, granting irrevocable, worldwide right to download, copy, modify, and distribute without copyright infringement.",
  },
  {
    category: "Textile & Swatch Macro Photography",
    source: "Domestic Handloom & Mill Archives",
    license: "Atelier Commissioned & Verified Public Domain Textures",
    details: "High-resolution weave textures, thread counts, and fabric swatches are digitally calibrated for sensory realism under proprietary atelier commissioning.",
  },
  {
    category: "Iconography & Graphic Assets",
    source: "Proprietary Photographic Micro-Specimens",
    license: "Atelier In-House Production",
    details: "All interactive indicators use photographic specimen crops rather than vector glyphs, fully owned and rendered by the VESTRA digital architecture.",
  },
];

export default function CreditsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-left">
      {/* Header */}
      <header className="border-l-2 border-foreground pl-6 sm:pl-8 text-left">
        <span className="font-mono text-xs uppercase tracking-widest text-foreground/50 text-left block">
          Provenance & Compliance // Intellectual Property
        </span>
        <h1 className="mt-3 font-serif text-4xl font-light text-foreground sm:text-5xl text-left">
          Image Copyright & Attribution
        </h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
          Publication Date: September 2026 · Compliant with the Indian Copyright Act, 1957
        </p>
      </header>

      {/* Overview */}
      <section className="mt-12 border-t border-foreground/15 pt-8 text-left">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground text-left">
          01 // COPYRIGHT COMMITMENT
        </h2>
        <p className="mt-4 font-sans text-sm leading-relaxed text-foreground/80 text-left">
          {BRAND_LEGAL_NAME} is dedicated to respecting intellectual property rights across all creative disciplines. In designing the {BRAND_NAME} digital storefront, every photographic garment, lookbook editorial, and textile swatch has been verified for copyright compliance, proper licensing, and ethical usage.
        </p>
      </section>

      {/* Licensing Directory */}
      <section className="mt-12 border-t border-foreground/15 pt-8 text-left">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground text-left">
          02 // ASSET LICENSING REGISTRY
        </h2>
        <div className="mt-6 divide-y divide-foreground/10 text-left">
          {PHOTO_LICENSES.map((item) => (
            <div key={item.category} className="py-6 text-left">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/50 text-left block">
                Category
              </span>
              <h3 className="font-serif text-xl font-normal text-foreground text-left mt-0.5">
                {item.category}
              </h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-left">
                <div>
                  <span className="text-foreground/50">Repository: </span>
                  <span className="text-foreground font-medium">{item.source}</span>
                </div>
                <div>
                  <span className="text-foreground/50">License Type: </span>
                  <span className="text-foreground font-medium">{item.license}</span>
                </div>
              </div>
              <p className="mt-3 font-sans text-xs leading-relaxed text-foreground/70 text-left">
                {item.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Takedown & Grievance Protocol */}
      <section className="mt-12 border-t border-foreground/15 pt-8 text-left">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground text-left">
          03 // NOTICE & TAKEDOWN PROCEDURE (RULE 75, COPYRIGHT RULES 2013)
        </h2>
        <p className="mt-4 font-sans text-sm leading-relaxed text-foreground/80 text-left">
          If you are an author, photographer, or intellectual property holder and believe any asset presented on this platform infringes your copyright, please dispatch a formal notice to our legal registry containing:
        </p>
        <ul className="mt-4 list-disc pl-6 space-y-2 font-sans text-xs text-foreground/75 text-left">
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Specific URL or asset descriptor on {BRAND_NAME}.</li>
          <li>Proof of ownership or legal authority to represent the copyright holder.</li>
          <li>Your contact coordinates (full legal name, address, telephone number, and email).</li>
        </ul>
        <div className="mt-6 border-l-2 border-foreground/20 pl-4 py-2 text-left">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground text-left">
            LEGAL DISPATCH CONTACT
          </p>
          <p className="mt-1 font-mono text-xs text-foreground/70 text-left">
            Email: legal@vestra.studio · CC: {CORPORATE_DETAILS.grievanceOfficer.email}
          </p>
          <p className="font-mono text-xs text-foreground/50 text-left">
            Response SLA: Within 36 working hours in accordance with Indian IT (Intermediary Guidelines) Rules.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <footer className="mt-16 border-t border-foreground/15 pt-8 flex flex-wrap gap-6 text-left">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-foreground underline hover:text-foreground/75 text-left"
        >
          ← Return to Atelier
        </Link>
        <Link
          href="/privacy"
          className="font-mono text-xs uppercase tracking-widest text-foreground underline hover:text-foreground/75 text-left"
        >
          View Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="font-mono text-xs uppercase tracking-widest text-foreground underline hover:text-foreground/75 text-left"
        >
          View Terms & Conditions
        </Link>
      </footer>
    </main>
  );
}
