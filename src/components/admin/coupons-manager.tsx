"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { cn, formatINR } from "@/lib/utils";
import type { Coupon } from "@/lib/types";
import { IconImage } from "@/components/ui/icon-image";

interface Draft {
  code: string;
  label: string;
  type: Coupon["type"];
  value: string;
  minOrder: string;
  maxDiscount: string;
  category: string;
  description: string;
  expiresAt: string;
  active: boolean;
}

function emptyDraft(): Draft {
  return {
    code: "",
    label: "",
    type: "percent",
    value: "10",
    minOrder: "999",
    maxDiscount: "",
    category: "",
    description: "",
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    active: true,
  };
}

function draftFrom(c: Coupon): Draft {
  return {
    code: c.code,
    label: c.label,
    type: c.type,
    value: String(c.value),
    minOrder: String(c.minOrder),
    maxDiscount: c.maxDiscount == null ? "" : String(c.maxDiscount),
    category: c.category ?? "",
    description: c.description,
    expiresAt: c.expiresAt.slice(0, 10),
    active: c.active ?? true,
  };
}

const inputCls =
  "w-full border border-line bg-surface px-3 py-2.5 font-mono text-xs outline-none focus:border-foreground transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-left">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-left">
        {label}
      </span>
      {children}
    </label>
  );
}

