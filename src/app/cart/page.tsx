import type { Metadata } from "next";
import { CartClient } from "@/components/cart/cart-client";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Your bag
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Review your picks, stack coupons, then pay in one tap.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <CartClient />
      </div>
    </>
  );
}
