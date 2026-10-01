import type { Metadata } from "next";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { BRAND_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/env-public";

export const metadata: Metadata = {
  title: "Cookie Protocol & Storage Disclosure — VESTRA Atelier",
  description:
    "Transparent audit of client-side storage, cryptographic nonces, and telemetry cookies utilized by the VESTRA Atelier platform.",
};

export default function CookiesPage() {
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
          <IconImage type="palette" alt="Cookies" className="h-5 w-5 object-cover grayscale" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
            Cookie Preferences & Data Transparency
          </span>
        </div>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
          Cookie Policy
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
          {BRAND_LEGAL_NAME} · Updated: January 1, 2026
        </p>
      </header>

      <div className="mt-12 space-y-10 divide-y divide-line text-left">
        <article className="pt-8 text-left">
          <h2 className="font-serif text-2xl font-light text-foreground text-left">
            Our Approach to Cookies & Privacy
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            VESTRA does not use intrusive advertising trackers or sell your browsing history. We only store essential data required to maintain your shopping bag, secure your login, and remember your display preferences.
          </p>
        </article>

        <article className="pt-8 text-left">
          <h2 className="font-serif text-2xl font-light text-foreground text-left">
            Cookies & Local Storage Used
          </h2>
          <div className="mt-6 border border-line bg-surface overflow-x-auto text-left">
            <table className="w-full min-w-[650px] text-left text-xs font-mono">
              <thead className="border-b border-line uppercase tracking-widest text-foreground/45 bg-surface-muted/30">
                <tr>
                  <th className="px-5 py-3 text-left">Storage Key</th>
                  <th className="px-5 py-3 text-left">Classification</th>
                  <th className="px-5 py-3 text-left">Purpose</th>
                  <th className="px-5 py-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="px-5 py-3.5 font-semibold text-foreground">vestra_session</td>
                  <td className="px-5 py-3.5 text-foreground/70">Strictly Necessary</td>
                  <td className="px-5 py-3.5 text-foreground/60 font-sans">Keeps you signed into your account</td>
                  <td className="px-5 py-3.5 text-foreground/60">30 Days</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-semibold text-foreground">vestra_bag_v1</td>
                  <td className="px-5 py-3.5 text-foreground/70">Strictly Necessary</td>
                  <td className="px-5 py-3.5 text-foreground/60 font-sans">Saves items in your shopping bag</td>
                  <td className="px-5 py-3.5 text-foreground/60">Persistent</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-semibold text-foreground">vestra_cookie_consent_v1</td>
                  <td className="px-5 py-3.5 text-foreground/70">Strictly Necessary</td>
                  <td className="px-5 py-3.5 text-foreground/60 font-sans">Remembers your cookie consent choice</td>
                  <td className="px-5 py-3.5 text-foreground/60">365 Days</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-semibold text-foreground">vestra_theme</td>
                  <td className="px-5 py-3.5 text-foreground/70">Functional</td>
                  <td className="px-5 py-3.5 text-foreground/60 font-sans">Saves light or dark theme mode preference</td>
                  <td className="px-5 py-3.5 text-foreground/60">Persistent</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-semibold text-foreground">x-nonce</td>
                  <td className="px-5 py-3.5 text-foreground/70">Security</td>
                  <td className="px-5 py-3.5 text-foreground/60 font-sans">Protects against unauthorized script injection</td>
                  <td className="px-5 py-3.5 text-foreground/60">Per Request</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="pt-8 text-left">
          <h2 className="font-serif text-2xl font-light text-foreground text-left">
            Managing and Revoking Consent
          </h2>
          <p className="mt-3 font-sans text-sm text-foreground/70 leading-relaxed text-left">
            You may reset your cookie preferences at any time using the persistent &ldquo;Cookie Preferences&rdquo; action in the site footer, or by clearing your browser cache.
          </p>
        </article>
      </div>

      <footer className="mt-16 border-t border-line pt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
        <span>Support: {SUPPORT_EMAIL}</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">Privacy Charter</Link>
          <Link href="/terms" className="hover:text-foreground underline underline-offset-4">Terms & Conditions</Link>
          <Link href="/refund-policy" className="hover:text-foreground underline underline-offset-4">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
