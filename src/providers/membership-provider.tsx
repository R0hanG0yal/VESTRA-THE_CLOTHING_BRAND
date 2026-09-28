"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * VESTRA One — the paid membership.
 *
 * ₹201/year unlocks member pricing on every product (~30% below the normal
 * price, floored at ₹99 so ultra-cheap items stay sane). State lives in
 * localStorage like the cart/wallet so the demo persists across reloads.
 *
 * Pricing constants live in `@/lib/membership` (server-safe — no "use client")
 * and are re-exported here so existing client imports keep working.
 */

export { MEMBERSHIP_PRICE, memberPriceFor } from "@/lib/member-pricing";

export interface MembershipState {
  /** null = not a member; ISO date the current term ends otherwise. */
  validUntil: string | null;
  joinedAt: string | null;
}

interface MembershipCtx extends MembershipState {
  ready: boolean;
  isActive: boolean;
  /** True while hydration from localStorage has not happened yet. */
  pending: boolean;
  join: () => void;
  cancel: () => void;
}

const STORAGE_KEY = "vestra_membership_v1";
const EMPTY: MembershipState = { validUntil: null, joinedAt: null };
const Ctx = createContext<MembershipCtx | null>(null);

export function useMembership() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMembership must be used within MembershipProvider");
  return ctx;
}

function isLive(validUntil: string | null): boolean {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() > Date.now();
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MembershipState>(EMPTY);
  const [ready, setReady] = useState(false);

  /** Keep the signed cookie in sync so server routes (UPI intents) can
   *  verify membership without trusting the request body. */
  const syncServer = useCallback((validUntil: string | null) => {
    try {
      void fetch("/api/membership/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validUntil }),
      });
    } catch {
      /* demo-only: server verification is best-effort */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as MembershipState);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  // Re-sync the signed cookie whenever a stored term is (re)hydrated, so the
  // cookie stays fresh even if the user joined in a previous session.
  useEffect(() => {
    if (!ready) return;
    if (state.validUntil) syncServer(state.validUntil);
  }, [ready, state.validUntil, syncServer]);

  const join = useCallback(() => {
    const now = new Date();
    const until = new Date(now);
    until.setFullYear(until.getFullYear() + 1);
    const iso = until.toISOString();
    setState({ joinedAt: now.toISOString(), validUntil: iso });
    syncServer(iso);
  }, [syncServer]);

  const cancel = useCallback(() => {
    setState(EMPTY);
    syncServer(null);
  }, [syncServer]);

  const value = useMemo<MembershipCtx>(
    () => ({
      ...state,
      ready,
      isActive: isLive(state.validUntil),
      pending: !ready,
      join,
      cancel,
    }),
    [state, ready, join, cancel],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
