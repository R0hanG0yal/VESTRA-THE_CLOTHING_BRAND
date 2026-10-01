"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconImage } from "@/components/ui/icon-image";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastCtx {
  push: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2500);
  }, []);

  const dismiss = useCallback(
    (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)),
    [],
  );

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed top-20 sm:top-24 right-2 sm:right-6 z-[200] flex w-full max-w-sm flex-col items-end gap-2 px-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cn(
              "pointer-events-auto flex w-full animate-pop items-start gap-3 rounded-xl border border-line bg-surface/95 backdrop-blur-xl p-3.5 shadow-lg text-left",
              t.variant === "success" && "border-l-4 border-l-foreground",
              t.variant === "error" && "border-l-4 border-l-rose-600",
              t.variant === "info" && "border-l-4 border-l-foreground/60",
            )}
          >
            <div className="shrink-0 pt-0.5">
              <IconImage
                name={t.variant === "success" ? "check" : t.variant === "error" ? "close" : "sparkles"}
                alt={t.variant}
                className="h-6 w-6 object-cover grayscale"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-semibold text-foreground text-left">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-foreground/60 text-left">
                  {t.description}
                </p>
              )}
              {t.variant === "success" && t.title.toLowerCase().includes("bag") && (
                <Link
                  href="/cart"
                  onClick={() => dismiss(t.id)}
                  className="mt-1.5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-foreground font-bold hover:underline"
                >
                  Go to Bag →
                </Link>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-foreground/40 hover:text-foreground transition-colors p-1"
            >
              [X]
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
