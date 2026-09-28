"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product/product-image";
import { useToast } from "@/providers/toast-provider";
import { CATEGORIES } from "@/lib/data/catalog";
import { cn, formatINR } from "@/lib/utils";
import type { ColorOption, Product } from "@/lib/types";
import { IconImage } from "@/components/ui/icon-image";

interface Draft {
  name: string;
  brand: string;
  category: string;
  gender: "women" | "men" | "unisex";
  price: string;
  mrp: string;
  stock: string;
  description: string;
  image: string;
  sizes: string;
  vibes: string;
  occasions: string;
  fits: string;
  tryOnReady: boolean;
  active: boolean;
  colors: ColorOption[];
}

function emptyDraft(): Draft {
  return {
    name: "",
    brand: "VESTRA",
    category: CATEGORIES[0].slug,
    gender: "unisex",
    price: "999",
    mrp: "1599",
    stock: "25",
    description: "",
    image: "",
    sizes: "S, M, L, XL",
    vibes: "Minimal",
    occasions: "Casual",
    fits: "Regular",
    tryOnReady: true,
    active: true,
    colors: [{ name: "Onyx", hex: "#111114", tone: "neutral" }],
  };
}

function draftFrom(p: Product): Draft {
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    gender: p.gender,
    price: String(p.price),
    mrp: String(p.mrp),
    stock: String(p.stock),
    description: p.description,
    image: p.image ?? "",
    sizes: p.sizes.join(", "),
    vibes: p.vibes.join(", "),
    occasions: p.occasions.join(", "),
    fits: p.fits.join(", "),
    tryOnReady: p.tryOnReady,
    active: p.active,
    colors: p.colors,
  };
}

