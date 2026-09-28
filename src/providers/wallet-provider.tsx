"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import type { WalletTxn } from "@/lib/types";

const STORAGE_KEY = "vestra_wallet_v1";
const REFERRAL_KEY = "vestra_referral_v1";

export interface ReferralState {
  code: string;
  invited: number;
  earned: number;
}

interface WalletCtx {
  ready: boolean;
  balance: number;
  transactions: WalletTxn[];
  referral: ReferralState;
  credit: (amount: number, reason: string) => void;
  debit: (amount: number, reason: string) => boolean;
  setReferral: (next: Partial<ReferralState>) => void;
}

const Ctx = createContext<WalletCtx | null>(null);

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return `VESTRA-${out}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTxn[]>([]);
  const [referral, setReferralState] = useState<ReferralState>({
    code: "",
    invited: 0,
    earned: 0,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { balance: number; transactions: WalletTxn[] };
        setBalance(parsed.balance ?? 0);
        setTransactions(parsed.transactions ?? []);
      } else {
        // New users start with a welcome bonus so the wallet is demonstrable.
        setBalance(250);
        setTransactions([
          {
            id: nanoid(),
            type: "credit",
            amount: 250,
            reason: "Welcome bonus 🎉",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      const refRaw = localStorage.getItem(REFERRAL_KEY);
      if (refRaw) setReferralState(JSON.parse(refRaw) as ReferralState);
      else setReferralState({ code: randomCode(), invited: 0, earned: 0 });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, transactions }));
  }, [balance, transactions, ready]);

  useEffect(() => {
    if (!ready || !referral.code) return;
    localStorage.setItem(REFERRAL_KEY, JSON.stringify(referral));
  }, [referral, ready]);

  // Ref mirror of the balance so credit/debit can decide affordability
  // synchronously and reliably (setState updaters are not guaranteed to run
  // synchronously, especially under React StrictMode).
  const balanceRef = useRef(balance);
  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  const credit = useCallback((amount: number, reason: string) => {
    if (amount <= 0) return;
    balanceRef.current += amount;
    setBalance(balanceRef.current);
    setTransactions((t) => [
      {
        id: nanoid(),
        type: "credit",
        amount,
        reason,
        createdAt: new Date().toISOString(),
      },
      ...t,
    ]);
  }, []);

  const debit = useCallback((amount: number, reason: string) => {
    if (amount <= 0 || balanceRef.current < amount) return false;
    balanceRef.current = Math.max(0, balanceRef.current - amount);
    setBalance(balanceRef.current);
    setTransactions((t) => [
      {
        id: nanoid(),
        type: "debit",
        amount,
        reason,
        createdAt: new Date().toISOString(),
      },
      ...t,
    ]);
    return true;
  }, []);

  const setReferral = useCallback((next: Partial<ReferralState>) => {
    setReferralState((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo<WalletCtx>(
    () => ({ ready, balance, transactions, referral, credit, debit, setReferral }),
    [ready, balance, transactions, referral, credit, debit, setReferral],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
