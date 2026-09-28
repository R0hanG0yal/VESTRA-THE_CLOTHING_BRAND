import { createClient } from "@/lib/supabase/server";
import {
  getOrder,
  listOrders as listStored,
  setOrderStatus as setStored,
  type OrderStatus,
  type StoredOrder,
} from "@/lib/server/store";
import type { CartItem, GarmentKind, OrderTotals } from "@/lib/types";

/** Orders repository — Supabase `orders`/`order_items`, or the demo store. */

export type { StoredOrder, OrderStatus };

/** Order shape safe to hand to the client (no internal signature material). */
export type PublicOrder = Omit<StoredOrder, "intentSignature">;

export function publicOrder(order: StoredOrder): PublicOrder {
  const { intentSignature: _sig, ...safe } = order;
  void _sig;
  return safe;
}

interface OrderRow {
  id: string;
  status: string;
  subtotal: number;
  coupon_code: string | null;
  coupon_discount: number;
  card_discount: number;
  shipping: number;
  wallet_used: number;
  total: number;
  cashback_earned: number;
  payment_method: string;
  payment_ref: string | null;
  address: StoredOrder["address"];
  intent_signature: string;
  created_at: string;
  paid_at: string | null;
}

interface ItemRow {
  order_id: string;
  product_id: string;
  name: string;
  size: string;
  color: string;
  color_hex: string;
  kind: string;
  qty: number;
  unit_price: number;
  unit_mrp: number;
  image: string | null;
}

const STATUSES: OrderStatus[] = [
  "pending",
  "placed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

function mapOrder(row: OrderRow, items: ItemRow[]): StoredOrder {
  const cartItems: CartItem[] = items.map((i) => ({
    productId: i.product_id,
    name: i.name,
    price: Number(i.unit_price),
    mrp: Number(i.unit_mrp),
    size: i.size,
    color: i.color,
    colorHex: i.color_hex,
    kind: i.kind as GarmentKind,
    qty: Number(i.qty),
    seed: 0,
    image: i.image ?? undefined,
  }));

  const mrpTotal = cartItems.reduce((s, i) => s + i.mrp * i.qty, 0);
  const totals: OrderTotals = {
    subtotal: Number(row.subtotal),
    mrpTotal,
    productDiscount: Math.max(0, mrpTotal - Number(row.subtotal)),
    couponDiscount: Number(row.coupon_discount),
    cardDiscount: Number(row.card_discount),
    shipping: Number(row.shipping),
    walletUsed: Number(row.wallet_used),
    total: Number(row.total),
    cashbackEarned: Number(row.cashback_earned),
  };

  return {
    id: row.id,
    items: cartItems,
    totals,
    address: row.address,
    paymentMethod: row.payment_method,
    status: (STATUSES.includes(row.status as OrderStatus)
      ? row.status
      : "placed") as OrderStatus,
    createdAt: row.created_at,
    txnRef: row.payment_ref ?? undefined,
    paidAt: row.paid_at ?? undefined,
    intentSignature: row.intent_signature,
  };
}

export async function listOrders(): Promise<StoredOrder[]> {
  const supabase = await createClient();
  if (!supabase) return listStored();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !orders) return listStored();

  const ids = (orders as OrderRow[]).map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", ids.length ? ids : ["__none__"]);

  const grouped = new Map<string, ItemRow[]>();
  for (const item of (items as ItemRow[] | null) ?? []) {
    const list = grouped.get(item.order_id) ?? [];
    list.push(item);
    grouped.set(item.order_id, list);
  }

  return (orders as OrderRow[]).map((o) => mapOrder(o, grouped.get(o.id) ?? []));
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<StoredOrder | null> {
  const supabase = await createClient();
  if (!supabase) return setStored(id, status);

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);
  return mapOrder(data as OrderRow, (items as ItemRow[] | null) ?? []);
}

export async function findOrder(id: string): Promise<StoredOrder | undefined> {
  const supabase = await createClient();
  if (!supabase) return getOrder(id);
  const all = await listOrders();
  return all.find((o) => o.id === id);
}
