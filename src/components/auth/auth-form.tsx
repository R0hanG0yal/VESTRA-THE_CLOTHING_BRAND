"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconImage } from "@/components/ui/icon-image";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { BRAND_LEGAL_NAME } from "@/lib/env-public";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { login, signup } = useAuth();
  const { push } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const next = params.get("next") ?? "/account";

  const rules = [
    { label: "8+ CHARACTERS", ok: password.length >= 8 },
    { label: "UPPERCASE GLYPH", ok: /[A-Z]/.test(password) },
    { label: "LOWERCASE GLYPH", ok: /[a-z]/.test(password) },
    { label: "NUMERAL VALUE", ok: /[0-9]/.test(password) },
  ];

  function validateEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Spam bot protection: honeypot check
    if (honeypot.trim().length > 0) {
      // Silently reject bot spam submission
      setBusy(true);
      setTimeout(() => {
        setBusy(false);
        setError("Telemetry verification rejected.");
      }, 500);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please provide a valid, complete email address (e.g. client@domain.com).");
      return;
    }

    if (isSignup) {
      if (name.trim().length < 2) {
        setError("Legal name must contain at least 2 characters.");
        return;
      }
      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }
      if (!consent) {
        setError("Please grant consent for identity & authentication data processing under the DPDP Act.");
        return;
      }
    }

    setBusy(true);
    try {
      if (isSignup) {
        await signup(name.trim(), email.trim().toLowerCase(), password);
        push({
          title: "Patron credential created",
          description: "₹250 credited to reserve",
          variant: "success",
        });
      } else {
        await login(email.trim().toLowerCase(), password);
        push({ title: "Session authenticated", variant: "success" });
      }
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication fault");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl border border-foreground/20 bg-surface text-left lg:grid-cols-2">
      {/* Editorial Atelier Brand Column - NO LOGOS, strictly left-aligned */}
      <div className="hidden flex-col justify-between border-r border-foreground/15 bg-foreground p-10 text-background text-left lg:flex">
        <div className="text-left">
          <Link href="/" className="text-left">
            <span className="font-serif text-2xl tracking-[0.25em] text-background uppercase font-bold text-left block">
              VESTRA
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-background/50 text-left block mt-1">
              PRIVATE CLIENT CONCIERGE
            </span>
          </Link>
        </div>

        <div className="text-left my-auto py-12">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-background/50 text-left block">
            PATRON CREDENTIALS
          </span>
          <h2 className="mt-2 font-serif text-3xl font-normal leading-tight text-background text-left">
            {isSignup ? "Accreditation protocol." : "Access client suite."}
          </h2>
          <ul className="mt-6 space-y-3 font-serif text-xs italic text-background/80 text-left">
            {[
              "3D algorithmic virtual fitting across catalogue",
              "Dermal spectral undertone matching",
              "Automated 5% to 10% wallet reserve accrual",
              "Complimentary priority dispatch & bespoke advice",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-left">
                <IconImage type="check" size={12} className="border-none invert dark:invert-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-background/20 pt-4 text-left">
          <p className="font-mono text-[9px] uppercase tracking-wider text-background/60 text-left">
            DATA MINIMIZATION NOTICE:
          </p>
          <p className="font-mono text-[9px] text-background/45 mt-1 leading-relaxed text-left">
            We store only your name and authentication hash. No behavioral biometric profiling or third-party ad brokers.
          </p>
        </div>
      </div>

      {/* Form Column - Strict Left Alignment */}
      <div className="p-8 sm:p-12 text-left">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
          AUTHENTICATION REGISTER
        </span>
        <h1 className="mt-1 font-serif text-3xl text-foreground text-left">
          {isSignup ? "Register New Patron" : "Sign In to Suite"}
        </h1>
        <p className="mt-2 font-serif text-sm italic text-foreground/65 text-left">
          {isSignup
            ? "Establish your client credentials to receive ₹250 instant reserve."
            : "Authenticate to view your private bag, orders, and ledger."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 text-left" noValidate>
          {/* Honeypot Spam Field (Hidden from screen and accessible tech) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="auth_bot_check">Leave this field blank</label>
            <input
              id="auth_bot_check"
              type="text"
              name="hp_vestra_trap"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {isSignup && (
            <div className="text-left">
              <label htmlFor="auth-name" className="font-mono text-[10px] uppercase tracking-wider text-foreground/70 text-left block mb-1">
                LEGAL NAME <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-foreground/20 bg-background px-3 py-2 text-left focus-within:border-foreground">
                <IconImage type="user" size={14} className="border-none mr-2.5 grayscale" />
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Elena Rostova"
                  autoComplete="name"
                  required
                  maxLength={60}
                  className="w-full bg-transparent font-serif text-sm outline-none text-left text-foreground"
                />
              </div>
            </div>
          )}

          <div className="text-left">
            <label htmlFor="auth-email" className="font-mono text-[10px] uppercase tracking-wider text-foreground/70 text-left block mb-1">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-foreground/20 bg-background px-3 py-2 text-left focus-within:border-foreground">
              <IconImage type="user" size={14} className="border-none mr-2.5 grayscale" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.com"
                autoComplete="email"
                required
                maxLength={160}
                className="w-full bg-transparent font-serif text-sm outline-none text-left text-foreground"
              />
            </div>
          </div>

          <div className="text-left">
            <label htmlFor="auth-password" className="font-mono text-[10px] uppercase tracking-wider text-foreground/70 text-left block mb-1">
              PASSWORD <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-foreground/20 bg-background px-3 py-2 text-left focus-within:border-foreground">
              <IconImage type="lock" size={14} className="border-none mr-2.5 grayscale" />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={isSignup ? 8 : 6}
                maxLength={128}
                className="w-full bg-transparent font-serif text-sm outline-none text-left text-foreground"
              />
            </div>
          </div>

          {isSignup && (
            <>
              <div className="flex flex-wrap gap-1.5 pt-1 text-left">
                {rules.map((r) => (
                  <span
                    key={r.label}
                    className={cn(
                      "border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-left",
                      r.ok
                        ? "border-foreground bg-foreground text-background font-bold"
                        : "border-foreground/20 text-foreground/45",
                    )}
                  >
                    {r.label}
                  </span>
                ))}
              </div>

              {/* DPDP Act Explicit Form Consent */}
              <div className="border border-foreground/15 bg-surface-muted/30 p-3 mt-4 text-left">
                <label className="flex items-start gap-3 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-none border-foreground/30 accent-foreground cursor-pointer"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/75 leading-relaxed text-left">
                    I consent to {BRAND_LEGAL_NAME} processing my name and email solely for identity verification, account security, and transaction updates in accordance with the{" "}
                    <Link href="/privacy" target="_blank" className="underline font-bold text-foreground">
                      Privacy Policy (DPDP 2023)
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" target="_blank" className="underline font-bold text-foreground">
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>
              </div>
            </>
          )}

          {error && (
            <div
              role="alert"
              className="border border-red-500/40 bg-red-500/10 p-3 font-mono text-xs text-red-600 dark:text-red-400 text-left"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            aria-label={isSignup ? "Establish Patron Account" : "Authenticate Credentials"}
            className="mt-6 flex w-full items-center justify-between border border-foreground bg-foreground px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 disabled:opacity-40 text-left cursor-pointer"
          >
            <span>
              {busy
                ? "AUTHENTICATING TELEMETRY…"
                : isSignup
                ? "ESTABLISH PATRON ACCOUNT"
                : "AUTHENTICATE CREDENTIALS"}
            </span>
            <IconImage type="arrow" size={12} className="border-none invert dark:invert-0" />
          </button>
        </form>

        <p className="mt-8 font-mono text-xs uppercase tracking-wider text-foreground/70 text-left">
          {isSignup ? "ALREADY AN ACCREDITED CLIENT?" : "NEW TO VESTRA ATELIER?"}{" "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-bold text-foreground underline ml-1 text-left"
          >
            {isSignup ? "[SIGN IN]" : "[ESTABLISH CREDENTIALS]"}
          </Link>
        </p>
      </div>
    </div>
  );
}
