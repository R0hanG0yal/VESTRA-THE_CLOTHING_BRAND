"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
      { label: "3D Virtual Fit Studio", href: "/try-on", icon: "tryon" as const },
      { label: "Chromatic Style Advisor", href: "/style-advisor", icon: "palette" as const },
      { label: "Atelier Privilege Reserve", href: "/membership", icon: "authentic" as const },
      { label: "Refer & Earn (₹250 Credit)", href: "/refer", icon: "gift" as const },
      { label: "Track Order & Returns", href: "/refund-policy", icon: "return" as const },
    ],
  },
];

export function SiteHeader() {
  const router = useRouter();
  const { count } = useCart();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("vestra_theme");
    const d = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme((t === "dark" || (!t && d)) ? "dark" : "light");
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
          "pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-full px-3 sm:px-7 py-2 sm:py-3 transition-all duration-500",
          "bg-white/20 dark:bg-white/[0.08] backdrop-blur-2xl border border-white/35 dark:border-white/18",
          "shadow-[0_10px_35px_rgba(0,0,0,0.2)]",
          (scrolled || menuOpen) && "bg-white/30 dark:bg-white/[0.12] shadow-[0_16px_45px_rgba(0,0,0,0.28)] border-white/45 dark:border-white/25",
        )}
      >
        {/* ── Left: Expanding Menu Trigger + Minimalist Logo ── */}
        <div className="flex items-center gap-2 sm:gap-4 text-left">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open expanded navigation menu"}
            aria-expanded={menuOpen}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1.5 transition-all duration-300 text-left cursor-pointer border",
              menuOpen
                ? "bg-foreground text-background border-foreground font-bold shadow-sm"
                : "bg-white/25 hover:bg-white/40 dark:bg-white/[0.1] dark:hover:bg-white/[0.18] border-white/30 dark:border-white/20 text-foreground font-semibold",
            )}
          >
            <span className="flex flex-col gap-1 w-3.5" aria-hidden="true">
              <span
                className={cn(
                  "h-[1.5px] w-full bg-current block transition-transform duration-300",
                  menuOpen && "rotate-45 translate-y-[5.5px]",
                )}
              />
              <span
                className={cn(
                  "h-[1.5px] w-full bg-current block transition-opacity duration-300",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-[1.5px] w-full bg-current block transition-transform duration-300",
                  menuOpen && "-rotate-45 -translate-y-[5.5px]",
                )}
              />
            </span>
            <span className="label-ui text-[10px] sm:text-[11px] tracking-[0.15em] text-left">
              {menuOpen ? "Close" : "Menu"}
            </span>
          </button>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center text-left"
            aria-label={`${BRAND_NAME} Home`}
          >
            {/* The mix-blend modes and invert automatically remove the white background in both light and dark modes! */}
            <img
              src="/logo.jpg"
              alt="VESTRA Atelier"
              className="h-7 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-75 mix-blend-multiply dark:invert dark:mix-blend-screen"
            />
          </Link>
        </div>

        {/* ── Center: Collections Link ── */}
        <nav className="hidden sm:flex items-center text-left">
          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            className="label-ui text-[11px] sm:text-xs tracking-[0.2em] text-foreground hover:text-accent font-bold transition-colors px-3 py-1 text-left"
          >
            Collections
          </Link>
        </nav>

        {/* ── Right Actions: Search + Bag ── */}
        <div className="flex items-center gap-1.5 sm:gap-3.5 text-left">
          {/* Expanding Minimalist Search Bar */}
          <form onSubmit={submit} role="search" className="relative flex items-center text-left">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search garments"
              maxLength={60}
              className="w-14 sm:w-28 focus:w-24 sm:focus:w-44 transition-all duration-300 rounded-full bg-white/25 dark:bg-white/[0.08] border border-white/35 dark:border-white/20 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs text-foreground font-semibold placeholder:text-foreground/60 outline-none focus:border-white/60 dark:focus:border-white/50 text-left"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </form>

          {/* Simple Bag with Count */}
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            aria-label={`Shopping bag with ${count} items`}
            className="flex items-center gap-1 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1.5 bg-white/25 hover:bg-white/40 dark:bg-white/[0.1] dark:hover:bg-white/[0.18] border border-white/30 dark:border-white/20 text-foreground font-semibold transition-all duration-300 text-left"
          >
            <IconImage type="order" size={13} className="border-none grayscale opacity-90" />
            <span className="label-ui text-[10px] sm:text-[11px] tracking-[0.15em] text-left">Bag</span>
            <span className="font-mono text-[10px] text-foreground font-bold text-left">
              ({count})
            </span>
          </Link>
        </div>
      </div>

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
                  {col.items.map((item) => (
                    <li key={item.label} className="text-left">
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-2 text-[13px] text-foreground font-semibold hover:text-accent hover:translate-x-1 transition-all text-left"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {"icon" in item && item.icon && (
                          <IconImage type={item.icon} size={12} className="grayscale opacity-80 group-hover:opacity-100" />
                        )}
                        <span className="group-hover:underline underline-offset-4">{item.label}</span>
                      </Link>
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

            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/30 hover:bg-white/45 dark:bg-white/15 dark:hover:bg-white/25 border border-white/35 dark:border-white/25 text-xs text-foreground font-bold label-ui tracking-wider transition-all text-left"
            >
              <IconImage type="user" size={12} className="grayscale opacity-90" />
              <span>{user ? "Client Suite" : "Client Sign In"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
