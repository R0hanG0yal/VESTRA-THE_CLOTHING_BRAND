"use client";

import { IconImage } from "@/components/ui/icon-image";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-none border border-foreground/15 bg-surface px-2 py-0.5 text-left text-[11px] font-mono tracking-wider text-foreground",
        className,
      )}
      aria-label={`Rated ${value} out of 5`}
    >
      <IconImage type="rating" size={12} className="border-none" />
      <span className="font-semibold text-left">{value.toFixed(1)}</span>
      <span className="text-[9px] uppercase tracking-widest text-foreground/45">/ 5.0</span>
      {typeof count === "number" && (
        <span className="text-[10px] text-foreground/40 text-left">({count.toLocaleString("en-IN")})</span>
      )}
    </span>
  );
}
