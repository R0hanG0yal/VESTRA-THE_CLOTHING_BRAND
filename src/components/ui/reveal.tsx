"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial scroll reveal: IO-triggered, spring-eased rise with optional
 * stagger across direct children. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Base delay (ms) before the transition starts. */
  delay?: number;
  /** Incremental delay per direct child (ms) for cascade effects. */
  stagger?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = (i: number) =>
    ({
      opacity: shown ? 1 : 0,
      transform: shown ? "none" : "translateY(24px)",
      transition: `opacity 0.7s var(--ease-out-apple) ${delay + i * stagger}ms, transform 0.7s var(--ease-spring) ${delay + i * stagger}ms`,
      willChange: "opacity, transform",
    }) as React.CSSProperties;

  if (stagger > 0) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Tag ref={ref as any} className={className}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(Array.isArray(children) ? children : [children]).map((child: any, i: number) => (
          <div key={i} style={style(i)} className="contents">
            {child}
          </div>
        ))}
      </Tag>
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={cn(className)} style={style(0)}>
      {children}
    </Tag>
  );
}