export function ProductsManager() {
  const router = useRouter();
  const { push } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      push({ title: "Failed to load garments", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push, router]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter === "active" && !p.active) return false;
      if (statusFilter === "hidden" && p.active) return false;
      if (!q) return true;
      return `${p.name} ${p.brand} ${p.category} ${p.id}`.toLowerCase().includes(q);
    });
  }, [products, query, statusFilter]);

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft());
    setDrawerOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setDraft(draftFrom(p));
    setDrawerOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        brand: draft.brand.trim() || "VESTRA",
        category: draft.category,
        gender: draft.gender,
        price: Number(draft.price) || 0,
        mrp: Number(draft.mrp) || 0,
        stock: Number(draft.stock) || 0,
        description: draft.description.trim(),
        image: draft.image.trim() || undefined,
        sizes: draft.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        vibes: draft.vibes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        occasions: draft.occasions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        fits: draft.fits
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tryOnReady: draft.tryOnReady,
        active: draft.active,
        colors: draft.colors,
      };

      const res = await fetch(
        editing ? `/api/admin/products/${editing.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");

      push({
        title: editing ? "Garment record amended" : "Garment cataloged",
        description: data.product?.name,
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

  async function toggleActive(p: Product) {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      if (!res.ok) throw new Error();
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
      push({
        title: !p.active ? "Garment listed publicly" : "Garment archived from view",
        variant: "info",
      });
    } catch {
      push({ title: "Status toggle failed", variant: "error" });
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Delete product ${p.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setProducts((list) => list.filter((x) => x.id !== p.id));
      push({ title: "Garment removed from ledger", variant: "success" });
    } catch {
      push({ title: "Deletion failed", variant: "error" });
    }
  }

  async function seed() {
    if (!confirm("Re-initialize catalog defaults?")) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      push({ title: "Catalogue re-seeded", description: `${data.products} pieces`, variant: "success" });
      await load();
    } catch (err) {
      push({
        title: "Seed failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6 text-left">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 text-left">
        <div className="min-w-64 flex-1 text-left">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search garment titles, departments, or SKUs..."
            className="w-full border border-line bg-surface px-4 py-3 font-mono text-xs outline-none focus:border-foreground transition-colors text-left"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          aria-label="Filter by status"
          className="border border-line bg-surface px-4 py-3 font-mono text-xs uppercase tracking-wider outline-none focus:border-foreground"
        >
          <option value="all">All States</option>
          <option value="active">Active In Broadside</option>
          <option value="hidden">Archived Private</option>
        </select>

        <button
          onClick={seed}
          disabled={seeding}
          className="inline-flex items-center gap-2 border border-line bg-transparent px-4 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-foreground transition-colors disabled:opacity-50"
        >
          <IconImage name="sparkles" alt="Seed" className="h-4 w-4 object-cover grayscale" />
          <span>{seeding ? "Re-initializing..." : "Reset Default DB"}</span>
        </button>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
        >
          <IconImage name="bag" alt="New" className="h-4 w-4 object-cover grayscale invert" />
          <span>Catalog New Garment</span>
        </button>
      </div>

      {/* Table */}
      <div className="border border-line bg-surface text-left">
        {loading ? (
          <div className="py-20 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            Cataloging garments ledger...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            Zero garment specifications match query.
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[10px] uppercase tracking-widest text-foreground/45 bg-surface-muted/30">
                <tr>
                  <th className="px-5 py-3.5 font-normal text-left">Garment Specimen</th>
                  <th className="px-5 py-3.5 font-normal text-left">Department</th>
                  <th className="px-5 py-3.5 font-normal text-left">Valuation</th>
                  <th className="px-5 py-3.5 font-normal text-left">Units</th>
                  <th className="px-5 py-3.5 font-normal text-left">Visibility</th>
                  <th className="px-5 py-3.5 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-left">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/40 transition-colors text-left">
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center gap-4 text-left">
                        <div className="h-12 w-10 shrink-0 overflow-hidden border border-line bg-ink-900/5">
                          <ProductImage
                            kind={p.kind}
                            color={p.colors[0]?.hex ?? "#111114"}
                            seed={p.seed}
                            image={p.image}
                            alt={p.name}
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-serif text-sm font-normal text-foreground truncate text-left">{p.name}</p>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45 text-left mt-0.5">
                            {p.brand} {"//"} {p.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs uppercase tracking-wider text-foreground/70 text-left">
                      {p.category}
                    </td>
                    <td className="px-5 py-4 text-left">
                      <span className="font-mono text-xs text-foreground font-semibold">{formatINR(p.price)}</span>
                      <span className="ml-2 font-mono text-[10px] text-foreground/40 line-through">
                        {formatINR(p.mrp)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <span
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border",
                          p.stock === 0
                            ? "border-rose-600 text-rose-600"
                            : p.stock <= 10
                              ? "border-amber-600 text-amber-600"
                              : "border-foreground/30 text-foreground/75",
                        )}
                      >
                        {p.stock === 0 ? "Depleted" : `${p.stock} units`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <button
                        onClick={() => toggleActive(p)}
                        className={cn(
                          "border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                          p.active
                            ? "border-foreground bg-foreground text-background"
                            : "border-line bg-transparent text-foreground/45",
                        )}
                      >
                        {p.active ? "Published" : "Archived"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 font-mono text-xs uppercase tracking-wider">
                        <button
                          onClick={() => openEdit(p)}
                          aria-label={`Edit ${p.name}`}
                          className="hover:text-foreground text-foreground/60 underline underline-offset-4"
                        >
                          [Edit]
                        </button>
                        <button
                          onClick={() => remove(p)}
                          aria-label={`Delete ${p.name}`}
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

      <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 text-left">
        {filtered.length} of {products.length} garments registered · immediate live reflection on broadside rails.
      </p>

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
            "absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-surface border-l border-line shadow-none transition-transform duration-300 text-left",
            drawerOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line p-6 text-left">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45 block">
                Catalog Registry
              </span>
              <h2 className="mt-1 font-serif text-xl font-light text-foreground text-left">
                {editing ? "Modify Garment Specification" : "Register Novel Piece"}
              </h2>
              {editing && (
                <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/45 mt-0.5">{editing.id}</p>
              )}
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
            <Field label="Garment Title">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                maxLength={80}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4 text-left">
              <Field label="Maison / Label">
                <input
                  value={draft.brand}
                  onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                  maxLength={40}
                  className={inputCls}
                />
              </Field>
              <Field label="Department Category">
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left">
              <Field label="Requisition Price ₹">
                <input
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
              <Field label="MRP Reference ₹">
                <input
                  value={draft.mrp}
                  onChange={(e) => setDraft({ ...draft, mrp: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
              <Field label="Stock Units">
                <input
                  value={draft.stock}
                  onChange={(e) => setDraft({ ...draft, stock: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Intended Gender Demarcation">
              <div className="flex gap-2 text-left">
                {(["women", "men", "unisex"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setDraft({ ...draft, gender: g })}
                    className={cn(
                      "flex-1 border px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
                      draft.gender === g
                        ? "border-foreground bg-foreground text-background"
                        : "border-line text-foreground/70 hover:border-foreground",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Sizes (Comma separated)">
              <input
                value={draft.sizes}
                onChange={(e) => setDraft({ ...draft, sizes: e.target.value })}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4 text-left">
              <Field label="Aesthetic Moods">
                <input
                  value={draft.vibes}
                  onChange={(e) => setDraft({ ...draft, vibes: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Occasion Indices">
                <input
                  value={draft.occasions}
                  onChange={(e) => setDraft({ ...draft, occasions: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Cut & Fit Structure">
              <input
                value={draft.fits}
                onChange={(e) => setDraft({ ...draft, fits: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Architectural Description">
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                maxLength={600}
                className={cn(inputCls, "resize-none")}
              />
            </Field>

            <Field label="Plate Image URL (Optional)">
              <input
                value={draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                placeholder="/products/tshirt-01.jpg"
                maxLength={2048}
                className={inputCls}
              />
            </Field>

            {/* Colors */}
            <div className="text-left">
              <div className="mb-2 flex items-center justify-between text-left">
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
                  Colorway Swatches
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      colors: [...draft.colors, { name: "New Swatch", hex: "#c8a96b", tone: "neutral" }],
                    })
                  }
                  className="font-mono text-xs uppercase tracking-wider text-foreground underline underline-offset-4"
                >
                  [+ Add Swatch]
                </button>
              </div>
              <div className="space-y-2">
                {draft.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-left">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => {
                        const next = [...draft.colors];
                        next[i] = { ...c, hex: e.target.value };
                        setDraft({ ...draft, colors: next });
                      }}
                      aria-label="Color hex"
                      className="h-9 w-9 shrink-0 border border-line bg-surface"
                    />
                    <input
                      value={c.name}
                      onChange={(e) => {
                        const next = [...draft.colors];
                        next[i] = { ...c, name: e.target.value };
                        setDraft({ ...draft, colors: next });
                      }}
                      maxLength={40}
                      className={cn(inputCls, "flex-1")}
                    />
                    <select
                      value={c.tone}
                      onChange={(e) => {
                        const next = [...draft.colors];
                        next[i] = { ...c, tone: e.target.value as ColorOption["tone"] };
                        setDraft({ ...draft, colors: next });
                      }}
                      aria-label="Undertone"
                      className={cn(inputCls, "w-28")}
                    >
                      <option value="warm">Warm</option>
                      <option value="cool">Cool</option>
                      <option value="neutral">Neutral</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          colors: draft.colors.filter((_, idx) => idx !== i),
                        })
                      }
                      aria-label="Remove colorway"
                      className="font-mono text-xs uppercase tracking-wider text-rose-600 hover:text-rose-700 p-2"
                    >
                      [X]
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 font-mono text-xs uppercase tracking-wider text-left">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="h-4 w-4"
                />
                Published Broadside
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.tryOnReady}
                  onChange={(e) => setDraft({ ...draft, tryOnReady: e.target.checked })}
                  className="h-4 w-4"
                />
                Spatial Try-On Calibration Active
              </label>
            </div>
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
              disabled={saving || draft.name.trim().length < 2}
              className="flex-1 border border-foreground bg-foreground py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 disabled:opacity-50 text-left"
            >
              {saving ? "[Saving...]" : editing ? "[Commit Changes]" : "[Catalog Specimen]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
