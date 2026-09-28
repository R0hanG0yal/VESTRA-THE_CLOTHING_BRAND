"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { getProduct } from "@/lib/data/catalog";
import { IconImage } from "@/components/ui/icon-image";

export function AddLookButton({ productIds }: { productIds: string[] }) {
  const { add } = useCart();
  const { push } = useToast();
  const router = useRouter();

  function addAll(go: boolean) {
    let added = 0;
    productIds.forEach((id) => {
      const p = getProduct(id);
      if (!p) return;
      add({
        productId: p.id,
        name: p.name,
        price: p.price,
        mrp: p.mrp,
        size: p.sizes[Math.min(2, p.sizes.length - 1)],
        color: p.colors[0].name,
        colorHex: p.colors[0].hex,
        kind: p.kind,
        seed: p.seed,
        image: p.image,
      });
      added++;
    });
    push({ title: "Look ensemble added", description: `${added} pieces cataloged to bag`, variant: "success" });
    if (go) router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row text-left">
      <button
        onClick={() => addAll(false)}
        className="inline-flex flex-1 items-center justify-start gap-3 border border-foreground bg-transparent px-5 py-4 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
      >
        <IconImage name="bag" alt="Add ensemble" className="h-5 w-5 object-cover grayscale" />
        <span>Add All {productIds.length} Pieces</span>
      </button>
      <button
        onClick={() => addAll(true)}
        className="inline-flex flex-1 items-center justify-start gap-3 border border-foreground bg-foreground px-5 py-4 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-foreground/90"
      >
        <IconImage name="sparkles" alt="Purchase" className="h-5 w-5 object-cover grayscale invert" />
        <span>Instant Checkout Edit</span>
      </button>
    </div>
  );
}
