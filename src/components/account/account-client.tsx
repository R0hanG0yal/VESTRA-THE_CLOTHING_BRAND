"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "@/providers/wallet-provider";
import { useToast } from "@/providers/toast-provider";
import { formatINR } from "@/lib/utils";
import type { Address } from "@/lib/types";
import { IconImage } from "@/components/ui/icon-image";

interface OrderSummary {
  id: string;
  status: string;
  createdAt: string;
  totals: { total: number };
  items: { name: string }[];
}

export function AccountClient() {
  const { user, ready, logout } = useAuth();
  const { balance, referral } = useWallet();
  const { push } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [twoFactor, setTwoFactor] = useState(true);

  useEffect(() => {
    const last = localStorage.getItem("vestra_last_order");
    if (last) {
      fetch(`/api/orders/${last}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d?.order && setOrders([d.order]))
        .catch(() => {});
    }
    try {
      const saved = localStorage.getItem("vestra_address_v1");
      if (saved) setAddress(JSON.parse(saved) as Address);
    } catch {
      /* ignore */
    }
  }, []);

  if (!ready) return <div className="h-64 border border-line bg-ink-900/5 text-left" />;

  if (!user) {
    return (
      <div className="border border-line bg-surface p-12 text-left">
        <div className="flex items-center gap-3">
          <IconImage name="user" alt="Client" className="h-8 w-8 object-cover grayscale" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45">
            Dossier // Unauthenticated Requisition
          </span>
        </div>
        <h2 className="mt-4 font-serif text-3xl font-light text-foreground text-left">
          Member Requisition Required
        </h2>
        <p className="mt-2 text-sm text-foreground/60 max-w-md text-left font-sans">
          Sign into your verified patron account to inspect active manifests, addresses, and balance ledger.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-left">
          <Link
            href="/login"
            className="border border-foreground bg-foreground px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-foreground/90 text-left"
          >
            Access Patron Portal
          </Link>
          <Link
            href="/signup"
            className="border border-line bg-transparent px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:border-foreground text-left"
          >
            Register Membership
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await logout();
    push({ title: "Session Concluded", variant: "info" });
    router.push("/");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[340px_1fr] text-left">
      {/* Profile dossier rail */}
      <aside className="space-y-6 text-left">
        <div className="border border-line bg-surface p-6 text-left">
          <div className="flex items-center gap-4 text-left">
            <div className="h-16 w-16 shrink-0 border border-foreground/30 bg-foreground text-background flex items-center justify-center font-serif text-2xl font-light">
              {initials || "V"}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 block">
                Patron Record
              </span>
              <h2 className="font-serif text-xl font-normal text-foreground truncate text-left">{user.name}</h2>
              <p className="font-mono text-[10px] text-foreground/50 truncate text-left">{user.email}</p>
            </div>
          </div>
          <div className="mt-5 border-t border-line pt-4 flex items-center gap-2 text-left">
            <IconImage name="authentic" alt="Verified" className="h-4 w-4 object-cover grayscale" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/70">
              Verified Patron // Active Tier
            </span>
          </div>
        </div>

        <div className="border border-line bg-surface p-6 text-left">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 block">
            Financial Ledger
          </span>
          <div className="mt-3 flex items-baseline justify-between text-left">
            <span className="font-serif text-sm text-foreground/70">Credit Balance</span>
            <span className="font-mono text-xl font-light text-foreground">{formatINR(balance)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-left">
            <span className="text-foreground/50">Referral Index</span>
            <span className="text-foreground uppercase tracking-wider">{referral.code}</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <Link
              href="/wallet"
              className="border border-line bg-transparent py-2.5 px-3 text-left font-mono text-[10px] uppercase tracking-wider text-foreground hover:border-foreground"
            >
              [Wallet View]
            </Link>
            <Link
              href="/refer"
              className="border border-foreground bg-foreground py-2.5 px-3 text-left font-mono text-[10px] uppercase tracking-wider text-background hover:bg-foreground/90"
            >
              [Referral Code]
            </Link>
          </div>
        </div>

        <nav className="border border-line bg-surface divide-y divide-line text-left">
          {[
            { iconName: "bag" as const, label: "Acquisition Orders", href: "#orders" },
            { iconName: "wishlist" as const, label: "Curated Wishlist", href: "/shop" },
            { iconName: "delivery" as const, label: "Delivery Dossiers", href: "#address" },
            { iconName: "shield" as const, label: "Security Attestations", href: "#security" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-5 py-4 font-mono text-xs uppercase tracking-wider text-foreground/80 hover:bg-surface-muted transition-colors text-left"
            >
              <IconImage name={item.iconName} alt={item.label} className="h-4 w-4 object-cover grayscale" />
              <span>{item.label}</span>
              <span className="ml-auto font-mono text-xs text-foreground/30">→</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-4 font-mono text-xs uppercase tracking-wider text-rose-600 hover:bg-rose-500/5 transition-colors text-left"
          >
            <IconImage name="close" alt="Sign out" className="h-4 w-4 object-cover grayscale" />
            <span>Terminate Session</span>
          </button>
        </nav>
      </aside>

      {/* Content dossiers */}
      <div className="space-y-8 text-left">
        <section id="orders" className="border border-line bg-surface p-6 sm:p-8 text-left">
          <div className="flex items-center justify-between border-b border-line pb-4 text-left">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
                Manifest
              </span>
              <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
                Requisitions & Orders
              </h2>
            </div>
            <span className="font-mono text-[11px] text-foreground/40">{orders.length} Records</span>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 border-l-2 border-line pl-6 py-6 text-left">
              <p className="font-mono text-xs uppercase tracking-wider text-foreground/50 text-left">
                No requisitions recorded in active ledger.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-foreground underline underline-offset-4 text-left"
              >
                Inspect Collection Archive →
              </Link>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-line border-y border-line text-left">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 text-left">
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-3 text-left">
                      <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                        {o.id}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest border border-foreground/30 px-1.5 py-0.5 text-foreground/70">
                        {o.status}
                      </span>
                    </div>
                    <p className="font-serif text-xs text-foreground/60 truncate mt-1 text-left">
                      {o.items.map((i) => i.name).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-left">
                    <span className="font-mono text-sm text-foreground">{formatINR(o.totals.total)}</span>
                    <Link
                      href={`/order/${o.id}`}
                      className="font-mono text-[10px] uppercase tracking-widest text-foreground underline underline-offset-4"
                    >
                      [Track]
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="address" className="border border-line bg-surface p-6 sm:p-8 text-left">
          <div className="border-b border-line pb-4 text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
              Logistics Location
            </span>
            <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
              Delivery Address Register
            </h2>
          </div>

          {address ? (
            <div className="mt-6 border-l-2 border-foreground pl-6 text-left">
              <p className="font-serif text-lg text-foreground text-left">{address.fullName}</p>
              <p className="font-sans text-xs text-foreground/65 mt-1 leading-relaxed text-left">
                {address.line1}, {address.city}, {address.state} — {address.pincode}
              </p>
              <p className="font-mono text-[11px] text-foreground/50 mt-1 text-left">Phone: +91 {address.phone}</p>
            </div>
          ) : (
            <p className="mt-6 font-mono text-xs uppercase tracking-wider text-foreground/50 text-left">
              No delivery location registered. Will be cataloged during checkout.
            </p>
          )}
        </section>

        <section id="security" className="border border-line bg-surface p-6 sm:p-8 text-left">
          <div className="border-b border-line pb-4 text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
              Authentication
            </span>
            <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
              Security Protocol
            </h2>
          </div>

          <div className="mt-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-line pb-4 text-left">
              <div>
                <p className="font-serif text-base text-foreground text-left">Two-Factor Requisition Attestation</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/50 text-left">
                  OTP challenge required on novel terminal handshakes
                </p>
              </div>
              <button
                role="switch"
                aria-checked={twoFactor}
                onClick={() => {
                  setTwoFactor((v) => !v);
                  push({
                    title: twoFactor ? "2FA Deactivated" : "2FA Activated",
                    variant: twoFactor ? "info" : "success",
                  });
                }}
                className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  twoFactor
                    ? "border-foreground bg-foreground text-background"
                    : "border-line bg-transparent text-foreground/60"
                }`}
              >
                {twoFactor ? "[ACTIVE]" : "[DISABLED]"}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 text-left">
              <div>
                <p className="font-serif text-base text-foreground text-left">Cryptographic Credentials</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/50 text-left">
                  Rotated 90 days ago · Passkey active
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">
                [SECURED]
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
