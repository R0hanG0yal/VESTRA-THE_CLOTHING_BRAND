-- ===========================================================================
-- VESTRA — Supabase / Postgres schema
-- Run this in the Supabase SQL editor. Every table is protected by Row Level
-- Security so a user can only ever read/write their own rows.
-- ===========================================================================

-- ---------- Extensions -----------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------- Profiles -------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Shopper',
  phone text,
  skin_tone text,
  referral_code text unique not null default ('VESTRA-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,6))),
  referred_by text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- Helper used by the admin RLS policies below. SECURITY DEFINER so the check
-- can read profiles regardless of the caller's own row-level access.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Shopper'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Addresses ------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;
create policy "addresses: owner all" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Wallet ---------------------------------------------------------
create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 250,
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('credit','debit')),
  amount numeric(12,2) not null check (amount > 0),
  reason text not null,
  order_id text,
  created_at timestamptz not null default now()
);

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
create policy "wallets: owner read" on public.wallets
  for select using (auth.uid() = user_id);
create policy "wallet txns: owner read" on public.wallet_transactions
  for select using (auth.uid() = user_id);
-- Balances are only mutated by SECURITY DEFINER functions / the service role,
-- never directly by clients.

-- ---------- Orders ---------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','placed','packed','shipped','delivered','cancelled')),
  subtotal numeric(12,2) not null,
  coupon_code text,
  coupon_discount numeric(12,2) not null default 0,
  card_discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  wallet_used numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  cashback_earned numeric(12,2) not null default 0,
  payment_method text not null default 'UPI',
  payment_ref text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  address jsonb not null,
  intent_signature text not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  size text not null,
  color text not null,
  qty int not null check (qty between 1 and 10),
  unit_price numeric(12,2) not null,
  unit_mrp numeric(12,2) not null,
  kind text,
  color_hex text,
  image text
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders: owner read" on public.orders
  for select using (auth.uid() = user_id);
create policy "order items: owner read" on public.order_items
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_items.order_id and o.user_id = auth.uid())
  );
-- Admins can read and update every order (fulfilment + support).
create policy "orders: admin read all" on public.orders
  for select using (public.is_admin());
create policy "orders: admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
create policy "order items: admin read all" on public.order_items
  for select using (public.is_admin());
-- Inserts/updates happen via the server (service role) after the payment
-- intent is signed & verified. Clients never insert orders directly.

-- ---------- Referrals ------------------------------------------------------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  referee_email text,
  status text not null default 'pending'
    check (status in ('pending','completed','expired')),
  reward numeric(12,2) not null default 250,
  created_at timestamptz not null default now()
);

alter table public.referrals enable row level security;
create policy "referrals: referrer read" on public.referrals
  for select using (auth.uid() = referrer_id);

-- ---------- Coupons --------------------------------------------------------
create table if not exists public.coupons (
  code text primary key,
  label text not null,
  type text not null check (type in ('percent','flat','shipping','bogo')),
  value numeric(12,2) not null default 0,
  min_order numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  category text,
  bank text,
  description text not null,
  expires_at timestamptz not null,
  active boolean not null default true
);

alter table public.coupons enable row level security;
create policy "coupons: public read active" on public.coupons
  for select using (active = true);
create policy "coupons: admin read all" on public.coupons
  for select using (public.is_admin());
create policy "coupons: admin write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Products (admin-managed storefront catalogue) -----------------
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null default 'VESTRA',
  category text not null,
  kind text not null,
  gender text not null default 'unisex' check (gender in ('women','men','unisex')),
  price numeric(10,2) not null check (price >= 0),
  mrp numeric(10,2) not null check (mrp >= 0),
  rating numeric(2,1) not null default 4.5,
  rating_count int not null default 0,
  colors jsonb not null default '[]'::jsonb,
  sizes text[] not null default '{}',
  vibes text[] not null default '{}',
  occasions text[] not null default '{}',
  fits text[] not null default '{}',
  sustainability text[] not null default '{}',
  description text not null default '',
  image text,
  try_on_ready boolean not null default true,
  stock int not null default 0 check (stock >= 0),
  accessory_slot text,
  seed int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
-- Shoppers may read published products; only admins may read/insert/update/delete.
create policy "products: public read active" on public.products
  for select using (active = true);
create policy "products: admin read all" on public.products
  for select using (public.is_admin());
create policy "products: admin insert" on public.products
  for insert with check (public.is_admin());
create policy "products: admin update" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "products: admin delete" on public.products
  for delete using (public.is_admin());

-- ---------- Idempotency for payment webhooks ------------------------------
create table if not exists public.payment_events (
  event_id text primary key,
  order_id text not null,
  processed_at timestamptz not null default now()
);
alter table public.payment_events enable row level security;
-- service role only; no client policies.

-- ---------- Useful indexes -------------------------------------------------
create index if not exists idx_orders_user on public.orders(user_id, created_at desc);
create index if not exists idx_wallet_txn_user on public.wallet_transactions(user_id, created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_products_active on public.products(active, created_at desc);
create index if not exists idx_products_category on public.products(category);
