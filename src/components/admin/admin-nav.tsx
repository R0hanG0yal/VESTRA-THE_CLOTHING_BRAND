"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconImage } from "@/components/ui/icon-image";

const LINKS = [
  { href: "/admin", label: "Overview Ledger", iconName: "sparkles" as const },
  { href: "/admin/products", label: "Garment Catalog", iconName: "bag" as const },
  { href: "/admin/coupons", label: "Voucher Codes", iconName: "gift" as const },
  { href: "/admin/orders", label: "Fulfillment Queue", iconName: "delivery" as const },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0 text-left border border-line bg-surface p-2 divide-y divide-line lg:divide-y-0">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors text-left",
              active
                ? "bg-foreground text-background font-semibold"
                : "text-foreground/70 hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <IconImage
              name={link.iconName}
              alt={link.label}
              className={cn("h-4 w-4 object-cover grayscale", active && "invert")}
            />
            <span>{link.label}</span>
          </Link>
        );
      })}

      <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0 lg:mt-4 lg:flex-col lg:items-stretch lg:border-t lg:border-line lg:pt-3 text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground hover:bg-surface-muted transition-colors text-left"
        >
          <IconImage name="arrow" alt="Storefront" className="h-4 w-4 object-cover grayscale" />
          <span>Exit to Store</span>
        </Link>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="inline-flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider text-rose-600 hover:bg-rose-500/5 transition-colors disabled:opacity-50 text-left"
        >
          <IconImage name="close" alt="Sign out" className="h-4 w-4 object-cover grayscale" />
          <span>{loggingOut ? "Concluding..." : "Log Out"}</span>
        </button>
      </div>
    </nav>
  );
}
