"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { IconImage } from "@/components/ui/icon-image";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { memberPriceFor, MEMBERSHIP_PRICE } from "@/lib/member-pricing";
import { useMembership } from "@/providers/membership-provider";
import { COUPONS } from "@/lib/data/catalog";
import { cn, formatINR } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/pricing";

export function CartClient() {
  const { items, ready, updateQty, remove, subtotal, mrpTotal } = useCart();
  const { push } = useToast();
  const { isActive: isMember, join: joinMembership } = useMembership();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [checking, setChecking] = useState(false);

  const memberSubtotal = items.reduce(
    (s, i) => s + memberPriceFor(i.price) * i.qty,
    0,
  );
  const memberSaving = subtotal - memberSubtotal;
  const payable = isMember ? memberSubtotal : subtotal;

  const couponDiscount = applied?.discount ?? 0;
  const shipping =
    items.length === 0 || payable - couponDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(0, payable - couponDiscount + shipping);
  const freeShipGap = Math.max(0, FREE_SHIPPING_THRESHOLD - (payable - couponDiscount));

  async function applyCoupon(overrideCode?: string) {
    const value = (overrideCode ?? code).trim().toUpperCase();
    if (!value) return;
    setChecking(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: value,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            qty: i.qty,
          })),
        }),
      });
      const data = await res.json();
      if (data.applied) {
        setApplied({ code: data.coupon.code, discount: data.coupon.discount });
        setCode(value);
        push({ title: `${data.coupon.label} applied`, description: data.coupon.description, variant: "success" });
      } else {
        setApplied(null);
        push({ title: "Coupon not valid", description: data.error, variant: "error" });
      }
    } catch {
      push({ title: "Couldn't check that coupon", variant: "error" });
    } finally {
      setChecking(false);
    }
  }

  if (!ready) {
    return <div className="skeleton h-64 w-full" />;
  }

  if (items.length === 0) {
    return (
      <div className="border border-foreground/20 bg-surface p-12 text-left">
        <IconImage type="bag" size={32} className="mb-4" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
          BAG STATUS // EMPTY
        </span>
        <h2 className="mt-2 font-serif text-3xl font-normal text-foreground text-left sm:text-4xl">
          Your acquisition bag is unoccupied
        </h2>
        <p className="mt-2 font-serif text-sm italic text-foreground/60 text-left">
          Explore the seasonal catalogue to select tailored garments for your private wardrobe.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 text-left"
        >
          <IconImage type="filter" size={14} className="border-none invert dark:invert-0" />
          <span className="text-left font-bold">EXPLORE CATALOGUE ARCHIVE</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_400px] text-left">
      <div className="text-left">
        {freeShipGap > 0 && (
          <div className="mb-6 flex items-center gap-3 border border-foreground/20 bg-surface p-4 text-left">
            <IconImage type="delivery" size={18} />
            <p className="font-mono text-xs uppercase tracking-wider text-foreground text-left">
              ACQUIRE <span className="font-bold">{formatINR(freeShipGap)}</span> ADDITIONAL VALUE TO UNLOCK COMPLIMENTARY DISPATCH.
            </p>
          </div>
        )}

        {/* Unboxed Editorial Bag Table - Hairline Dividers */}
        <div className="border-t border-foreground/15 text-left">
          {items.map((i) => (
            <div
              key={`${i.productId}-${i.size}-${i.color}`}
              className="flex gap-5 border-b border-foreground/15 py-6 text-left"
            >
              <Link
                href={`/product/${i.productId}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden bg-surface-muted border border-foreground/20"
              >
                <ProductImage
                  kind={i.kind}
                  color={i.colorHex || "#627264"}
                  seed={i.seed}
                  image={i.image}
                  alt={i.name}
                  sizes="96px"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col text-left justify-between">
                <div className="flex items-start justify-between gap-3 text-left">
                  <div className="min-w-0 text-left">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 text-left block">
                      ARCHIVE ID: {i.productId}
                    </span>
                    <Link
                      href={`/product/${i.productId}`}
                      className="font-serif text-lg leading-snug text-foreground hover:underline text-left block mt-0.5"
                    >
                      {i.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
                      SPECIFICATION: SIZE {i.size} · SHADE: {i.color}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(i.productId, i.size, i.color)}
                    aria-label="Remove item"
                    className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-foreground/50 hover:text-foreground text-left"
                  >
                    <IconImage type="close" size={12} className="border-none" />
                    <span>[REMOVE]</span>
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3 text-left">
                  {/* Quantity Stepper - Sharp Rectangles */}
                  <div className="inline-flex items-center border border-foreground/20 text-left">
                    <button
                      onClick={() => updateQty(i.productId, i.size, i.color, i.qty - 1)}
                      aria-label="Decrease quantity"
                      className="px-2.5 py-1 font-mono text-xs hover:bg-foreground/5 text-left"
                    >
                      -
                    </button>
                    <span className="border-x border-foreground/20 px-3 py-1 font-mono text-xs font-semibold text-left">
                      {i.qty}
                    </span>
                    <button
                      onClick={() => updateQty(i.productId, i.size, i.color, i.qty + 1)}
                      aria-label="Increase quantity"
                      className="px-2.5 py-1 font-mono text-xs hover:bg-foreground/5 text-left"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    {isMember ? (
                      <p className="font-mono text-sm font-bold text-foreground text-right">
                        {formatINR(memberPriceFor(i.price) * i.qty)}
                      </p>
                    ) : (
                      <p className="font-mono text-sm font-bold text-foreground text-right">{formatINR(i.price * i.qty)}</p>
                    )}
                    <p className="font-mono text-xs text-foreground/40 line-through text-right">
                      {formatINR(i.mrp * i.qty)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupons Panel - Sharp Editorial Box */}
        <div className="mt-8 border border-foreground/20 bg-surface p-6 text-left">
          <div className="flex items-center gap-2 text-left mb-3">
            <IconImage type="gift" size={16} />
            <h3 className="font-mono text-xs uppercase tracking-widest font-semibold text-foreground text-left">
              ATELIER CONCESSION CODES
            </h3>
          </div>
          <div className="flex gap-2 text-left">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER VOUCHER CODE (E.G. VESTRA20)"
              maxLength={20}
              className="flex-1 border border-foreground/20 bg-background px-3.5 py-2 font-mono text-xs uppercase tracking-wider outline-none text-left"
            />
            <button
              onClick={() => applyCoupon()}
              disabled={checking}
              className="border border-foreground bg-foreground px-5 py-2 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 disabled:opacity-40 text-left"
            >
              {checking ? "VERIFYING…" : "VALIDATE"}
            </button>
          </div>

          <div className="mt-4 space-y-2 text-left">
            {COUPONS.slice(0, 3).map((c) => (
              <button
                key={c.code}
                onClick={() => applyCoupon(c.code)}
                className="flex w-full items-center justify-between border border-foreground/15 p-2.5 text-left transition hover:bg-foreground/5"
              >
                <div className="text-left">
                  <span className="font-mono text-xs font-semibold text-foreground text-left block">
                    [{c.code}] · {c.label}
                  </span>
                  <span className="font-serif text-xs italic text-foreground/60 text-left block">
                    {c.description}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground underline text-right">
                  [APPLY]
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Rail - Sharp Editorial Ledger */}
      <aside className="lg:sticky lg:top-24 lg:self-start text-left">
        <div className="border border-foreground bg-surface p-6 text-left">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
            FISCAL DISBURSEMENT
          </span>
          <h3 className="mt-1 font-serif text-2xl text-foreground text-left">
            Order Reconciliation
          </h3>
          <dl className="mt-6 space-y-3 font-mono text-xs text-left">
            <Row label={`SUBTOTAL (${items.length} PIECES)`} value={formatINR(subtotal)} />
            {isMember && (
              <Row
                label="ATELIER PRIVILEGE DEDUCTION"
                value={`− ${formatINR(memberSaving)}`}
                tone="positive"
              />
            )}
            <Row
              label="MRP REDUCTION ALLOWANCE"
              value={`− ${formatINR(mrpTotal - subtotal)}`}
              tone="positive"
            />
            {applied && (
              <Row
                label={`VOUCHER REBATE (${applied.code})`}
                value={`− ${formatINR(couponDiscount)}`}
                tone="positive"
              />
            )}
            <Row
              label="PRIORITY DISPATCH"
              value={shipping === 0 ? "COMPLIMENTARY" : formatINR(shipping)}
              tone={shipping === 0 ? "positive" : undefined}
            />
          </dl>
          <div className="mt-6 flex items-baseline justify-between border-t border-foreground/20 pt-4 text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-foreground text-left">
              NET SETTLEMENT
            </span>
            <span className="font-mono text-2xl font-bold text-foreground text-right">
              {formatINR(total)}
            </span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-foreground/60 text-left">
            CREDIT ACCRUAL: {formatINR(Math.round(total * (isMember ? 0.1 : 0.05)))} WALLET CASHBACK
          </p>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-between border border-foreground bg-foreground px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 text-left"
          >
            <span className="text-left font-bold">PROCEED TO SECURE CHECKOUT</span>
            <IconImage type="arrow" size={14} className="border-none invert dark:invert-0" />
          </Link>

          {!isMember && (
            <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-left">
              <div className="flex items-start gap-3">
                <IconImage type="crown" size={18} className="mt-0.5 grayscale opacity-80" />
                <div className="text-left flex-1">
                  <p className="label-ui text-[11px] font-semibold text-foreground text-left">
                    PATRON RATE: {formatINR(memberSubtotal)}
                  </p>
                  <p className="font-serif text-xs italic text-foreground/75 text-left mt-0.5">
                    Save an additional {formatINR(memberSaving)} across your entire order with Atelier One ({formatINR(MEMBERSHIP_PRICE)}/yr).
                  </p>
                  <button
                    onClick={() => {
                      joinMembership();
                      push({
                        title: "Patron Membership Added & Activated",
                        description: `Saved ${formatINR(memberSaving)} on your order.`,
                        variant: "success",
                      });
                    }}
                    className="mt-3 w-full rounded-full bg-foreground px-4 py-2 label-ui text-[10px] tracking-wider text-background hover:opacity-90 transition-all font-medium text-center cursor-pointer"
                  >
                    + ADD MEMBERSHIP TO BAG ({formatINR(MEMBERSHIP_PRICE)}/YR)
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-2 text-left border-t border-foreground/10 pt-3">
            <IconImage type="shield" size={14} />
            <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/55 text-left">
              {shipping === 0 ? "COMPLIMENTARY SHIPPING ENABLED" : `COMPLIMENTARY ABOVE ${formatINR(FREE_SHIPPING_THRESHOLD)}`}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive";
}) {
  return (
    <div className="flex items-baseline justify-between text-left">
      <dt className="text-foreground/60 text-left font-mono text-xs">{label}</dt>
      <dd className={cn("font-mono text-xs font-semibold text-right", tone === "positive" ? "text-foreground font-bold" : "text-foreground")}>
        {value}
      </dd>
    </div>
  );
}
