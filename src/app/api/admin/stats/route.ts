import { requireAdmin } from "@/lib/auth/session";
import { listOrders, publicOrder } from "@/lib/data/orders-repo";
import { listProductsForAdmin } from "@/lib/data/products-repo";
import { listCoupons } from "@/lib/data/coupons-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [orders, products, coupons] = await Promise.all([
    listOrders(),
    listProductsForAdmin(),
    listCoupons(),
  ]);

  const settled = orders.filter((o) => o.status !== "pending" && o.status !== "cancelled");
  const revenue = settled.reduce((s, o) => s + o.totals.total, 0);
  const aov = settled.length ? Math.round(revenue / settled.length) : 0;

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const units = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of settled) {
    for (const item of order.items) {
      const cur = units.get(item.productId) ?? { name: item.name, qty: 0, revenue: 0 };
      cur.qty += item.qty;
      cur.revenue += item.price * item.qty;
      units.set(item.productId, cur);
    }
  }
  const topProducts = [...units.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return Response.json(
    {
      revenue,
      aov,
      orders: orders.length,
      settledOrders: settled.length,
      products: products.length,
      activeProducts: products.filter((p) => p.active).length,
      lowStock: products.filter((p) => p.stock <= 10).length,
      coupons: coupons.length,
      activeCoupons: coupons.filter((c) => c.active ?? true).length,
      byStatus,
      topProducts,
      lowStockProducts: products
        .filter((p) => p.stock <= 10)
        .slice(0, 5)
        .map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
      recentOrders: orders.slice(0, 6).map(publicOrder),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
