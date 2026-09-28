import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = { title: "Secure checkout" };

export default function CheckoutPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Secure checkout
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            One tap, any UPI app, zero card details stored.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CheckoutClient />
      </div>
    </>
  );
}
