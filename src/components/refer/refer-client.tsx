"use client";

import { useState } from "react";
import { IconImage } from "@/components/ui/icon-image";
import { useWallet } from "@/providers/wallet-provider";
import { useToast } from "@/providers/toast-provider";
import { formatINR } from "@/lib/utils";

const REWARD = 250;

export function ReferClient() {
  const { referral, credit, setReferral } = useWallet();
  const { push } = useToast();
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [applying, setApplying] = useState(false);

  function copy() {
    navigator.clipboard
      ?.writeText(referral.code)
      .then(() => {
        setCopied(true);
        push({ title: "Code copied to clipboard", variant: "success" });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => push({ title: "Copy failure — record manually", variant: "error" }));
  }

  async function share() {
    const text = `Explore the tailored collections at VESTRA and receive ₹${REWARD} off with private voucher ${referral.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "VESTRA", text });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  async function applyFriendCode(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: friendCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Invalid invitation code");
      credit(data.reward, `Patron invitation credit · ${data.code}`);
      setReferral({ earned: referral.earned + data.reward });
      push({ title: `₹${data.reward} credited to wallet`, description: data.message, variant: "success" });
      setFriendCode("");
    } catch (err) {
      push({ title: "Voucher validation failed", description: err instanceof Error ? err.message : undefined, variant: "error" });
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="space-y-10 text-left">
      {/* Hero Editorial Invitation Banner */}
      <div className="border border-foreground bg-foreground p-8 text-background text-left sm:p-12">
        <div className="grid gap-8 text-left lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="text-left">
            <div className="flex items-center gap-2 text-left mb-3">
              <IconImage type="gift" size={16} className="border-none invert dark:invert-0" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70 text-left">
                PATRON PROTOCOL // PEER INVITATION
              </span>
            </div>
            <h1 className="font-serif text-4xl text-background text-left sm:text-5xl">
              Gift ₹{REWARD}, Acquire ₹{REWARD}.
            </h1>
            <p className="mt-3 font-serif text-sm italic text-background/80 leading-relaxed text-left max-w-lg">
              Transmit your private client invitation. When an invited guest confirms their premier order, ₹250 wallet reserve credits are disbursed to both patrons simultaneously.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-left">
              <div className="border border-background/40 bg-background/10 px-4 py-2.5 text-left">
                <span className="font-mono text-sm uppercase tracking-widest text-background font-bold text-left">
                  {referral.code || "VESTRA-INVITE"}
                </span>
              </div>
              <button
                onClick={copy}
                className="border border-background bg-background px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-transparent hover:text-background text-left"
              >
                {copied ? "[COPIED TO BUFFER]" : "[COPY VOUCHER CODE]"}
              </button>
              <button
                onClick={share}
                className="border border-background/40 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-background hover:border-background text-left"
              >
                [SHARE DISPATCH]
              </button>
            </div>
          </div>

          {/* Performance Data Ledger */}
          <div className="grid grid-cols-3 gap-3 border-t border-background/20 pt-6 text-left lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            {[
              { k: referral.invited, v: "INVITED PATRONS", type: "user" as const },
              { k: formatINR(referral.earned), v: "DISBURSED CREDITS", type: "wallet" as const },
              { k: "UNLIMITED", v: "CREDIT CAP", type: "sparkles" as const },
            ].map((s) => (
              <div key={s.v} className="border border-background/20 p-4 text-left bg-background/5">
                <IconImage type={s.type} size={14} className="border-none invert dark:invert-0 mb-2" />
                <p className="font-mono text-xl font-bold text-background text-left">{s.k}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-background/60 text-left">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 text-left lg:grid-cols-2">
        {/* Sequence Steps */}
        <div className="border border-foreground/20 bg-surface p-6 sm:p-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
            PROTOCOL BLUEPRINT
          </span>
          <h2 className="mt-1 font-serif text-2xl text-foreground text-left">
            How Invitation Credits Work
          </h2>
          <ol className="mt-6 space-y-4 text-left">
            {[
              "Transmit your personal alphanumeric invitation code to colleagues or peers.",
              "Invited patron applies the code during direct checkout on their initial piece.",
              "Upon order dispatch, ₹250 lands in each account balance immediately.",
              "Accumulate credits without ceiling — applicable toward any atelier piece.",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3.5 text-left">
                <span className="font-mono text-xs font-bold border border-foreground/30 px-2 py-0.5 text-left">
                  0{i + 1}
                </span>
                <p className="font-serif text-xs italic text-foreground/75 leading-relaxed text-left">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Claim Friend Code */}
        <div className="border border-foreground/20 bg-surface p-6 sm:p-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
            VOUCHER REDEMPTION
          </span>
          <h2 className="mt-1 font-serif text-2xl text-foreground text-left">
            Claim a Colleague&apos;s Code
          </h2>
          <p className="mt-2 font-serif text-sm italic text-foreground/60 text-left">
            Were you invited by an accredited VESTRA client? Redeem their code here to receive ₹250 instant reserve.
          </p>

          <form onSubmit={applyFriendCode} className="mt-6 space-y-3 text-left">
            <input
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
              placeholder="ENTER INVITATION CODE"
              maxLength={20}
              className="w-full border border-foreground/20 bg-background px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider outline-none text-left"
            />
            <button
              type="submit"
              disabled={applying || !friendCode.trim()}
              className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 disabled:opacity-40 text-left"
            >
              {applying ? "VERIFYING VOUCHER..." : "CLAIM ₹250 ATELIER CREDIT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
