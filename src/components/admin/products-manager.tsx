"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const { push } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [passcode, setPasscode] = useState("vestra-admin");
  const [loggingIn, setLoggingIn] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setAuthRequired(false);
    try {
      let res = await fetch("/api/admin/products", {
        cache: "no-store",
        credentials: "include",
        headers: { "X-Admin-Request": "1", "Cache-Control": "no-cache, no-store" },
      });

      // If 401, attempt quick auto-login with default dev passcode
      if (res.status === 401) {
        try {
          const authRes = await fetch("/api/admin/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passcode: "vestra-admin" }),
            credentials: "include",
          });
          if (authRes.ok) {
            res = await fetch("/api/admin/products", {
              cache: "no-store",
              credentials: "include",
              headers: { "X-Admin-Request": "1", "Cache-Control": "no-cache, no-store" },
            });
          }
        } catch {
          // ignore auto-auth error
        }
      }

      if (res.status === 401) {
        setAuthRequired(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const loaded: Product[] = data.products ?? [];
      setProducts(loaded);

      // Auto-seed if demo store is empty (first time visiting in demo mode)
      if (loaded.length === 0) {
        const seedRes = await fetch("/api/admin/seed", {
          method: "POST",
          credentials: "include",
          headers: { "X-Admin-Request": "1" },
        });
        if (seedRes.ok) {
          const seedData = await seedRes.json();
          const reloaded = await fetch("/api/admin/products", {
            cache: "no-store",
            credentials: "include",
            headers: { "X-Admin-Request": "1" },
          });
          if (reloaded.ok) {
            const rd = await reloaded.json();
            setProducts(rd.products ?? []);
          }
          push({ title: `${seedData.productsSeeded ?? seedData.products ?? 168} default products loaded`, variant: "info" });
        }
      }
    } catch {
      push({ title: "Failed to load products", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error || "Incorrect passcode");
      }
      setAuthRequired(false);
      push({ title: "Admin Login Successful", variant: "success" });
      await load();
    } catch (err) {
      push({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Incorrect passcode",
        variant: "error",
      });
    } finally {
      setLoggingIn(false);
    }
  }

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
          headers: { "Content-Type": "application/json", "X-Admin-Request": "1" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");

      push({
        title: editing ? "Product updated" : "Product added",
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
        headers: { "Content-Type": "application/json", "X-Admin-Request": "1" },
        body: JSON.stringify({ active: !p.active }),
      });
      if (!res.ok) throw new Error();
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
      push({
        title: !p.active ? "Product is now live" : "Product is now hidden",
        variant: "info",
      });
    } catch {
      push({ title: "Status toggle failed", variant: "error" });
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Delete product ${p.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "DELETE",
        headers: { "X-Admin-Request": "1" },
      });
      if (!res.ok) throw new Error();
      setProducts((list) => list.filter((x) => x.id !== p.id));
      push({ title: "Product deleted", variant: "success" });
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
      push({ title: "Products reset", description: `${data.products} products loaded`, variant: "success" });
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
            placeholder="Search products by name, category or ID..."
            className="w-full border border-line bg-surface px-4 py-3 font-mono text-xs outline-none focus:border-foreground transition-colors text-left"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          aria-label="Filter by status"
          className="border border-line bg-surface px-4 py-3 font-mono text-xs uppercase tracking-wider outline-none focus:border-foreground"
        >
          <option value="all">All Products</option>
          <option value="active">Active (Visible)</option>
          <option value="hidden">Hidden</option>
        </select>

        <button
          onClick={seed}
          disabled={seeding}
          className="inline-flex items-center gap-2 border border-line bg-transparent px-4 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-foreground transition-colors disabled:opacity-50"
        >
          <IconImage name="sparkles" alt="Seed" className="h-4 w-4 object-cover grayscale" />
          <span>{seeding ? "Loading..." : "Reset Default Products"}</span>
        </button>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
        >
          <IconImage name="bag" alt="New" className="h-4 w-4 object-cover grayscale invert" />
          <span>Add New Product</span>
        </button>
      </div>

      {authRequired && (
        <div className="border-2 border-foreground bg-surface p-6 sm:p-8 text-left space-y-4">
          <div>
            <h3 className="font-serif text-lg text-foreground font-semibold">
              Admin Passcode Required
            </h3>
            <p className="font-sans text-xs text-foreground/70 mt-1">
              Your session needs verification. Enter the admin passcode below (Default is <strong className="text-foreground">vestra-admin</strong>).
            </p>
          </div>
          <form onSubmit={handleInlineLogin} className="flex flex-wrap items-center gap-3">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="vestra-admin"
              className="border border-line bg-background px-4 py-2.5 font-mono text-xs text-foreground outline-none focus:border-foreground min-w-[200px]"
            />
            <button
              type="submit"
              disabled={loggingIn}
              className="border border-foreground bg-foreground px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {loggingIn ? "Logging In..." : "Log In & View Products"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="border border-line bg-surface text-left">
        {loading ? (
          <div className="py-20 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-8 text-left font-mono text-xs uppercase tracking-widest text-foreground/50">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[10px] uppercase tracking-widest text-foreground/45 bg-surface-muted/30">
                <tr>
                  <th className="px-5 py-3.5 font-normal text-left">Product</th>
                  <th className="px-5 py-3.5 font-normal text-left">Category</th>
                  <th className="px-5 py-3.5 font-normal text-left">Price</th>
                  <th className="px-5 py-3.5 font-normal text-left">Stock</th>
                  <th className="px-5 py-3.5 font-normal text-left">Status</th>
                  <th className="px-5 py-3.5 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-left">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/40 transition-colors text-left">
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center gap-4 text-left">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden border border-line bg-ink-900/5">
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
        {filtered.length} of {products.length} products shown · changes are live on the website.
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
                Products
              </span>
              <h2 className="mt-1 font-serif text-xl font-light text-foreground text-left">
                {editing ? "Edit Product" : "Add New Product"}
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
            <Field label="Product Name">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                maxLength={80}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4 text-left">
              <Field label="Brand">
                <input
                  value={draft.brand}
                  onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                  maxLength={40}
                  className={inputCls}
                />
              </Field>
              <Field label="Category">
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
              <Field label="Selling Price ₹">
                <input
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
              <Field label="MRP (Original Price) ₹">
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

            <Field label="For (Gender)">
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
              <Field label="Style (Vibes)">
                <input
                  value={draft.vibes}
                  onChange={(e) => setDraft({ ...draft, vibes: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Occasions">
                <input
                  value={draft.occasions}
                  onChange={(e) => setDraft({ ...draft, occasions: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Fit Type">
              <input
                value={draft.fits}
                onChange={(e) => setDraft({ ...draft, fits: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                maxLength={600}
                className={cn(inputCls, "resize-none")}
              />
            </Field>

            <Field label="Product Image URL (Optional)">
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
                  Colors
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
                Show on Website
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.tryOnReady}
                  onChange={(e) => setDraft({ ...draft, tryOnReady: e.target.checked })}
                  className="h-4 w-4"
                />
                3D Try-On Enabled
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
              {saving ? "[Saving...]" : editing ? "[Save Changes]" : "[Add Product]"}
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
