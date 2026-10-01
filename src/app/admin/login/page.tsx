"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconImage } from "@/components/ui/icon-image";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/products";

  const [passcode, setPasscode] = useState("vestra-admin");
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
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Incorrect passcode");
      router.replace(from);
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
          <IconImage name="shield" alt="Admin" className="h-6 w-6 object-cover grayscale" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
            Admin Portal
          </span>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl text-left">
          Admin Login
        </h1>
        <p className="mt-2 font-sans text-sm text-foreground/70 text-left">
          Enter the admin passcode to manage products, categories, coupons, and orders.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 text-left">
          <div className="text-left">
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 block">
                Admin Passcode
              </label>
              <button
                type="button"
                onClick={() => setPasscode("vestra-admin")}
                className="font-mono text-[10px] text-foreground/60 hover:text-foreground underline"
              >
                Use default (vestra-admin)
              </button>
            </div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode..."
              autoComplete="current-password"
              required
              minLength={6}
              maxLength={128}
              className="w-full border border-line bg-surface-muted/30 px-4 py-3.5 font-mono text-sm outline-none focus:border-foreground transition-colors text-left"
            />
          </div>

          {error && (
            <p className="border-l-2 border-rose-600 bg-rose-500/10 px-4 py-2.5 font-sans text-xs text-rose-600 dark:text-rose-400 text-left">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 text-left flex items-center justify-between"
          >
            <span>{busy ? "Checking Passcode..." : "Log In to Admin"}</span>
            <span className="font-mono text-xs">→</span>
          </button>
        </form>

        <div className="mt-8 border-t border-line pt-6 text-left">
          <div className="flex items-start gap-3">
            <IconImage name="authentic" alt="Security Notice" className="h-5 w-5 object-cover grayscale shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-foreground/60 text-left leading-relaxed">
              Default passcode is <strong className="text-foreground font-mono">vestra-admin</strong>.
            </p>
          </div>
        </div>

        <div className="mt-6 text-left">
          <Link
            href="/"
            className="font-sans text-xs text-foreground/60 hover:text-foreground underline underline-offset-4 text-left"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
