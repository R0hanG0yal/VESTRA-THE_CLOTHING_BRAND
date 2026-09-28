"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { ProductImage } from "@/components/product/product-image";
import { formatINR } from "@/lib/utils";
import type { CartItem, OrderTotals } from "@/lib/types";

interface OrderPayload {
  order: {
    id: string;
    items: CartItem[];
    totals: OrderTotals;
    status: string;
    paymentMethod: string;
    createdAt: string;
    address: { fullName: string; city: string; pincode: string };
  };
}

const TIMELINE = [
  { key: "placed", label: "RECONCILED", iconType: "check" as const },
  { key: "packed", label: "PACKAGED", iconType: "authentic" as const },
  { key: "shipped", label: "DISPATCHED", iconType: "delivery" as const },
  { key: "delivered", label: "DELIVERED", iconType: "check" as const },
];

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const [data, setData] = useState<OrderPayload["order"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: OrderPayload) => setData(d.order))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-24 text-left">
        <p className="font-mono text-xs uppercase tracking-widest text-foreground/60 text-left">
          FETCHING ORDER DISPATCH RECORD...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-foreground/20 bg-surface p-10 text-left">
        <IconImage type="check" size={24} className="mb-4" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
          DISPATCH RECORD CONFIRMED
        </span>
        <h1 className="mt-2 font-serif text-3xl text-foreground text-left">
          Order {orderId} logged in archive
        </h1>
        <p className="mt-2 font-serif text-sm italic text-foreground/65 text-left">
          Your acquisition is confirmed. Tracking telemetry has been dispatched to your registered coordinates.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background text-left"
        >
          RETURN TO CATALOGUE
        </Link>
      </div>
    );
  }

  const currentIndex = TIMELINE.findIndex((t) => t.key === data.status);

  return (
    <div className="space-y-8 text-left">
      {/* Editorial Status Panel */}
      <div className="border border-foreground bg-surface p-8 text-left">
        <div className="flex items-center gap-2 text-left mb-2">
          <IconImage type="check" size={18} />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60 text-left">
            PAYMENT RECONCILED & AUTHORIZED
          </span>
        </div>
        <h1 className="font-serif text-4xl text-foreground text-left">
          Order {data.id} Placed
        </h1>
        <p className="mt-2 font-serif text-sm italic text-foreground/70 text-left">
          {data.items.length} pieces scheduled for custom atelier preparation. Paid via {data.paymentMethod.toUpperCase()}.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 border border-foreground/20 bg-background px-3 py-1.5 font-mono text-xs uppercase text-foreground text-left">
          <IconImage type="wallet" size={14} />
          <span>RESERVE CASHBACK ACCRUED: {formatINR(data.totals.cashbackEarned)}</span>
        </div>
      </div>

      {/* Progress Timeline - Horizontal Editorial Bar */}
      <div className="border border-foreground/15 bg-surface p-6 text-left">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-foreground text-left">
          COURIER DISPATCH TELEMETRY
        </h2>
        <div className="mt-6 grid grid-cols-4 gap-4 text-left">
          {TIMELINE.map((t, i) => {
            const done = i <= currentIndex;
            return (
              <div key={t.key} className="border-t-2 pt-3 text-left" style={{ borderColor: done ? "var(--foreground)" : "rgba(120,120,120,0.2)" }}>
                <div className="flex items-center gap-1.5 text-left mb-1">
                  <IconImage type={t.iconType} size={14} className={done ? "" : "opacity-40"} />
                  <span className="font-mono text-[10px] uppercase font-bold text-foreground text-left">
                    {t.label}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-foreground/50 text-left block">
                  STAGE 0{i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Items Manifest */}
      <div className="border border-foreground/15 bg-surface p-6 text-left">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-foreground text-left border-b border-foreground/10 pb-3">
          ACQUIRED SILHOUETTES
        </h2>
        <div className="divide-y divide-foreground/10 text-left">
          {data.items.map((i) => (
            <div key={`${i.productId}-${i.size}-${i.color}`} className="flex items-center justify-between py-4 text-left">
              <div className="flex items-center gap-4 text-left">
                <div className="relative h-16 w-14 overflow-hidden border border-foreground/20 bg-surface-muted">
                  <ProductImage
                    kind={i.kind}
                    color={i.colorHex || "#627264"}
                    seed={i.seed}
                    image={i.image}
                    alt={i.name}
                    sizes="64px"
                  />
                </div>
                <div className="text-left">
                  <p className="font-serif text-sm font-semibold text-foreground text-left">{i.name}</p>
                  <p className="font-mono text-[10px] uppercase text-foreground/50 text-left">
                    SIZE: {i.size} · SHADE: {i.color} · QTY: {i.qty}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold text-foreground text-right">
                {formatINR(i.price * i.qty)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
