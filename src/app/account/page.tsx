import type { Metadata } from "next";
import { AccountClient } from "@/components/account/account-client";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Your account
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Orders, addresses, wallet and security — under one roof.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AccountClient />
      </div>
    </>
  );
}
