"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMembership } from "@/providers/membership-provider";
import { MEMBERSHIP_PRICE, memberPriceFor } from "@/lib/member-pricing";
import { useCart } from "@/providers/cart-provider";
import { useWallet } from "@/providers/wallet-provider";
import { formatINR } from "@/lib/utils";

export function MemberStatusCard() {
  const { isActive, pending, validUntil, cancel } = useMembership();
  const { items } = useCart();
  const { balance } = useWallet();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    if (!validUntil) return;
    const end = new Date(validUntil);
    setDaysLeft(Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000)));
  }, [validUntil]);

  if (pending) {
    return <div className="h-32 w-full animate-pulse rounded-3xl bg-white/5 border border-white/10" />;
  }

  if (!isActive) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/20 dark:border-white/12 p-6 sm:p-8 text-left shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="text-left max-w-2xl">
          <div className="flex items-center gap-2.5 text-left mb-2">
            <span className="h-2 w-2 rounded-full bg-foreground/40" />
            <p className="label-ui text-[10px] tracking-[0.2em] font-semibold text-foreground/60 text-left">
              ATELIER PRIVILEGE ROLL // NOT ENROLLED
            </p>
          </div>
          <p className="font-serif text-sm sm:text-base italic text-foreground/80 leading-relaxed text-left">
            Enrol for {formatINR(MEMBERSHIP_PRICE)} annually. Every garment in your current bag — appraised at{" "}
            <span className="font-sans font-semibold text-foreground">
              {formatINR(
                items.reduce((s, i) => s + memberPriceFor(i.price) * i.qty, 0),
              )}
            </span>{" "}
            under privilege valuation — re-prices immediately. Current wallet reserve: {formatINR(balance)}.
          </p>
        </div>
        <Link
          href="#join"
          className="flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-xs text-background label-ui tracking-[0.15em] font-medium transition-all hover:opacity-90 shrink-0 text-left cursor-pointer"
        >
          <span>ENROL BELOW</span>
          <span aria-hidden="true">↓</span>
        </Link>
      </div>
    );
  }

  const bagSaving = items.reduce(
    (s, i) => s + (i.price - memberPriceFor(i.price)) * i.qty,
    0,
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/[0.08] backdrop-blur-2xl border border-white/25 dark:border-white/15 p-6 sm:p-8 text-left shadow-[0_16px_48px_rgba(0,0,0,0.2)] grid gap-6 lg:grid-cols-[1.4fr_1fr] items-center">
      <div className="text-left">
        <div className="flex items-center gap-2.5 text-left mb-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          <p className="label-ui text-[10px] tracking-[0.2em] font-bold text-accent text-left">
            ATELIER ONE · ACTIVE PATRON PASS
          </p>
        </div>
        <p className="font-serif text-sm sm:text-base italic text-foreground/85 leading-relaxed text-left">
          Accredited patron status verified. Automatic 30% preferential reduction applied across entire runway archive, paired with 10% wallet cashback.
        </p>
        <div className="mt-6 flex flex-wrap gap-6 text-left">
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-left">
            <span className="label-ui text-[9px] tracking-wider text-foreground/50 block">TERM REMAINING</span>
            <span className="font-serif text-lg font-medium text-foreground">{daysLeft} DAYS</span>
          </div>
          {bagSaving > 0 && (
            <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-left">
              <span className="label-ui text-[9px] tracking-wider text-foreground/50 block">CURRENT BAG REBATE</span>
              <span className="font-serif text-lg font-medium text-accent">{formatINR(bagSaving)}</span>
            </div>
          )}
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-2.5 text-left">
            <span className="label-ui text-[9px] tracking-wider text-foreground/50 block">WALLET RESERVE</span>
            <span className="font-serif text-lg font-medium text-foreground">{formatINR(balance)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start lg:items-end justify-center border-t border-white/10 pt-4 text-left lg:border-t-0 lg:border-l lg:border-white/10 lg:pl-8 lg:pt-0">
        <button
          onClick={cancel}
          className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] label-ui tracking-wider text-foreground/70 hover:text-foreground transition-all text-left cursor-pointer"
        >
          [ TERMINATE PRIVILEGE MEMBERSHIP ]
        </button>
      </div>
    </div>
  );
}

