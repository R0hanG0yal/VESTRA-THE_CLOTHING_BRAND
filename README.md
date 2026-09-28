# VESTRA — AI clothing-brand storefront

A modern, gen-Z clothing brand app built with **Next.js 16 (App Router)**, **React 19**,
**Tailwind CSS v4** and optional **Supabase**. It ships with an AI virtual try-on, a
skin-tone colour advisor, complete-outfit edits, an infinite-scroll feed, coupons /
card offers / wallet cashback, a refer-and-earn programme and a secure UPI checkout.

> This is a **demo storefront**. No real payments are processed and no real AI model is
> called — those integration points are clearly marked and ready to swap in.

## ✨ Features

| Area | What it does |
| --- | --- |
| **AI Virtual Try-On** (`/try-on`) | Lenskart-style photo upload, body-type selection, animated AI processing and a drag-to-spin "3D" render with a fit score and size recommendation. |
| **Skin-tone Colour Advisor** (`/style-advisor`) | Pick or auto-detect a skin tone, get a best/avoid colour palette, then shop a grid pre-filtered to your flattering shades. |
| **Infinite feed** (`/`, `/shop`) | Loads more outfits as you scroll — no dead-end pages. |
| **Category pages** (`/category/[slug]`) | Meesho-style category browse with the full filter engine. |
| **Modern filters** | Vibe (Y2K, Streetwear, Old Money…), occasion, colour, fit, size, price, discount, rating, sustainability. |
| **Complete outfits** (`/look/[id]`) | Myntra-style bundles with accessories and a one-tap "add all" / "buy the look". |
| **Catalogue & deals** | Coupons, instant bank/card offers, product-level MRP discounts. |
| **Wallet & cashback** (`/wallet`) | 5% cashback on every order, transactions ledger, coupons vault. |
| **Refer & Earn** (`/refer`) | Unique referral codes, share sheet, ₹250 rewards to both wallets. |
| **UPI checkout** (`/checkout`) | Signed, tamper-proof `upi://pay` intent that opens the user's UPI app chooser, with a QR fallback on desktop. |
| **Accounts** (`/account`, `/login`, `/signup`) | Auth, orders & tracking, saved addresses, security settings. |
| **Admin console** (`/admin`) | Passcode-gated dashboard to manage **products**, **coupons** and **orders**, with KPI overview. Product CRUD drives the live storefront. |

## 🛠 Admin console

Visit `/admin` (or the “Admin console” link in the footer) and enter the admin
passcode.

- **Demo passcode:** `vestra-admin` (shown as a hint on the login screen).
  Set a strong `ADMIN_PASSCODE` in production — logins are **refused** while the
  default is still in place.
- On success the server issues a **short-lived, HMAC-signed `vestra_admin`
  cookie** (8h). The passcode is never stored client-side.
- Access is **role-based**: middleware gates `/admin`, the dashboard layout
  re-verifies the signature + `admin` role server-side, and **every** admin API
  route calls `requireAdmin()`. With Supabase configured, RLS policies enforce
  the same rule at the database level via `public.is_admin()`.

**What you can manage**

| Module | Capabilities |
| --- | --- |
| Products | List/search, create, edit (price, MRP, stock, colours, sizes, vibes…), publish/unpublish, delete. Writes go to Supabase `products` (or the in-memory demo store) and appear on the storefront feed + product pages. |
| Coupons | Create/edit/pause/delete discounts; validated server-side at checkout. |
| Orders | Browse every order, expand for items/address/totals, and advance status (placed → packed → shipped → delivered / cancelled). |
| Overview | Revenue, order count, AOV, low-stock alerts and recent orders. |

**Seeding (with Supabase):** run `supabase/schema.sql`, then hit **Seed** in the
Admin → Products toolbar (or `POST /api/admin/seed`) to copy the static
catalogue and coupons into the database.

## 🔐 Security model

- **Nonce-based Content-Security-Policy** generated per-request in `src/middleware.ts`,
  plus strict HSTS, `X-Frame-Options: DENY`, `nosniff`, COOP/CORP and a hardened
  `Permissions-Policy` (see `next.config.ts`).
- **Server-authoritative pricing** (`src/lib/pricing.ts`): the client never sends a price.
  Every rupee is recomputed from the trusted catalogue, so amounts can't be tampered with.
- **Signed UPI intents** (`src/lib/security/sign.ts`): the payee and amount are HMAC-signed
  before the deep link is built. Verification (`/api/payments/upi/verify`) compares the
  signature — a client-side "SUCCESS" string is never trusted.
- **Webhook settlement** (`/api/payments/webhook`): HMAC-verified and idempotent, the only
  authoritative source of payment status in production.
- **Input validation** with Zod on every API route (`src/lib/security/validation.ts`).
- **Rate limiting** per IP on all sensitive endpoints (`src/lib/security/rate-limit.ts`).
- **HttpOnly, signed session cookies**; protected routes gated in middleware.
- **Privacy**: uploaded try-on photos are processed in-memory and never stored or logged.

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # optional — works in demo mode without it
npm run dev
```

Open <http://localhost:3000>.

### Enabling Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor (creates tables + RLS policies).
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.

Without these, the app runs in **demo mode**: auth uses a signed cookie and wallet data
persists in `localStorage`.

## 🧱 Project structure

```
src/
  app/            # routes (pages + API route handlers)
  components/     # UI: brand art, product cards, shop, checkout, try-on, …
  hooks/          # useInfiniteProducts
  lib/            # data catalogue, pricing, filters, security, supabase, types
  providers/      # theme, toast, auth, wallet, cart
  middleware.ts   # CSP nonce + route protection + /admin gate
supabase/schema.sql
```

## 📜 Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
npx tsc --noEmit  # type-check
```
