"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { useCart } from "@/providers/cart-provider";
import { useAuth } from "@/providers/auth-provider";
import { BRAND_NAME } from "@/lib/data/catalog";
import { IconImage } from "@/components/ui/icon-image";
import { cn } from "@/lib/utils";

const MENU_COLUMNS = [
  {
    title: "Highlights",
    code: "01",
    items: [
      { label: "Shop All Archive", href: "/shop" },
      { label: "New Release Drops", href: "/shop?sort=new" },
      { label: "Restocked Silhouettes", href: "/shop?sort=trending" },
      { label: "Shop The Lookbook", href: "/look/look-01" },
    ],
  },
  {
    title: "Topwear & Tailoring",
    code: "02",
    items: [
      { label: "Sculptural Jackets & Coats", href: "/category/jackets" },
      { label: "Tailored Shirts", href: "/category/shirts" },
      { label: "Atelier Hoodies", href: "/category/hoodies" },
      { label: "Fine Knitwear & Tops", href: "/category/tops" },
      { label: "Sculpted Dresses", href: "/category/dresses" },
    ],
  },
  {
    title: "Bottoms & Leather Goods",
    code: "03",
    items: [
      { label: "Pleated Trousers", href: "/category/trousers" },
      { label: "Raw Selvedge Denim", href: "/category/jeans" },
      { label: "Skirts & Tailored Shorts", href: "/category/skirts" },
      { label: "Calfskin Leather Bags", href: "/category/bags" },
      { label: "Timepieces & Horology", href: "/category/watches" },
    ],
  },
  {
    title: "Atelier Suite & Support",
    code: "04",
    items: [
      { label: "3D Virtual Fit Studio", href: "/try-on" },
      { label: "Chromatic Style Advisor", href: "/style-advisor" },
      { label: "Atelier Privilege Reserve", href: "/membership" },
      { label: "Download App (Android & Desktop)", href: "#download-app", isDownload: true },
      { label: "Refer & Earn (₹250 Credit)", href: "/refer" },
      { label: "Track Order & Returns", href: "/refund-policy" },
    ],
  },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isShopPage = pathname === "/shop" || pathname?.startsWith("/shop");
  const { count } = useCart();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("vestra_theme");
    const d = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme((t === "dark" || (!t && d)) ? "dark" : "light");

    const checkAppInstalled = () => {
      if (typeof window !== "undefined") {
        const ua = window.navigator.userAgent || "";
        const isStandalone =
          /VESTRA_Android_App/i.test(ua) ||
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
          localStorage.getItem("vestra_app_downloaded") === "true";
        setIsAppInstalled(Boolean(isStandalone));
      }
    };
    checkAppInstalled();
    window.addEventListener("vestra_app_status_changed", checkAppInstalled);
    return () => window.removeEventListener("vestra_app_status_changed", checkAppInstalled);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("vestra_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
      setMenuOpen(false);
    },
    [query, router],
  );

  return (
    <header
      ref={headerRef}
      className="fixed top-3 sm:top-5 inset-x-0 z-50 flex flex-col items-center px-2.5 sm:px-6 pointer-events-none transition-all duration-500"
    >
      {/* ═══ FLOATING PILL-SHAPED LIQUID GLASS NAVBAR ═══ */}
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-full px-4 sm:px-7 py-3 transition-all duration-500",
          "bg-white/20 dark:bg-white/[0.08] backdrop-blur-2xl border border-white/35 dark:border-white/18",
          "shadow-[0_10px_35px_rgba(0,0,0,0.2)]",
          (scrolled || menuOpen) && "bg-white/30 dark:bg-white/[0.12] shadow-[0_16px_45px_rgba(0,0,0,0.28)] border-white/45 dark:border-white/25",
        )}
      >
        {/* ── Left: Expanding Menu Trigger (3 lines only on mobile) + Wordmark ── */}
        <div className="flex items-center gap-2 sm:gap-4 text-left">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open expanded navigation menu"}
            aria-expanded={menuOpen}
            className={cn(
              "flex items-center gap-2 rounded-full p-2.5 sm:px-4 sm:py-2 transition-all duration-300 text-left cursor-pointer border",
              menuOpen
                ? "bg-white/70 hover:bg-white/80 dark:bg-white/25 dark:hover:bg-white/35 border-white/60 dark:border-white/35 text-zinc-950 dark:text-white shadow-sm"
                : "bg-white/40 hover:bg-white/60 dark:bg-white/[0.14] dark:hover:bg-white/[0.22] border-white/40 dark:border-white/25 text-zinc-950 dark:text-white font-black",
            )}
          >
            <span className="flex flex-col gap-1 w-4" aria-hidden="true">
              <span
                className={cn(
                  "h-[2px] w-full bg-zinc-950 dark:bg-white block transition-transform duration-300",
                  menuOpen && "rotate-45 translate-y-[6px]",
                )}
              />
              <span
                className={cn(
                  "h-[2px] w-full bg-zinc-950 dark:bg-white block transition-opacity duration-300",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-[2px] w-full bg-zinc-950 dark:bg-white block transition-transform duration-300",
                  menuOpen && "-rotate-45 -translate-y-[6px]",
                )}
              />
            </span>
            <span className="hidden sm:inline font-sans text-xs sm:text-[13px] tracking-[0.1em] text-left font-bold text-zinc-950 dark:text-white uppercase">
              {menuOpen ? "Close" : "Menu"}
            </span>
          </button>

          {/* Brand Name Text (Like Previous) */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-baseline gap-1 sm:gap-1.5 text-left ml-0.5"
            aria-label={`${BRAND_NAME} Home`}
          >
            <span
              className="font-serif italic text-base sm:text-2xl uppercase tracking-[0.12em] text-zinc-950 dark:text-white font-semibold transition-opacity group-hover:opacity-75 text-left whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              VESTRA
            </span>
            <span className="font-mono text-[9px] sm:text-[11px] tracking-[0.2em] text-zinc-800 dark:text-zinc-300 uppercase font-bold">
              Atelier
            </span>
          </Link>
        </div>

        {/* ── Center: Collections & Download App Pills ── */}
        <nav className="flex items-center gap-2 text-left">
          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            className="flex items-center rounded-full px-3 sm:px-3.5 py-1.5 bg-white/40 hover:bg-white/60 dark:bg-white/[0.14] dark:hover:bg-white/[0.22] border border-white/40 dark:border-white/25 text-xs sm:text-sm font-bold text-zinc-950 dark:text-white tracking-[0.1em] uppercase transition-all duration-300 shadow-xs"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span className="sm:hidden">Shop</span>
            <span className="hidden sm:inline">Collections</span>
          </Link>

        </nav>

        {/* ── Right Actions: Search (Top) + Bag (Desktop Only) ── */}
        <div className="flex items-center gap-2 sm:gap-4 text-left">
          {/* Expanding Minimalist Search Bar */}
          <form onSubmit={submit} role="search" className="relative flex items-center text-left">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search garments"
              maxLength={60}
              className="w-20 sm:w-32 focus:w-32 sm:focus:w-48 transition-all duration-300 rounded-full bg-white/40 dark:bg-white/[0.14] border border-white/45 dark:border-white/25 px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-zinc-950 dark:text-white font-black placeholder:text-zinc-800 dark:placeholder:text-zinc-200 outline-none focus:border-white/70 dark:focus:border-white/50 text-left shadow-xs"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </form>

          {/* Bag with Count — Hidden on mobile, shown on laptop & tablet */}
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            aria-label={`Shopping bag with ${count} items`}
            className="hidden sm:flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-2 bg-white/40 hover:bg-white/60 dark:bg-white/[0.14] dark:hover:bg-white/[0.22] border border-white/40 dark:border-white/25 text-zinc-950 dark:text-white font-black transition-all duration-300 text-left shadow-xs"
          >
            <span className="font-sans text-xs sm:text-[13px] tracking-[0.1em] text-left uppercase font-bold">
              Bag
            </span>
            <span className="font-sans text-xs sm:text-[13px] text-zinc-950 dark:text-white font-bold text-left">
              ({count})
            </span>
          </Link>
        </div>
      </div>

      {/* ── Mobile Floating Bag Button (for non-shop pages) ── */}
      {!isShopPage && (
        <Link
          href="/cart"
          onClick={() => setMenuOpen(false)}
          aria-label={`Shopping bag with ${count} items`}
          className="fixed bottom-5 right-4 z-40 sm:hidden pointer-events-auto flex items-center gap-1.5 rounded-full px-4 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-[0_12px_36px_rgba(0,0,0,0.4)] border border-white/30 active:scale-95 transition-all font-mono text-xs font-black"
        >
          <span className="font-sans text-xs uppercase tracking-wider font-bold">Bag</span>
          <span className="font-sans text-xs font-bold">({count})</span>
        </Link>
      )}

      {/* ═══ EXPANDING LIQUID GLASS MENU SECTION ═══ */}
      {menuOpen && (
        <div className="pointer-events-auto mt-2.5 w-full max-w-4xl rounded-3xl p-5 sm:p-8 bg-white/35 dark:bg-white/[0.1] backdrop-blur-2xl border border-white/40 dark:border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-fade-up text-left overflow-hidden transition-all duration-300 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* Header row inside expanding menu */}
          <div className="flex items-center justify-between border-b border-white/25 dark:border-white/15 pb-3 sm:pb-4 text-left">
            <span className="label-ui text-[11px] tracking-[0.2em] text-foreground font-bold text-left">
              Atelier Directory
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="label-ui text-[10px] text-foreground font-bold hover:underline transition-colors cursor-pointer text-left whitespace-nowrap"
            >
              [ Close Directory ]
            </button>
          </div>

          {/* 4-Column Directory Grid */}
          <div className="mt-5 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 text-left">
            {MENU_COLUMNS.map((col) => (
              <div key={col.title} className="text-left">
                <div className="flex items-center gap-2 text-left mb-3">
                  <span className="font-mono text-[9px] text-foreground/75 font-bold">{col.code}</span>
                  <h3 className="label-ui text-[10px] tracking-[0.2em] text-foreground font-bold text-left uppercase">
                    {col.title}
                  </h3>
                </div>
                <ul className="space-y-2 text-left">
                  {col.items
                    .filter((item) => !("isDownload" in item && item.isDownload && isAppInstalled))
                    .map((item) => (
                    <li key={item.label} className="text-left">
                      {"isDownload" in item && item.isDownload ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(new CustomEvent("vestra_open_install_modal"));
                            }
                          }}
                          className="group flex items-center gap-2 text-[13px] text-accent font-bold hover:underline transition-all text-left cursor-pointer"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          <span className="underline-offset-4">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="group flex items-center gap-2 text-[13px] text-foreground font-semibold hover:text-accent hover:translate-x-1 transition-all text-left"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          <span className="group-hover:underline underline-offset-4">{item.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Client Suite Action & Theme Toggle */}
          <div className="mt-8 pt-5 border-t border-white/20 dark:border-white/15 flex items-center justify-between text-left">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/30 hover:bg-white/45 dark:bg-white/15 dark:hover:bg-white/25 border border-white/35 dark:border-white/25 text-xs text-foreground font-bold label-ui tracking-wider transition-all text-left cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">

              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/30 hover:bg-white/45 dark:bg-white/15 dark:hover:bg-white/25 border border-white/35 dark:border-white/25 text-xs text-foreground font-bold label-ui tracking-wider transition-all text-left"
              >
                <span>{user ? "Client Suite" : "Client Sign In"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
