"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconImage, type IconImageType } from "@/components/ui/icon-image";
import { cn } from "@/lib/utils";

const ITEMS: Array<{ href: string; label: string; iconType: IconImageType }> = [
  { href: "/", label: "Index", iconType: "authentic" },
  { href: "/shop", label: "Pieces", iconType: "filter" },
  { href: "/try-on", label: "Studio", iconType: "tryon" },
  { href: "/wallet", label: "Wallet", iconType: "wallet" },
  { href: "/account", label: "Suite", iconType: "user" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="liquid-glass fixed inset-x-0 bottom-0 z-50 border-t border-foreground/15 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center px-1 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-left">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-start px-2 py-1 text-left transition-colors",
                active
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-foreground/60 hover:text-foreground",
              )}
            >
              <IconImage
                type={item.iconType}
                size={18}
                className={cn(active ? "ring-1 ring-foreground" : "opacity-75")}
              />
              <span className="mt-1 text-left font-mono text-[9px] uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
