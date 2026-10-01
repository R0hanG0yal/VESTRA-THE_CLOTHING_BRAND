"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product/product-image";
import { useToast } from "@/providers/toast-provider";
import { formatINR, timeAgo } from "@/lib/utils";
import type { CartItem, OrderTotals } from "@/lib/types";
import { IconImage } from "@/components/ui/icon-image";

interface AdminOrder {
  id: string;
  items: CartItem[];
  totals: OrderTotals;
  status: string;
  paymentMethod: string;
  createdAt: string;
  address: { fullName: string; city: string; pincode: string; phone: string };
}

const STATUSES = ["pending", "placed", "packed", "shipped", "delivered", "cancelled"] as const;

export function OrdersManager() {
  const router = useRouter();
  const { push } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      push({ title: "Requisition sync failed", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push, router]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return `${o.id} ${o.address?.fullName ?? ""} ${o.address?.city ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [orders, query, statusFilter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Update failed");
      setOrders((list) =>
        list.map((o) => (o.id === id ? { ...o, status: data.order.status } : o)),
      );
      push({ title: `Order ${id} status updated to ${status}`, variant: "success" });
    } catch (err) {
      push({
        title: "Status amendment failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setUpdating(null);
    }
  }

  const revenue = orders
    .filter((o) => o.status !== "pending" && o.status !== "cancelled")
    .reduce((s, o) => s + o.totals.total, 0);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center gap-3 text-left">
        <div className="min-w-64 flex-1 text-left">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search manifest by ID, patron name, or city..."
            className="w-full border border-line bg-surface px-4 py-3 font-mono text-xs outline-none focus:border-foreground transition-colors text-left"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="border border-line bg-surface px-4 py-3 font-mono text-xs uppercase tracking-wider outline-none focus:border-foreground"
        >
          <option value="all">All Dispatches</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              Status // {s}
            </option>
          ))}
        </select>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 border border-line bg-transparent px-4 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-foreground transition-colors"
        >
          <IconImage name="sparkles" alt="Sync" className="h-4 w-4 object-cover grayscale" />
          <span>{loading ? "Syncing..." : "Sync Ledger"}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-8 border border-line bg-surface p-4 font-mono text-xs text-left">
        <div>
          <span className="text-foreground/45 uppercase tracking-wider block">Manifest Total</span>
          <span className="text-foreground font-semibold text-sm">{filtered.length} Dispatches</span>
        </div>
        <div>
          <span className="text-foreground/45 uppercase tracking-wider block">Cumulative Gross</span>
          <span className="text-foreground font-semibold text-sm">{formatINR(revenue)}</span>
        </div>
      </div>

      <div className="border border-line bg-surface text-left">
        {loading ? (
          <div className="py-20 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            Fetching dispatch manifests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            No requisitions match query criteria.
          </div>
        ) : (
          <ul className="divide-y divide-line text-left">
            {filtered.map((o) => (
              <li key={o.id} className="text-left">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-left">
                  <button
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    aria-expanded={expanded === o.id}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <span className="font-mono text-xs text-foreground/40 shrink-0">
                      {expanded === o.id ? "[-]" : "[+]"}
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="font-mono text-xs font-semibold text-foreground">{o.id}</p>
                      <p className="font-sans text-xs text-foreground/55 truncate mt-0.5 text-left">
                        {o.address?.fullName ?? "—"} · {o.address?.city ?? "—"} ·{" "}
                        {o.items.length} units · {timeAgo(o.createdAt)}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-4 text-left">
                    <span className="font-mono text-[10px] uppercase tracking-widest border border-foreground/30 px-2 py-0.5 text-foreground/80">
                      {o.status}
                    </span>
                    <span className="font-mono text-sm text-foreground">{formatINR(o.totals.total)}</span>

                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={updating === o.id}
                      aria-label={`Update status for ${o.id}`}
                      className="border border-line bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider outline-none focus:border-foreground disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {expanded === o.id && (
                  <div className="border-t border-line bg-surface-muted/30 p-6 text-left">
                    <div className="grid gap-8 sm:grid-cols-[1.5fr_1fr] text-left">
                      <div className="text-left">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block mb-3">
                          Requisition Manifest
                        </span>
                        <ul className="divide-y divide-line border-y border-line text-left">
                          {o.items.map((i, idx) => (
                            <li
                              key={`${i.productId}-${idx}`}
                              className="flex items-center gap-3 py-3 text-left"
                            >
                              <div className="relative h-12 w-10 shrink-0 overflow-hidden border border-line bg-ink-900/5">
                                <ProductImage
                                  kind={i.kind}
                                  color={i.colorHex || "#627264"}
                                  seed={i.seed}
                                  image={i.image}
                                  alt={i.name}
                                  sizes="40px"
                                />
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <p className="font-serif text-sm font-normal text-foreground truncate text-left">{i.name}</p>
                                <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/50 text-left">
                                  {i.size} · {i.color} · Qty {i.qty}
                                </p>
                              </div>
                              <span className="font-mono text-xs text-foreground">
                                {formatINR(i.price * i.qty)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-6 text-left border-l border-line pl-6">
                        <div className="text-left">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block mb-2">
                            Consignee Details
                          </span>
                          <p className="font-sans text-xs text-foreground/75 leading-relaxed text-left">
                            <span className="font-serif text-sm text-foreground block">{o.address?.fullName}</span>
                            {o.address?.city} {o.address?.pincode}
                            <br />
                            Phone: +91 {o.address?.phone}
                          </p>
                        </div>
                        <div className="text-left">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block mb-2">
                            Financial Settlement
                          </span>
                          <dl className="space-y-1.5 font-mono text-xs text-left">
                            <Row label="Base Subtotal" value={formatINR(o.totals.subtotal)} />
                            {o.totals.couponDiscount > 0 && (
                              <Row label="Coupon Credit" value={`− ${formatINR(o.totals.couponDiscount)}`} />
                            )}
                            {o.totals.cardDiscount > 0 && (
                              <Row label="Card Privilege" value={`− ${formatINR(o.totals.cardDiscount)}`} />
                            )}
                            {o.totals.walletUsed > 0 && (
                              <Row label="Wallet Applied" value={`− ${formatINR(o.totals.walletUsed)}`} />
                            )}
                            <Row label="Courier Dispatch" value={formatINR(o.totals.shipping)} />
                            <div className="flex justify-between border-t border-line pt-2 font-bold text-foreground">
                              <dt className="uppercase tracking-wider">Settled Amount</dt>
                              <dd>{formatINR(o.totals.total)}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-left">
      <dt className="text-foreground/55 uppercase tracking-wider">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
