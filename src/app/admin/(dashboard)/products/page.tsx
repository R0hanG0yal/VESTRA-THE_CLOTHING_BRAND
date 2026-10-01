import { ProductsManager } from "@/components/admin/products-manager";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <section>
      <header className="mb-5">
        <h2 className="font-display text-xl font-extrabold">Products</h2>
        <p className="text-sm text-foreground/60">
          Add, edit, show or hide products on the website.
        </p>
      </header>
      <ProductsManager />
    </section>
  );
}
