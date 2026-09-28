import type { Metadata } from "next";
import { WalletClient } from "@/components/wallet/wallet-client";

export const metadata: Metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Wallet
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Cashback, referral cash and coupons — all in one place.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <WalletClient />
      </div>
    </>
  );
}
