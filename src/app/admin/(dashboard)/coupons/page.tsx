import { CouponsManager } from "@/components/admin/coupons-manager";

export const dynamic = "force-dynamic";

export default function AdminCouponsPage() {
  return (
    <section>
      <header className="mb-5">
        <h2 className="font-display text-xl font-extrabold">Coupons</h2>
        <p className="text-sm text-foreground/60">
          Manage discounts — validated server-side at checkout.
        </p>
      </header>
      <CouponsManager />
    </section>
  );
}
