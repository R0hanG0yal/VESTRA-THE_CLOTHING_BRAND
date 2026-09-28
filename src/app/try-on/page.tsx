import type { Metadata } from "next";
import { Suspense } from "react";
import { TryOnStudio } from "@/components/try-on/try-on-studio";
import { IconImage } from "@/components/ui/icon-image";
import { getProduct } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Spatial Volumetric Try-On",
  description: "Virtual fitting protocol and volumetric drape simulation.",
};

export default async function TryOnPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;

  return (
    <>
      <section className="border-b border-line bg-surface text-left">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-left">
          <div className="flex items-center gap-3">
            <IconImage name="tryon" alt="Studio" className="h-6 w-6 object-cover grayscale" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
              Fitting Studio // Volumetric Simulation v4.2
            </span>
          </div>

          <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
            Spatial Silhouette Analysis.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-foreground/60 text-left font-sans">
            Calibrated real-time draping engine. Rotate the three-dimensional rendering to evaluate hem fall, shoulder structure, and optimal sizing metrics.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-left">
        <Suspense fallback={<div className="h-[70vh] border border-line bg-ink-900/5" />}>
          <TryOnStudio preselectedProduct={product ? getProduct(product) : undefined} />
        </Suspense>
      </div>
    </>
  );
}
