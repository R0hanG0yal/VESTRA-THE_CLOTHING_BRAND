import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/order/order-confirmation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <OrderConfirmation orderId={id} />
    </div>
  );
}
