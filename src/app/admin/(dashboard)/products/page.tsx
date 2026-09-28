import { ProductsManager } from "@/components/admin/products-manager";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <section>
      <header className="mb-5">
        <h2 className="font-display text-xl font-extrabold">Products</h2>
        <p className="text-sm text-foreground/60">
          Create, edit, publish and delete — straight to the storefront catalogue.
        </p>
      </header>
      <ProductsManager />
    </section>
  );
}
