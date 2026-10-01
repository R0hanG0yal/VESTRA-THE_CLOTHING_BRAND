import type { Metadata } from "next";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { BRAND_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/env-public";

export const metadata: Metadata = {
  title: "Refund & Exchange Protocol — VESTRA Atelier",
  description:
    "Statutory guidelines for garment inspection, doorstep courier returns, and automated UPI payment reversals.",
};

export default function RefundPolicyPage() {
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
          <IconImage type="return" alt="Exchange" className="h-5 w-5 object-cover grayscale" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
            Customer Support // Returns & Exchanges
          </span>
        </div>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
          Refund & Return Policy
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
          {BRAND_LEGAL_NAME} · Consumer Protection (E-Commerce) Rules, 2020 Compliance
        </p>
      </header>

      <div className="mt-12 space-y-12 divide-y divide-line text-left">
        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Protocol 01
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Evaluation Windows
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs text-left">
            <div className="border border-line bg-surface p-6 text-left">
              <span className="text-foreground/45 uppercase tracking-wider block">Standard Store Requisition</span>
              <p className="font-serif text-2xl font-light text-foreground mt-2">7 Days</p>
              <p className="font-sans text-xs text-foreground/65 mt-2">
                Commencing from timestamp of verified doorstep delivery courier receipt.
              </p>
            </div>
            <div className="border border-line bg-surface p-6 text-left">
              <span className="text-foreground/45 uppercase tracking-wider block">Atelier Patron Guild Member</span>
              <p className="font-serif text-2xl font-light text-foreground mt-2">30 Days</p>
              <p className="font-sans text-xs text-foreground/65 mt-2">
                Extended salon privilege with zero question inquiries and priority air courier reverse logistics.
              </p>
            </div>
          </div>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Protocol 02
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Eligibility & Physical Condition Requirements
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            To qualify for full financial reimbursement or dimension exchange:
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-foreground/75 text-left list-disc pl-5">
            <li>Garments must remain unwashed, unworn, and free of fragrance, cosmetic transfer, or fabric alterations.</li>
            <li>Original structural tags, atelier inspection seals, and security barcodes must remain attached.</li>
            <li>Item must be re-packed within the original protective courier sleeve or an equivalent weatherproof enclosure.</li>
          </ul>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Protocol 03
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Doorstep Reverse Logistics & Pickup
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            Initiate a return directly from your <Link href="/account" className="underline text-foreground">Patron Dossier</Link>. Our logistics partner will execute doorstep pickup within 24 to 48 business hours across 19,000+ Indian postal PIN codes. Reverse shipping fees are 100% complimentary for damaged, defective, or incorrectly dispatched garments.
          </p>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Protocol 04
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Settlement Timeline & Reversal Processing
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            Upon return package arrival at our central atelier facility, our tailoring inspection team audits the garment within 24 hours. Once cleared:
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-foreground/75 text-left list-disc pl-5">
            <li><strong>UPI & Netbanking Reversals:</strong> Settled within 2 to 4 business days to originating bank account.</li>
            <li><strong>Atelier Wallet Credit:</strong> Re-credited instantly with an additional 5% patron goodwill bonus.</li>
          </ul>
        </article>
      </div>

      <footer className="mt-16 border-t border-line pt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
        <span>Assistance: {SUPPORT_EMAIL}</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">Privacy Charter</Link>
          <Link href="/terms" className="hover:text-foreground underline underline-offset-4">Terms & Conditions</Link>
          <Link href="/cookies" className="hover:text-foreground underline underline-offset-4">Cookie Protocol</Link>
        </div>
      </footer>
    </div>
  );
}
