"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconImage } from "@/components/ui/icon-image";
import { useCart } from "@/providers/cart-provider";
import { useWallet } from "@/providers/wallet-provider";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { useMembership } from "@/providers/membership-provider";
import { MEMBERSHIP_PRICE, memberPriceFor } from "@/lib/member-pricing";
import { BANK_OFFERS, COUPONS } from "@/lib/data/catalog";
import { computeTotals } from "@/lib/pricing";
import { cn, formatINR } from "@/lib/utils";
import type { Address } from "@/lib/types";

function generateFallbackTxnRef(): string {
  return `UPI${Date.now().toString().slice(-10)}`;
}

interface UpiIntent {
  orderId: string;
  upiLink: string | null;
  qr: string | null;
  walletOnly?: boolean;
  signature: string;
  totals: { total: number; cashbackEarned: number; walletUsed: number };
}

const EMPTY_ADDRESS: Address = {
  id: "addr1",
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

const UPI_APPS = [
  { name: "Google Pay", id: "gpay" },
  { name: "PhonePe", id: "phonepe" },
  { name: "Paytm", id: "paytm" },
  { name: "CRED / BHIM", id: "other" },
];

export function CheckoutClient() {
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();
  const { balance, credit, debit } = useWallet();
  const { user } = useAuth();
  const { push } = useToast();
  const { isActive: isMember, join: joinMembership } = useMembership();

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [bank, setBank] = useState<"" | "HDFC" | "ICICI" | "AXIS">("");
  const [applyWallet, setApplyWallet] = useState(false);
  const [offersExpanded, setOffersExpanded] = useState(false);
  const [dispatchConsent, setDispatchConsent] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  
  // Payment states
  const [intent, setIntent] = useState<UpiIntent | null>(null);
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<"idle" | "awaiting" | "verifying" | "success" | "failed">("idle");
  const [showQrModal, setShowQrModal] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [utrRef, setUtrRef] = useState("");

  const isMobile =
    typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vestra_address_v1");
      if (saved) setAddress({ ...EMPTY_ADDRESS, ...(JSON.parse(saved) as Address) });
      else if (user) setAddress((a) => ({ ...a, fullName: user.name }));
    } catch {
      /* ignore */
    }
  }, [user]);

  const preview = useMemo(
    () =>
      computeTotals({
        items,
        couponCode: couponCode || undefined,
        cardBank: bank || undefined,
        walletBalance: balance,
        useWallet: applyWallet,
        isMember,
      }),
    [items, couponCode, bank, balance, applyWallet, isMember],
  );

  useEffect(() => {
    if (ready && items.length === 0 && !intent) router.replace("/cart");
  }, [ready, items.length, intent, router]);

  // Live countdown for QR payment
  useEffect(() => {
    if (pollingStatus !== "awaiting" && !showQrModal) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [pollingStatus, showQrModal]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (honeypot.trim().length > 0) {
      next.fullName = "Security validation rejected.";
    }
    if (address.fullName.trim().length < 2) next.fullName = "Specify recipient legal name (min 2 characters)";
    if (!/^[6-9]\d{9}$/.test(address.phone)) next.phone = "Specify valid 10-digit Indian mobile (starts with 6-9)";
    if (address.line1.trim().length < 5) next.line1 = "Specify delivery postal address with street details";
    if (address.city.trim().length < 2) next.city = "Specify delivery city";
    if (address.state.trim().length < 2) next.state = "Specify state or province";
    if (!/^[1-9]\d{5}$/.test(address.pincode)) next.pincode = "Specify valid 6-digit postal PIN code (e.g. 400021)";
    if (!dispatchConsent) next.consent = "Consent for parcel dispatch logistics is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ═══ EXPLICIT PAYMENT VERIFICATION (Triggered when user confirms payment) ═══
  const handleVerifyPayment = async () => {
    if (!intent) return;
    setVerifying(true);
    setPollingStatus("verifying");
    try {
      const res = await fetch("/api/payments/upi/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: intent.orderId,
          txnRef: utrRef.trim() || generateFallbackTxnRef(),
          signature: intent.signature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Verification failed");

      if (intent.totals.walletUsed > 0) {
        debit(intent.totals.walletUsed, `Settlement for ${intent.orderId}`);
      }
      credit(intent.totals.cashbackEarned, `Cashback · ${intent.orderId}`);

      localStorage.setItem("vestra_last_order", intent.orderId);
      clear();
      setPollingStatus("success");
      push({
        title: "Payment Confirmed via UPI",
        description: `₹${intent.totals.cashbackEarned} cashback credited to your wallet`,
        variant: "success",
      });

      // Redirect to Order Confirmation page
      setTimeout(() => {
        router.push(`/order/${intent.orderId}`);
      }, 1000);
    } catch (err) {
      setPollingStatus("failed");
      push({
        title: "Payment verification failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setVerifying(false);
    }
  };

  async function initiatePayment() {
    if (!validate()) {
      push({ title: "Please fill all required delivery details", variant: "error" });
      return;
    }
    localStorage.setItem("vestra_address_v1", JSON.stringify(address));
    setCreating(true);

    try {
      const res = await fetch("/api/payments/upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            qty: i.qty,
          })),
          couponCode,
          cardBank: bank,
          useWallet: applyWallet,
          walletBalance: balance,
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not initiate secure payment");

      setIntent(data);
      setPollingStatus("awaiting");

      if (data.walletOnly) {
        // Wallet covers 100% of order -> instant settle
        handleVerifyPayment();
        return;
      }

      if (isMobile && data.upiLink) {
        // On mobile: launch the user's installed UPI app
        window.location.assign(data.upiLink);
      } else {
        // On desktop: show the luxury dynamic QR code plate
        setShowQrModal(true);
      }
    } catch (err) {
      push({
        title: "Payment initialization failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  if (!ready || items.length === 0) {
    return <div className="skeleton h-64 w-full rounded-3xl" />;
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="text-left max-w-5xl mx-auto">
      {/* ═══ STEP PROGRESSION PILL ═══ */}
      <div className="mb-6 flex items-center justify-between border-b border-foreground/10 pb-4 text-left">
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono uppercase tracking-wider">
          <Link href="/cart" className="text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1">
            <span>01 Bag</span>
            <span>→</span>
          </Link>
          <span className="font-bold text-foreground border-b-2 border-foreground pb-0.5">
            02 Shipping & Payment
          </span>
          <span className="text-foreground/30 hidden sm:inline">→ 03 Order Confirmed</span>
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-foreground/60 hidden sm:inline">Payable:</span>
          <span className="font-mono text-sm sm:text-base font-bold text-foreground">
            {formatINR(preview.totals.total)}
          </span>
        </div>
      </div>

      {/* ═══ MAIN CHECKOUT GRID ═══ */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] text-left">
        <div className="space-y-6 text-left">
          {/* Member Banner */}
          {!user && (
            <div className="flex items-center justify-between gap-3 rounded-2xl p-4 bg-white/20 dark:bg-white/[0.05] backdrop-blur-xl border border-white/30 dark:border-white/15 text-left">
              <div>
                <p className="font-serif text-xs sm:text-sm font-semibold text-foreground">
                  Patron of VESTRA Atelier?
                </p>
                <p className="text-[11px] text-foreground/70">
                  Sign in to autofill addresses and unlock priority member clearance.
                </p>
              </div>
              <Link
                href="/login?next=/checkout"
                className="rounded-full bg-foreground px-3.5 py-1.5 font-mono text-[10px] uppercase font-bold text-background tracking-wider shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* ── CARD 01: DISPATCH DESTINATION ── */}
          <section className="rounded-3xl p-5 sm:p-7 bg-white/30 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/35 dark:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-left">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3 mb-5 text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-foreground/60 font-bold">01</span>
                <h2 className="label-ui text-xs tracking-[0.2em] font-bold text-foreground uppercase">
                  Dispatch Destination
                </h2>
              </div>
              <span className="font-mono text-[10px] text-foreground/50">India Domestic Only</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-left">
              <input
                type="text"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
              <LuxuryField
                label="Full Recipient Name"
                placeholder="e.g. Rohan Goyal"
                error={errors.fullName}
                value={address.fullName}
                onChange={(v) => setAddress({ ...address, fullName: v })}
                autoComplete="name"
              />
              <LuxuryField
                label="Mobile Phone Number"
                placeholder="10-digit mobile"
                error={errors.phone}
                value={address.phone}
                onChange={(v) => setAddress({ ...address, phone: v.replace(/\D/g, "").slice(0, 10) })}
                inputMode="numeric"
                autoComplete="tel"
              />
              <div className="sm:col-span-2 text-left">
                <LuxuryField
                  label="Delivery Address (Flat / House, Building, Street)"
                  placeholder="e.g. Flat 402, Royal Palms, C-Scheme"
                  error={errors.line1}
                  value={address.line1}
                  onChange={(v) => setAddress({ ...address, line1: v })}
                  autoComplete="street-address"
                />
              </div>
              <LuxuryField
                label="City"
                placeholder="e.g. Jaipur"
                error={errors.city}
                value={address.city}
                onChange={(v) => setAddress({ ...address, city: v })}
                autoComplete="address-level2"
              />
              <div className="grid grid-cols-2 gap-3">
                <LuxuryField
                  label="State"
                  placeholder="e.g. Rajasthan"
                  error={errors.state}
                  value={address.state}
                  onChange={(v) => setAddress({ ...address, state: v })}
                  autoComplete="address-level1"
                />
                <LuxuryField
                  label="PIN Code"
                  placeholder="6 digits"
                  error={errors.pincode}
                  value={address.pincode}
                  onChange={(v) => setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) })}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </section>

          {/* ── CARD 02: COMPACT EXPANDABLE OFFERS & WALLET ── */}
          <section className="rounded-3xl p-5 sm:p-7 bg-white/30 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/35 dark:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-left">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3 mb-4 text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-foreground/60 font-bold">02</span>
                <h2 className="label-ui text-xs tracking-[0.2em] font-bold text-foreground uppercase">
                  Offers & Atelier Credits
                </h2>
              </div>
              {/* Expand Toggle */}
              <button
                type="button"
                onClick={() => setOffersExpanded((v) => !v)}
                className="label-ui text-[10px] font-bold text-foreground hover:underline transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{offersExpanded ? "[ Close Offers ▲ ]" : "[ View All Offers ▼ ]"}</span>
              </button>
            </div>

            {/* In-Front Option 1: Atelier Privilege Membership Status */}
            {isMember ? (
              <div className="flex items-center justify-between rounded-2xl p-3.5 bg-accent/15 border border-accent/30 text-left mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <div>
                    <span className="label-ui text-[10px] tracking-[0.2em] font-bold text-accent block">
                      ATELIER ONE · 30% PRIVILEGE ACTIVE
                    </span>
                    <span className="text-[11px] text-foreground/75 font-serif italic">
                      {preview.totals.memberDiscount && preview.totals.memberDiscount > 0
                        ? `Saving ${formatINR(preview.totals.memberDiscount)} preferential deduction on this order`
                        : "Preferential pricing automatically unlocked on all pieces"}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">
                  APPLIED
                </span>
              </div>
            ) : (
              (() => {
                const savingIfJoined = items.reduce(
                  (s, i) => s + (i.price - memberPriceFor(i.price)) * i.qty,
                  0,
                );
                return (
                  <div className="rounded-2xl border border-accent/30 bg-accent/10 p-3.5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="label-ui text-[10px] tracking-[0.15em] font-bold text-foreground">
                          ATELIER PRIVILEGE CLUB
                        </span>
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-mono font-bold text-accent">
                          SAVE {formatINR(savingIfJoined)}
                        </span>
                      </div>
                      <p className="font-serif text-xs italic text-foreground/75 mt-0.5">
                        Enrol for {formatINR(MEMBERSHIP_PRICE)}/yr to instantly deduct 30% ({formatINR(savingIfJoined)}) from this requisition.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        joinMembership();
                        push({
                          title: "Patron Membership Activated",
                          description: `30% privilege rate applied. Saved ${formatINR(savingIfJoined)}!`,
                          variant: "success",
                        });
                      }}
                      className="shrink-0 rounded-full bg-foreground px-4 py-2 text-[10px] label-ui tracking-wider font-bold text-background hover:opacity-90 transition-all cursor-pointer text-center"
                    >
                      + ENROL & SAVE ({formatINR(MEMBERSHIP_PRICE)}/YR)
                    </button>
                  </div>
                );
              })()
            )}

            {/* In-Front Option 2: Use Wallet Balance Toggle */}
            <label className="flex items-center justify-between rounded-2xl p-3.5 bg-white/40 dark:bg-white/[0.06] border border-white/30 dark:border-white/15 cursor-pointer transition-all hover:bg-white/60">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={applyWallet}
                  onChange={(e) => setApplyWallet(e.target.checked)}
                  className="h-4 w-4 accent-foreground rounded cursor-pointer"
                />
                <div>
                  <span className="font-mono text-xs uppercase font-bold text-foreground block">
                    Use Wallet Balance ({formatINR(balance)})
                  </span>
                  <span className="text-[11px] text-foreground/65">
                    {applyWallet && preview.totals.walletUsed > 0
                      ? `Applying −${formatINR(preview.totals.walletUsed)} deduction`
                      : "Deduct from available reserve credits"}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-foreground underline">
                {applyWallet ? "APPLIED" : "APPLY"}
              </span>
            </label>

            {/* In-Front Option 2: Promotional Coupon Writing Box */}
            <div className="mt-4 space-y-1.5">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMOTIONAL CODE"
                  maxLength={20}
                  className="flex-1 rounded-2xl border border-white/30 dark:border-white/15 bg-white/40 dark:bg-white/[0.06] px-4 py-2.5 font-mono text-xs uppercase tracking-wider outline-none focus:border-foreground transition-all placeholder:text-foreground/40 font-semibold"
                />
                {couponCode ? (
                  <button
                    type="button"
                    onClick={() => setCouponCode("")}
                    className="rounded-2xl border border-foreground/20 px-3.5 font-mono text-xs text-foreground/70 hover:text-foreground font-semibold"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOffersExpanded(true)}
                    className="rounded-2xl bg-white/40 dark:bg-white/10 hover:bg-white/60 border border-white/30 px-3.5 font-mono text-xs text-foreground font-bold tracking-wider"
                  >
                    Browse
                  </button>
                )}
              </div>
            </div>

            {/* ═══ EXPANDABLE OFFERS MENU (Smooth Liquid Glass Unfolding) ═══ */}
            {offersExpanded && (
              <div className="mt-4 pt-4 border-t border-foreground/10 space-y-4 animate-fade-up">
                {/* 1-Tap Coupon Chips */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/70 font-bold block mb-2">
                    Available Atelier Vouchers (Tap to Apply)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COUPONS.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCouponCode(c.code);
                          push({ title: `Voucher ${c.code} Applied`, variant: "success" });
                        }}
                        className={cn(
                          "rounded-xl px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider transition-all border cursor-pointer",
                          couponCode === c.code
                            ? "bg-foreground text-background border-foreground shadow-xs"
                            : "bg-white/40 dark:bg-white/10 hover:bg-white/60 border-white/30 text-foreground"
                        )}
                      >
                        [{c.code}] · {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Bank Card Reductions */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/70 font-bold block mb-2">
                    Partner Bank Reductions
                  </span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {BANK_OFFERS.map((b) => {
                      const active = bank === b.bank;
                      return (
                        <button
                          key={b.bank}
                          type="button"
                          onClick={() => setBank(active ? "" : (b.bank as "HDFC" | "ICICI" | "AXIS"))}
                          className={cn(
                            "rounded-2xl p-3 text-left border transition-all cursor-pointer",
                            active
                              ? "bg-foreground text-background border-foreground font-bold shadow-sm"
                              : "bg-white/30 dark:bg-white/[0.05] hover:bg-white/50 border-white/30 text-foreground"
                          )}
                        >
                          <div className="font-mono text-[11px] font-bold">{b.label}</div>
                          <div className={cn("text-[10px] truncate mt-0.5", active ? "text-background/80" : "text-foreground/65")}>
                            {b.detail}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOffersExpanded(false)}
                    className="label-ui text-[10px] text-foreground/60 hover:text-foreground underline cursor-pointer"
                  >
                    [ Collapse Offers ]
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ── CARD 03: ZERO-FRICTION UPI PAYMENT ── */}
          <section className="rounded-3xl p-5 sm:p-7 bg-white/30 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/35 dark:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-left">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3 mb-5 text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-foreground/60 font-bold">03</span>
                <h2 className="label-ui text-xs tracking-[0.2em] font-bold text-foreground uppercase">
                  UPI Instant Settlement
                </h2>
              </div>
              <span className="font-mono text-[10px] text-foreground font-bold">Direct Clearance</span>
            </div>

            {/* Mobile App Quick-Launch Grid */}
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/70 font-bold block">
                {isMobile ? "Select UPI Provider to Launch App" : "Supported UPI Providers"}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => initiatePayment()}
                    disabled={creating || pollingStatus === "awaiting"}
                    className="flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-white/35 dark:border-white/15 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">{app.name}</span>
                    <span className="font-mono text-[9px] text-foreground/50 mt-0.5">Instant Pay</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Consent row */}
            <div className="mt-6 pt-4 border-t border-foreground/10">
              <label className="flex items-start gap-2.5 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={dispatchConsent}
                  onChange={(e) => setDispatchConsent(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-foreground rounded cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-foreground/75 leading-tight">
                  I agree to courier dispatch updates & terms under the DPDP Act. View{" "}
                  <Link href="/privacy" target="_blank" className="underline font-bold text-foreground">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <p role="alert" className="mt-1 font-mono text-[10px] text-red-500 font-bold">
                  {errors.consent}
                </p>
              )}
            </div>

            {/* Main Primary CTA */}
            <button
              type="button"
              onClick={() => initiatePayment()}
              disabled={creating || pollingStatus === "awaiting"}
              className="mt-5 w-full rounded-full bg-foreground py-4 px-6 text-background font-mono text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <span>{creating ? "Generating Secure Intent..." : `Pay ${formatINR(preview.totals.total)} via UPI`}</span>
              <IconImage type="arrow" size={14} className="border-none invert dark:invert-0" />
            </button>
          </section>
        </div>

        {/* ── STICKY ORDER SUMMARY ASIDE ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start text-left">
          <div className="rounded-3xl p-5 sm:p-6 bg-white/40 dark:bg-white/[0.04] backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.08)] text-left">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3 text-left">
              <h3 className="label-ui text-xs tracking-[0.2em] font-bold text-foreground uppercase">
                Acquisition Summary
              </h3>
              <button
                type="button"
                onClick={() => setShowOrderSummary((v) => !v)}
                className="text-[11px] font-mono font-bold text-foreground/70 lg:hidden underline"
              >
                {showOrderSummary ? "Hide Items" : `View ${items.length} Items`}
              </button>
            </div>

            {/* Item Previews */}
            <div className={cn("mt-4 space-y-3 overflow-y-auto max-h-56 pr-1 custom-scrollbar", !showOrderSummary && "hidden lg:block")}>
              {items.map((i) => {
                const itemEffectivePrice = isMember ? memberPriceFor(i.price) : i.price;
                return (
                  <div key={`${i.productId}-${i.size}-${i.color}`} className="flex items-center justify-between text-left py-1.5 border-b border-foreground/5 last:border-0">
                    <div>
                      <p className="font-serif text-xs font-bold text-foreground">{i.name}</p>
                      <p className="font-mono text-[9px] uppercase text-foreground/60">
                        Size {i.size} · {i.color} · Qty {i.qty}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {formatINR(itemEffectivePrice * i.qty)}
                      </span>
                      {isMember && (
                        <span className="block font-mono text-[9px] text-foreground/40 line-through">
                          {formatINR(i.price * i.qty)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations Ledger */}
            <dl className="mt-4 space-y-2 font-mono text-xs text-left pt-3 border-t border-foreground/10">
              <div className="flex justify-between">
                <dt className="text-foreground/70">Gross Merchandise</dt>
                <dd className="font-bold">{formatINR(subtotal)}</dd>
              </div>
              {isMember && preview.totals.memberDiscount && preview.totals.memberDiscount > 0 ? (
                <div className="flex justify-between font-bold text-accent">
                  <dt>★ Atelier Privilege (−30%)</dt>
                  <dd>−{formatINR(preview.totals.memberDiscount)}</dd>
                </div>
              ) : null}
              {preview.totals.mrpDiscount && preview.totals.mrpDiscount > 0 ? (
                <div className="flex justify-between font-bold">
                  <dt>Archive Reduction</dt>
                  <dd>−{formatINR(preview.totals.mrpDiscount)}</dd>
                </div>
              ) : null}
              {preview.coupon && (
                <div className="flex justify-between font-bold">
                  <dt>Voucher [{preview.coupon.code}]</dt>
                  <dd>−{formatINR(preview.coupon.discount)}</dd>
                </div>
              )}
              {preview.totals.cardDiscount > 0 && (
                <div className="flex justify-between font-bold">
                  <dt>Bank Card Discount</dt>
                  <dd>−{formatINR(preview.totals.cardDiscount)}</dd>
                </div>
              )}
              {preview.totals.walletUsed > 0 && (
                <div className="flex justify-between font-bold">
                  <dt>Wallet Reserve Used</dt>
                  <dd>−{formatINR(preview.totals.walletUsed)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-foreground/70">Courier Dispatch</dt>
                <dd className="font-bold">
                  {preview.totals.shipping === 0 ? "FREE" : formatINR(preview.totals.shipping)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-foreground/15 pt-4 text-left">
              <span className="font-mono text-xs uppercase font-bold tracking-widest text-foreground">
                Net Disbursement
              </span>
              <span className="font-mono text-2xl font-bold text-foreground">
                {formatINR(preview.totals.total)}
              </span>
            </div>

            <div className="mt-3 rounded-2xl p-2.5 bg-white/30 dark:bg-white/[0.05] border border-white/20 text-center font-mono text-[10px] text-foreground font-bold">
              Cashback Accrual: {formatINR(preview.totals.cashbackEarned)} credited on delivery
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ REAL-TIME UPI VERIFICATION TERMINAL (Requires User Confirmation) ═══ */}
      {pollingStatus !== "idle" && intent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 text-center animate-fade-up">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-3xl border border-white/40 dark:border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.4)] text-center">
            {/* Status Indicator */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/40 dark:bg-white/10 border border-white/30 shadow-inner mb-4">
              {pollingStatus === "awaiting" && (
                <div className="h-10 w-10 animate-pulse rounded-full border-2 border-foreground flex items-center justify-center font-mono text-xs font-bold">
                  UPI
                </div>
              )}
              {pollingStatus === "verifying" && (
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-foreground border-t-transparent" />
              )}
              {pollingStatus === "success" && (
                <span className="text-3xl text-foreground font-bold">✓</span>
              )}
              {pollingStatus === "failed" && (
                <span className="text-3xl text-red-500 font-bold">!</span>
              )}
            </div>

            {/* Status Message */}
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60 font-bold block mb-1">
              Order {intent.orderId}
            </span>

            <h3 className="font-serif text-2xl font-bold text-foreground">
              {pollingStatus === "awaiting" && "Awaiting UPI Payment..."}
              {pollingStatus === "verifying" && "Verifying Settlement with Bank..."}
              {pollingStatus === "success" && "Payment Confirmed"}
              {pollingStatus === "failed" && "Verification Pending"}
            </h3>

            <p className="mt-2 text-xs text-foreground/75 font-medium leading-relaxed max-w-xs mx-auto">
              {pollingStatus === "awaiting" &&
                (isMobile
                  ? "Approve the payment in your UPI app, then tap 'I Have Paid' below to confirm."
                  : "Scan the QR code with your mobile UPI app, then click 'I Have Paid' to verify.")}
              {pollingStatus === "verifying" &&
                "Reconciling transaction with NPCI and payment gateway..."}
              {pollingStatus === "success" &&
                "Thank you. Your order has been placed successfully. Redirecting to receipt..."}
              {pollingStatus === "failed" &&
                "Transaction verification could not be completed. Please check or enter your UPI Ref ID below."}
            </p>

            {/* Live QR Code (if on desktop or QR requested) */}
            {!isMobile && intent.qr && pollingStatus === "awaiting" && (
              <div className="mt-5 flex flex-col items-center">
                <div className="rounded-2xl p-3 bg-white border border-foreground/15 shadow-sm inline-block">
                  <Image
                    src={intent.qr}
                    alt="UPI Payment QR Code"
                    width={180}
                    height={180}
                    unoptimized
                    className="rounded-lg"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-foreground font-bold">
                  <span>Payee VPA: vestra@upi</span>
                  <span>·</span>
                  <span className="font-bold">{formatTime(countdown)}</span>
                </div>
              </div>
            )}

            {/* Optional UTR / Reference ID Field if verification failed */}
            {pollingStatus === "failed" && (
              <div className="mt-4 text-left space-y-1">
                <label className="font-mono text-[10px] uppercase text-foreground/70 font-bold block text-left">
                  Optional UPI 12-Digit Reference No (UTR)
                </label>
                <input
                  value={utrRef}
                  onChange={(e) => setUtrRef(e.target.value)}
                  placeholder="e.g. 428192839182"
                  className="w-full rounded-xl border border-foreground/20 px-3 py-2 font-mono text-xs text-foreground"
                />
              </div>
            )}

            {/* Action Buttons (User must explicitly click to verify) */}
            <div className="mt-6 flex flex-col gap-2">
              {pollingStatus === "awaiting" && (
                <>
                  {isMobile && intent.upiLink && (
                    <a
                      href={intent.upiLink}
                      className="rounded-full border border-foreground/30 py-3 px-5 font-mono text-xs font-bold text-foreground uppercase tracking-wider hover:bg-foreground/5 transition-all"
                    >
                      Re-open UPI App
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyPayment}
                    disabled={verifying}
                    className="rounded-full bg-foreground py-3.5 px-6 font-mono text-xs font-bold text-background uppercase tracking-wider hover:opacity-90 transition-all shadow-md cursor-pointer"
                  >
                    {verifying ? "Verifying Transaction..." : "I Have Completed UPI Payment"}
                  </button>
                </>
              )}

              {pollingStatus === "failed" && (
                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="rounded-full bg-foreground py-3 px-5 font-mono text-xs font-bold text-background uppercase tracking-wider hover:opacity-90 cursor-pointer"
                >
                  {verifying ? "Verifying..." : "Re-Verify Payment Now"}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setPollingStatus("idle");
                  setShowQrModal(false);
                }}
                className="font-mono text-[11px] text-foreground/60 hover:text-foreground underline pt-2 cursor-pointer"
              >
                [ Change Payment Details / Cancel ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LuxuryField({
  label,
  value,
  placeholder,
  onChange,
  error,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <div className="text-left space-y-1">
      <label className="font-mono text-[10px] uppercase tracking-wider text-foreground/75 font-bold block text-left">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={cn(
          "w-full rounded-2xl border bg-white/40 dark:bg-white/[0.06] px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground outline-none transition-all placeholder:text-foreground/40 font-semibold",
          error
            ? "border-red-500 focus:border-red-500"
            : "border-white/35 dark:border-white/15 focus:border-foreground"
        )}
      />
      {error && <p className="font-mono text-[10px] text-red-500 font-bold">{error}</p>}
    </div>
  );
}
