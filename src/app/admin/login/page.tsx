"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconImage } from "@/components/ui/icon-image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Incorrect passcode");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto min-h-[70vh] max-w-xl px-4 py-20 text-left">
      <div className="border border-line bg-surface p-8 sm:p-12 text-left">
        <div className="flex items-center gap-3">
          <IconImage name="shield" alt="Restricted" className="h-6 w-6 object-cover grayscale" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
            Internal Operations // Terminal Authentication
          </span>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl text-left">
          Atelier System Registry
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-foreground/55 text-left">
          Operational credential required for catalogue ledger and inventory dispatch administration.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 text-left">
          <div className="text-left">
            <label className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block mb-2">
              Passcode Token
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              minLength={6}
              maxLength={128}
              className="w-full border border-line bg-surface-muted/30 px-4 py-3.5 font-mono text-sm outline-none focus:border-foreground transition-colors text-left"
            />
          </div>

          {error && (
            <p className="border-l-2 border-rose-600 bg-rose-500/10 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 text-left">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 text-left flex items-center justify-between"
          >
            <span>{busy ? "Authenticating Session..." : "Authorize Dashboard Access"}</span>
            <span className="font-mono text-xs">→</span>
          </button>
        </form>

        <div className="mt-8 border-t border-line pt-6 text-left">
          <div className="flex items-start gap-3">
            <IconImage name="authentic" alt="Security Notice" className="h-5 w-5 object-cover grayscale shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/55 text-left leading-relaxed">
              Default development token is <span className="text-foreground">vestra-admin</span>. Configured via <span className="text-foreground">ADMIN_PASSCODE</span> environment specification.
            </p>
          </div>
        </div>

        <div className="mt-6 text-left">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground underline underline-offset-4 text-left"
          >
            ← Return to Broadside Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
