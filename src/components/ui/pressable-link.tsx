"use client";

import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Magnetic CTA — pointer-tracked parallax + iOS spring release. Degrades to a
 * normal Link on touch (no hover) since :active press still applies via CSS.
 */
export function PressableLink({
  href,
  children,
  className,
  strength = 0.35,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Max pointer-follow offset in px. */
  strength?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  function onMove(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }

  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("pressable inline-flex will-change-transform", className)}
    >
      {children}
    </Link>
  );
}
