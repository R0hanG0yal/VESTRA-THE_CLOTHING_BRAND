import type { Metadata } from "next";
import { StyleAdvisor } from "@/components/style/style-advisor";
import { IconImage } from "@/components/ui/icon-image";

export const metadata: Metadata = {
  title: "Chromatic Complexion Advisor",
  description: "Curated chromatic harmonies calibrated to undertone metrics.",
};

export default async function StyleAdvisorPage({
  searchParams,
}: {
  searchParams: Promise<{ tone?: string }>;
}) {
  const { tone } = await searchParams;

  return (
    <>
      <section className="border-b border-line bg-surface text-left">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-left">
          <div className="flex items-center gap-3">
            <IconImage name="palette" alt="Chromatic" className="h-6 w-6 object-cover grayscale" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">
              Colorimetric Protocol // Undertone Alignment
            </span>
          </div>

          <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
            Chromatic Harmonies.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-foreground/60 text-left font-sans">
            Calibrate your textile wardrobe by skin undertone indices. Filter archive pieces by scientifically harmonious pigments and tonal resonances.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-left">
        <StyleAdvisor initialToneId={tone} />
      </div>
    </>
  );
}
