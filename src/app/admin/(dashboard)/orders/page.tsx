import { OrdersManager } from "@/components/admin/orders-manager";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <section>
      <header className="mb-5">
        <h2 className="font-display text-xl font-extrabold">Orders</h2>
        <p className="text-sm text-foreground/60">
          Track every order and move it through fulfilment.
        </p>
      </header>
      <OrdersManager />
    </section>
  );
}
