import type { Address, CartItem, OrderTotals } from "@/lib/types";

/**
 * In-memory order store. This keeps the demo fully functional without a
 * database. In production, replace the Map with your Postgres/Supabase tables
 * (see supabase/schema.sql) — the function signatures stay the same.
 */

export interface StoredOrder {
  id: string;
  items: CartItem[];
  totals: OrderTotals;
  address: Address;
  paymentMethod: string;
  status: "pending" | "placed" | "packed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  txnRef?: string;
  paidAt?: string;
  /** Signed intent payload that must match on verification. */
  intentSignature: string;
}

const orders = new Map<string, StoredOrder>();
const processedWebhooks = new Set<string>(); // idempotency guard

function randomId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function createOrder(order: Omit<StoredOrder, "id" | "createdAt" | "status">) {
  const id = `VST-${randomId()}`;
  const stored: StoredOrder = {
    ...order,
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.set(id, stored);
  return stored;
}

export function getOrder(id: string) {
  return orders.get(id);
}

export function markPaid(id: string, txnRef: string) {
  const order = orders.get(id);
  if (!order) return null;
  order.status = "placed";
  order.txnRef = txnRef;
  order.paidAt = new Date().toISOString();
  return order;
}

export function listOrders() {
  return [...orders.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export type OrderStatus = StoredOrder["status"];

/** Admin action: move an order through its fulfilment lifecycle. */
export function setOrderStatus(id: string, status: OrderStatus) {
  const order = orders.get(id);
  if (!order) return null;
  order.status = status;
  return order;
}

/** Returns false when the webhook id was already processed (idempotency). */
export function markWebhookProcessed(id: string) {
  if (processedWebhooks.has(id)) return false;
  processedWebhooks.add(id);
  return true;
}