export function CouponsManager() {
  const router = useRouter();
  const { push } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } catch {
      push({ title: "Failed to sync voucher register", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push, router]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingCode(null);
    setDraft(emptyDraft());
    setDrawerOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditingCode(c.code);
    setDraft(draftFrom(c));
    setDrawerOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        code: draft.code.trim().toUpperCase(),
        label: draft.label.trim(),
        type: draft.type,
        value: Number(draft.value) || 0,
        minOrder: Number(draft.minOrder) || 0,
        maxDiscount: draft.maxDiscount ? Number(draft.maxDiscount) : undefined,
        category: draft.category.trim() || undefined,
        description: draft.description.trim(),
        expiresAt: draft.expiresAt,
        active: draft.active,
      };
      const res = await fetch(
        editingCode ? `/api/admin/coupons/${editingCode}` : "/api/admin/coupons",
        {
          method: editingCode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not save");
      push({
        title: editingCode ? "Token specification modified" : "New token registered",
        description: data.coupon?.code,
        variant: "success",
      });
      setDrawerOpen(false);
      await load();
    } catch (err) {
      push({
        title: "Save failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${c.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draftFrom(c), active: !(c.active ?? true) }),
      });
      if (!res.ok) throw new Error();
      setCoupons((list) =>
        list.map((x) => (x.code === c.code ? { ...x, active: !(x.active ?? true) } : x)),
      );
      push({ title: (c.active ?? true) ? "Voucher paused" : "Voucher activated", variant: "info" });
    } catch {
      push({ title: "Status toggle failed", variant: "error" });
    }
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete voucher specification ${c.code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${c.code}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCoupons((list) => list.filter((x) => x.code !== c.code));
      push({ title: "Voucher deleted from register", variant: "success" });
    } catch {
      push({ title: "Deletion failed", variant: "error" });
    }
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 text-left">
        <p className="font-mono text-xs uppercase tracking-wider text-foreground/60 text-left">
          {coupons.filter((c) => c.active ?? true).length} active tokens · {coupons.length} total registered
        </p>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors text-left"
        >
          <IconImage name="gift" alt="New" className="h-4 w-4 object-cover grayscale invert" />
          <span>Register Voucher Code</span>
        </button>
      </div>

      <div className="border border-line bg-surface text-left">
        {loading ? (
          <div className="py-20 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            Cataloging voucher register...
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            Zero vouchers currently registered in ledger.
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[10px] uppercase tracking-widest text-foreground/45 bg-surface-muted/30">
                <tr>
                  <th className="px-5 py-3.5 font-normal text-left">Token</th>
                  <th className="px-5 py-3.5 font-normal text-left">Privilege</th>
                  <th className="px-5 py-3.5 font-normal text-left">Parameters</th>
                  <th className="px-5 py-3.5 font-normal text-left">Expiration</th>
                  <th className="px-5 py-3.5 font-normal text-left">State</th>
                  <th className="px-5 py-3.5 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-left">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-surface-muted/40 transition-colors text-left">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-foreground text-left">
                      {c.code}
                    </td>
                    <td className="px-5 py-4 text-left">
                      <p className="font-serif text-sm font-normal text-foreground text-left">{c.label}</p>
                      <p className="font-mono text-[10px] text-foreground/50 text-left mt-0.5">{c.description}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-foreground/70 text-left">
                      {c.type === "percent" && `${c.value}% reduction`}
                      {c.type === "flat" && `${formatINR(c.value)} allowance`}
                      {c.type === "shipping" && "Zero dispatch fee"}
                      {c.type === "bogo" && "Two-for-one requisition"}
                      <br />
                      Threshold {formatINR(c.minOrder)}
                      {c.maxDiscount ? ` · Cap ${formatINR(c.maxDiscount)}` : ""}
                      {c.category ? ` · ${c.category}` : ""}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-foreground/60 text-left">{c.expiresAt}</td>
                    <td className="px-5 py-4 text-left">
                      <button
                        onClick={() => toggleActive(c)}
                        className={cn(
                          "border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                          (c.active ?? true)
                            ? "border-foreground bg-foreground text-background"
                            : "border-line bg-transparent text-foreground/45",
                        )}
                      >
                        {(c.active ?? true) ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 font-mono text-xs uppercase tracking-wider">
                        <button
                          onClick={() => openEdit(c)}
                          aria-label={`Edit ${c.code}`}
                          className="hover:text-foreground text-foreground/60 underline underline-offset-4"
                        >
                          [Edit]
                        </button>
                        <button
                          onClick={() => remove(c)}
                          aria-label={`Delete ${c.code}`}
                          className="text-rose-600 hover:text-rose-700 underline underline-offset-4"
                        >
                          [Delete]
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      <div
        className={cn("fixed inset-0 z-[120]", drawerOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink-900/60 transition-opacity",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface border-l border-line shadow-none transition-transform duration-300 text-left",
            drawerOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line p-6 text-left">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45 block">
                Register Modification
              </span>
              <h2 className="mt-1 font-serif text-xl font-light text-foreground text-left">
                {editingCode ? "Edit Voucher Token" : "Register Novel Voucher"}
              </h2>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
              className="font-mono text-xs uppercase tracking-wider text-foreground/50 hover:text-foreground"
            >
              [Close]
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-left">
              <Field label="Token Code">
                <input
                  value={draft.code}
                  onChange={(e) =>
                    setDraft({ ...draft, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })
                  }
                  maxLength={20}
                  disabled={Boolean(editingCode)}
                  className={cn(inputCls, editingCode && "opacity-60")}
                />
              </Field>
              <Field label="Public Label">
                <input
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  maxLength={40}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Type Specification">
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon["type"] })}
                className={inputCls}
              >
                <option value="percent">Percentage Reduction</option>
                <option value="flat">Fixed Credit Amount</option>
                <option value="shipping">Complimentary Dispatch</option>
                <option value="bogo">Two-for-One Pair</option>
              </select>
            </Field>

            <div className="grid grid-cols-3 gap-3 text-left">
              <Field label="Value">
                <input
                  value={draft.value}
                  onChange={(e) => setDraft({ ...draft, value: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
              <Field label="Threshold ₹">
                <input
                  value={draft.minOrder}
                  onChange={(e) =>
                    setDraft({ ...draft, minOrder: e.target.value.replace(/\D/g, "") })
                  }
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
              <Field label="Maximum Cap ₹">
                <input
                  value={draft.maxDiscount}
                  onChange={(e) =>
                    setDraft({ ...draft, maxDiscount: e.target.value.replace(/\D/g, "") })
                  }
                  inputMode="numeric"
                  placeholder="none"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <Field label="Department (Optional)">
                <input
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  placeholder="e.g. blazers"
                  maxLength={40}
                  className={inputCls}
                />
              </Field>
              <Field label="Expiry Date">
                <input
                  type="date"
                  value={draft.expiresAt}
                  onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Manifest Description">
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                maxLength={160}
                className={cn(inputCls, "resize-none")}
              />
            </Field>

            <label className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-foreground">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="h-4 w-4"
              />
              Active in Circulation
            </label>
          </div>

          <div className="flex gap-3 border-t border-line p-6 text-left">
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex-1 border border-line bg-transparent py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-foreground text-left"
            >
              [Cancel]
            </button>
            <button
              onClick={save}
              disabled={saving || draft.code.length < 3 || draft.label.length < 2}
              className="flex-1 border border-foreground bg-foreground py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 disabled:opacity-50 text-left"
            >
              {saving ? "[Saving...]" : editingCode ? "[Update Token]" : "[Commit Voucher]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
