import Link from "next/link";
import { listOrders, publicOrder } from "@/lib/data/orders-repo";
import { listProductsForAdmin } from "@/lib/data/products-repo";
import { listCoupons } from "@/lib/data/coupons-repo";
import { formatINR, timeAgo } from "@/lib/utils";
import { IconImage } from "@/components/ui/icon-image";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [orders, products, coupons] = await Promise.all([
    listOrders(),
    listProductsForAdmin(),
    listCoupons(),
  ]);

  const settled = orders.filter((o) => o.status !== "pending" && o.status !== "cancelled");
  const revenue = settled.reduce((s, o) => s + o.totals.total, 0);
  const aov = settled.length ? Math.round(revenue / settled.length) : 0;
  const lowStock = products.filter((p) => p.stock <= 10).sort((a, b) => a.stock - b.stock);
  const recent = orders.slice(0, 6).map(publicOrder);

  const kpis = [
    { label: "Settled Gross", value: formatINR(revenue), iconName: "wallet" as const },
    { label: "Manifest Volume", value: String(orders.length), iconName: "delivery" as const },
    { label: "Mean Order Value", value: formatINR(aov), iconName: "sparkles" as const },
    {
      label: "Active Garment SKUs",
      value: `${products.filter((p) => p.active).length} / ${products.length}`,
      iconName: "bag" as const,
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Editorial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-line bg-surface divide-y sm:divide-y-0 sm:divide-x divide-line text-left">
        {kpis.map((k) => (
          <div key={k.label} className="p-6 text-left">
            <div className="flex items-center justify-between text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45">
                {k.label}
              </span>
              <IconImage name={k.iconName} alt={k.label} className="h-5 w-5 object-cover grayscale" />
            </div>
            <p className="mt-4 font-serif text-3xl font-light text-foreground text-left">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] text-left">
        {/* Recent orders */}
        <section className="border border-line bg-surface p-6 sm:p-8 text-left">
          <div className="flex items-center justify-between border-b border-line pb-4 text-left">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
                Queue
              </span>
              <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
                Recent Requisitions
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="font-mono text-[10px] uppercase tracking-widest text-foreground underline underline-offset-4"
            >
              Inspect Queue →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="mt-6 border-l-2 border-line pl-6 py-6 text-left">
              <p className="font-mono text-xs uppercase tracking-wider text-foreground/55 text-left">
                No requisitions recorded in active ledger.
              </p>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-line border-y border-line text-left">
              {recent.map((o) => (
                <li key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 text-left">
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground">
                        {o.id}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest border border-foreground/30 px-1.5 py-0.5 text-foreground/70">
                        {o.status}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-foreground/55 truncate mt-1 text-left">
                      {o.items.length} units · {o.address?.city ?? "Direct"} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-foreground text-left">{formatINR(o.totals.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Side column */}
        <div className="space-y-8 text-left">
          <section className="border border-line bg-surface p-6 sm:p-8 text-left">
            <div className="border-b border-line pb-4 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                Depletion Alert
              </span>
              <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
                Low Inventory Units
              </h2>
            </div>

            {lowStock.length === 0 ? (
              <p className="mt-6 font-mono text-xs uppercase tracking-wider text-foreground/55 text-left">
                Inventory equilibrium satisfied across all pieces.
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-line border-y border-line text-left">
                {lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 py-3 text-left">
                    <span className="font-serif text-sm font-normal text-foreground truncate text-left">{p.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider border border-foreground/30 px-2 py-0.5 text-foreground/80 shrink-0">
                      {p.stock === 0 ? "Depleted" : `${p.stock} Units`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/products"
              className="mt-6 block border border-line bg-transparent py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-foreground text-left"
            >
              [Catalog Stock Manager]
            </Link>
          </section>

          <section className="border border-line bg-surface p-6 sm:p-8 text-left">
            <div className="border-b border-line pb-4 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
                Privilege Codes
              </span>
              <h2 className="mt-1 font-serif text-2xl font-light text-foreground text-left">
                Promotional Tokens
              </h2>
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
              {coupons.filter((c) => c.active ?? true).length} active privileges registered of {coupons.length} total.
            </p>
            <Link
              href="/admin/coupons"
              className="mt-6 block border border-line bg-transparent py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-foreground text-left"
            >
              [Configure Vouchers]
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
