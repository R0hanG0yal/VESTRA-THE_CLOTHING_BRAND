import type { Metadata } from "next";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import {
  BRAND_LEGAL_NAME,
  BRAND_NAME,
  GRIEVANCE_EMAIL,
  SUPPORT_EMAIL,
} from "@/lib/env-public";

export const metadata: Metadata = {
  title: "Privacy Policy & DPDP Act Notice — VESTRA Atelier",
  description:
    "Comprehensive privacy charter and statutory notice in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors"
      >
        <IconImage type="arrow" alt="Return" className="h-4 w-4 object-cover grayscale" />
        <span>Broadside Index // Return</span>
      </Link>

      <header className="mt-8 border-l-2 border-foreground pl-6 text-left">
        <div className="flex items-center gap-2">
          <IconImage type="authentic" alt="Statutory" className="h-5 w-5 object-cover grayscale" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
            Statutory Notice // DPDP Act (2023) Compliance
          </span>
        </div>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
          Privacy Charter & Data Fiduciary Disclosure
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
          Operated by {BRAND_LEGAL_NAME} · CIN: U18101MH2026PTC398214 · Effective Date: January 1, 2026
        </p>
      </header>

      {/* Summary Matrix */}
      <section className="mt-12 border border-line bg-surface p-6 sm:p-8 text-left">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block mb-4">
          Data Principal Rights Summary
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs divide-y sm:divide-y-0 sm:divide-x divide-line text-left">
          <div className="pt-4 sm:pt-0 sm:pr-4 text-left">
            <span className="text-foreground/50 uppercase tracking-wider block">Notice & Consent</span>
            <p className="font-sans text-xs text-foreground/75 mt-1">
              Data collected strictly upon explicit consent with granular purpose demarcation.
            </p>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4 text-left">
            <span className="text-foreground/50 uppercase tracking-wider block">Right to Erasure</span>
            <p className="font-sans text-xs text-foreground/75 mt-1">
              Request immediate irreversible purging of personal records via patron dossier.
            </p>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4 text-left">
            <span className="text-foreground/50 uppercase tracking-wider block">Zero Third-Party Sale</span>
            <p className="font-sans text-xs text-foreground/75 mt-1">
              Personal telemetry and contact records are never commercialized or leased.
            </p>
          </div>
          <div className="pt-4 sm:pt-0 sm:pl-4 text-left">
            <span className="text-foreground/50 uppercase tracking-wider block">Grievance Officer</span>
            <p className="font-sans text-xs text-foreground/75 mt-1">
              Statutory redressal within 48-hour acknowledgment and 30-day resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="mt-12 space-y-12 divide-y divide-line text-left">
        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Clause 01
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Identity of Data Fiduciary
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            {BRAND_LEGAL_NAME} (operating under the trade name &ldquo;{BRAND_NAME}&rdquo;), having its registered office at 42, Haute Couture Boulevard, Nariman Point, Mumbai, Maharashtra 400021, India, acts as the &ldquo;Data Fiduciary&rdquo; under the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).
          </p>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Clause 02
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Principles of Data Minimization & Collection
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            We collect only data strictly necessary for order fulfillment, digital fitment simulation, and client account security:
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-foreground/75 text-left list-disc pl-5">
            <li>Identity & Contact: Full name, delivery address, phone number, and authenticated email address.</li>
            <li>Financial Transacting: UPI virtual payment addresses and transaction settlement IDs (we do not store debit/credit card CVV or PIN numbers).</li>
            <li>Volumetric Try-On Imagery: User-submitted fitting photographs are processed ephemerally for drape kinematics and are not stored permanently without explicit patron opting.</li>
            <li>Technical Telemetry: IP address, device viewport, and security nonces strictly required for prevention of unauthorized checkout automated attacks.</li>
          </ul>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Clause 03
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Purpose Specification & Legal Basis
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            Personal data is processed exclusively pursuant to Section 6 of the DPDP Act 2023 on the grounds of affirmative patron consent and legitimate operational uses:
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs text-foreground/75 text-left list-disc pl-5">
            <li>Physical courier dispatch and courier status messaging via SMS/WhatsApp.</li>
            <li>Verification of membership privileges, wallet credit accrual, and coupon deductions.</li>
            <li>Compliance with statutory tax filing obligations under the Central Goods and Services Tax Act, 2017.</li>
          </ul>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Clause 04
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Data Principal Rights Under DPDP Act 2023
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            As a Data Principal, you are endowed with statutory, enforceable rights:
          </p>
          <div className="mt-4 space-y-3 font-sans text-xs text-foreground/75 leading-relaxed text-left">
            <p><strong>Right to Summary:</strong> You may request an itemized register of all personal records maintained by {BRAND_NAME}.</p>
            <p><strong>Right to Correction & Erasure:</strong> You may modify inaccuracies or demand complete erasure of personal records not required by statutory accounting law.</p>
            <p><strong>Right to Withdraw Consent:</strong> You may revoke consent at any juncture via your Patron Account dashboard or by writing to {SUPPORT_EMAIL}.</p>
            <p><strong>Right of Grievance Redressal:</strong> Unresolved disputes may be escalated to our designated Grievance Officer and subsequently to the Data Protection Board of India.</p>
          </div>
        </article>

        <article className="pt-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
            Clause 05
          </span>
          <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
            Statutory Grievance Redressal Officer
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            In compliance with the DPDP Act 2023 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
          </p>
          <div className="mt-4 border border-line bg-surface p-6 font-mono text-xs text-left leading-relaxed">
            <p><strong>Grievance Officer:</strong> Mr. Arjun Mehra</p>
            <p><strong>Designation:</strong> Data Protection Officer & Legal Counsel</p>
            <p><strong>Direct Electronic Address:</strong> <a href={`mailto:${GRIEVANCE_EMAIL}`} className="underline text-foreground">{GRIEVANCE_EMAIL}</a></p>
            <p><strong>Postal Jurisdiction:</strong> Legal Division, VESTRA Atelier Pvt. Ltd., 42, Nariman Point, Mumbai 400021</p>
            <p><strong>Statutory SLA:</strong> Acknowledged within 48 hours; finalized resolution within 30 calendar days.</p>
          </div>
        </article>
      </div>

      <footer className="mt-16 border-t border-line pt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
        <span>© 2026 {BRAND_LEGAL_NAME}</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground underline underline-offset-4">Terms & Conditions</Link>
          <Link href="/cookies" className="hover:text-foreground underline underline-offset-4">Cookie Protocol</Link>
          <Link href="/refund-policy" className="hover:text-foreground underline underline-offset-4">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
