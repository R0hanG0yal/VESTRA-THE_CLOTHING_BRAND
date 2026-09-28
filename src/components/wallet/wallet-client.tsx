"use client";

import { useState } from "react";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { useWallet } from "@/providers/wallet-provider";
import { useToast } from "@/providers/toast-provider";
import { COUPONS } from "@/lib/data/catalog";
import { formatINR, timeAgo } from "@/lib/utils";

export function WalletClient() {
  const { balance, transactions, referral, credit, ready } = useWallet();
  const { push } = useToast();
  const [adding, setAdding] = useState(false);

  function topUp() {
    setAdding(true);
    setTimeout(() => {
      credit(500, "Atelier reserve deposit (simulation)");
      setAdding(false);
      push({ title: "₹500 credited to reserve", description: "Demonstration ledger credit.", variant: "success" });
    }, 900);
  }

  const earned = transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const spent = transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);

  if (!ready) return <div className="skeleton h-64 w-full" />;

  return (
    <div className="space-y-10 text-left">
      {/* Editorial Balance Plate */}
      <div className="grid gap-6 text-left lg:grid-cols-[1.4fr_1fr]">
        <div className="border border-foreground bg-foreground p-8 text-background text-left">
          <div className="flex items-center gap-2 text-left mb-4">
            <IconImage type="wallet" size={16} className="border-none invert dark:invert-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70 text-left">
              ATELIER FISCAL RESERVE
            </span>
          </div>

          <p className="font-mono text-xs uppercase tracking-wider text-background/60 text-left">
            AVAILABLE ACQUISITION LIQUIDITY
          </p>
          <p className="mt-2 font-mono text-5xl font-bold tracking-tight text-background text-left sm:text-6xl">
            {formatINR(balance)}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-left">
            <button
              onClick={topUp}
              disabled={adding}
              className="border border-background bg-background px-5 py-3 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-transparent hover:text-background disabled:opacity-60 text-left"
            >
              {adding ? "RECONCILING…" : "DEPOSIT ₹500 (SIMULATION)"}
            </button>
            <Link
              href="/shop"
              className="border border-background/30 px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:border-background text-left"
            >
              ALLOCATE ON SILHOUETTE
            </Link>
          </div>
          <p className="mt-6 font-mono text-[9px] uppercase tracking-wider text-background/45 text-left">
            NOTE: PERSISTED IN EPHEMERAL LOCAL STORAGE FOR CLIENT DEMONSTRATION.
          </p>
        </div>

        {/* Ledger Highlights */}
        <div className="grid gap-6 text-left">
          <div className="border border-foreground/20 bg-surface p-6 text-left">
            <div className="flex items-center gap-2 text-left mb-3">
              <IconImage type="wallet" size={14} />
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-foreground text-left">
                ACCRUAL & DISBURSEMENT
              </h2>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-left">
              <div className="text-left">
                <dt className="font-mono text-[10px] uppercase text-foreground/50 text-left">TOTAL ACCRUED</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-foreground text-left">
                  {formatINR(earned)}
                </dd>
              </div>
              <div className="text-left">
                <dt className="font-mono text-[10px] uppercase text-foreground/50 text-left">TOTAL DISBURSED</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-foreground text-left">
                  {formatINR(spent)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 font-serif text-xs italic text-foreground/60 text-left">
              Clients accrue 5% reserve cashback automatically on all orders, augmented to 10% under Atelier One.
            </p>
          </div>

          <div className="border border-foreground/20 bg-surface p-6 text-left">
            <div className="flex items-center gap-2 text-left mb-3">
              <IconImage type="gift" size={14} />
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-foreground text-left">
                REFERRAL CREDIT REVENUE
              </h2>
            </div>
            <p className="font-mono text-xs text-foreground/75 text-left">
              PATRONS ENROLLED: <b className="text-foreground">{referral.invited}</b> · EARNED: <b className="text-foreground">{formatINR(referral.earned)}</b>
            </p>
            <Link href="/refer" className="mt-4 inline-block font-mono text-xs uppercase tracking-wider text-foreground underline text-left">
              DISPATCH PATRON INVITATION CODE
            </Link>
          </div>
        </div>
      </div>

      {/* Transactions History - Sharp Editorial Table */}
      <div className="border border-foreground/20 bg-surface p-6 text-left">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-foreground text-left border-b border-foreground/15 pb-3">
          CHRONOLOGICAL TRANSACTION TELEMETRY
        </h2>
        {transactions.length === 0 ? (
          <p className="py-8 font-mono text-xs uppercase text-foreground/50 text-left">
            NO PRIOR TRANSACTIONS LOGGED.
          </p>
        ) : (
          <ul className="divide-y divide-foreground/10 text-left">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-4 text-left">
                <div className="flex items-center gap-3 text-left">
                  <IconImage type={t.type === "credit" ? "wallet" : "check"} size={16} />
                  <div className="text-left">
                    <p className="font-serif text-sm font-semibold text-foreground text-left">{t.reason}</p>
                    <p className="font-mono text-[9px] uppercase text-foreground/45 text-left">{timeAgo(t.createdAt)}</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-foreground text-right">
                  {t.type === "credit" ? "+" : "−"}
                  {formatINR(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Coupons Vault */}
      <div className="border border-foreground/20 bg-surface p-6 text-left">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-foreground text-left border-b border-foreground/15 pb-3">
          ACCREDITED CLIENT CONCESSIONS
        </h2>
        <div className="mt-6 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {COUPONS.map((c) => (
            <div
              key={c.code}
              className="border border-foreground/15 p-4 text-left bg-background"
            >
              <span className="font-mono text-[10px] uppercase font-bold text-foreground text-left block">
                [{c.code}]
              </span>
              <p className="mt-1 font-serif text-sm font-semibold text-foreground text-left">
                {c.label}
              </p>
              <p className="mt-1 font-serif text-xs italic text-foreground/60 text-left">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
