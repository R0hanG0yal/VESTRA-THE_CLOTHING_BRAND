"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { IconImage } from "@/components/ui/icon-image";
import { cn } from "@/lib/utils";

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface AccordionSection {
  title: string;
  items: Array<{ label: string; href: string }>;
}

const ACCORDIONS: AccordionSection[] = [
  {
    title: "Topwear & Tailoring",
    items: [
      { label: "Jackets & Blazers", href: "/category/jackets" },
      { label: "Tailored Shirts", href: "/category/shirts" },
      { label: "Atelier Hoodies", href: "/category/hoodies" },
      { label: "Fine Knitwear & Tops", href: "/category/tops" },
      { label: "Sculpted Dresses", href: "/category/dresses" },
    ],
  },
  {
    title: "Bottomwear",
    items: [
      { label: "Tailored Trousers", href: "/category/trousers" },
      { label: "Selvedge Denim", href: "/category/jeans" },
      { label: "Sculptural Skirts", href: "/category/skirts" },
      { label: "Tailored Shorts", href: "/category/shorts" },
    ],
  },
  {
    title: "Winterwear",
    items: [
      { label: "Wool Overcoats", href: "/category/jackets" },
      { label: "Heavy Fleece Hoodies", href: "/category/hoodies" },
      { label: "Layering Sweaters", href: "/category/tops" },
    ],
  },
  {
    title: "Leather & Horology",
    items: [
      { label: "Calfskin Leather Bags", href: "/category/bags" },
      { label: "Timepieces & Horology", href: "/category/watches" },
      { label: "Handcrafted Eyewear", href: "/category/eyewear" },
      { label: "Fine Jewellery", href: "/category/jewellery" },
      { label: "Hand-Welted Footwear", href: "/category/footwear" },
    ],
  },
];

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const toggleAccordion = (title: string) => {
    setExpanded((prev) => (prev === title ? null : title));
  };

  return (
    <div className="fixed inset-0 z-[100] flex text-left" role="dialog" aria-modal="true">
      {/* ── Backdrop Overlay with Liquid Blur ── */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Slide-Out Drawer Panel ── */}
      <aside
        className="relative z-10 flex h-full w-[320px] sm:w-[380px] max-w-[88vw] flex-col justify-between overflow-y-auto bg-[#0A0D14]/98 backdrop-blur-2xl border-r border-white/10 text-white shadow-2xl transition-transform duration-300 animate-slide-right text-left"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 text-left">
          <h2
            className="text-xl font-normal tracking-wide text-white text-left"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Menu
          </h2>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors text-left"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 text-left">
          {/* Primary Quick Links */}
          <div className="space-y-1 pb-3 border-b border-white/10 text-left">
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center py-2.5 text-[15px] font-medium text-white/90 hover:text-white transition-colors text-left"
            >
              Shop all
            </Link>
            <Link
              href="/shop?sort=new"
              onClick={onClose}
              className="flex items-center py-2.5 text-[15px] font-medium text-white/90 hover:text-white transition-colors text-left"
            >
              New Release
            </Link>
            <Link
              href="/shop?sort=trending"
              onClick={onClose}
              className="flex items-center py-2.5 text-[15px] font-medium text-white/90 hover:text-white transition-colors text-left"
            >
              Restocked
            </Link>
            <Link
              href="/look/look-01"
              onClick={onClose}
              className="flex items-center py-2.5 text-[15px] font-medium text-white/90 hover:text-white transition-colors text-left"
            >
              Shop The Look
            </Link>
          </div>

          {/* Expandable Category Accordions */}
          <div className="py-2 space-y-1 text-left">
            {ACCORDIONS.map((acc) => {
              const isExpanded = expanded === acc.title;
              return (
                <div key={acc.title} className="border-b border-white/5 last:border-b-0 text-left">
                  <button
                    onClick={() => toggleAccordion(acc.title)}
                    className="flex w-full items-center justify-between py-3 text-[15px] font-medium text-white/90 hover:text-white transition-colors text-left"
                    aria-expanded={isExpanded}
                  >
                    <span>{acc.title}</span>
                    <span
                      className={cn(
                        "text-xs text-white/50 transition-transform duration-200",
                        isExpanded ? "rotate-180 text-white" : "rotate-0",
                      )}
                    >
                      ▼
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pl-4 pb-3 space-y-2 animate-fade-up text-left">
                      {acc.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={onClose}
                          className="block py-1 text-sm text-white/60 hover:text-white transition-colors text-left"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Standalone Categories */}
          <div className="py-2 border-t border-white/10 space-y-1 text-left">
            <Link
              href="/category/jackets"
              onClick={onClose}
              className="block py-2.5 text-[15px] font-medium text-white/90 hover:text-white transition-colors text-left"
            >
              Tailored Suits & Blazers
            </Link>
            <Link
              href="/category/trousers"
              onClick={onClose}
              className="block py-2.5 text-[15px] font-medium text-white/90 hover:text-white transition-colors text-left"
            >
              Pleated Trousers
            </Link>
          </div>

          {/* Atelier Services & Tools */}
          <div className="py-3 border-t border-white/10 space-y-1 text-left">
            <span className="label-ui text-[9px] tracking-[0.2em] text-white/40 block pb-1 text-left">
              Atelier Suite
            </span>
            <Link
              href="/try-on"
              onClick={onClose}
              className="flex items-center gap-2.5 py-2 text-sm text-white/80 hover:text-white transition-colors text-left"
            >
              <IconImage type="tryon" size={13} className="grayscale opacity-70" />
              <span>3D Virtual Fitting Studio</span>
            </Link>
            <Link
              href="/style-advisor"
              onClick={onClose}
              className="flex items-center gap-2.5 py-2 text-sm text-white/80 hover:text-white transition-colors text-left"
            >
              <IconImage type="palette" size={13} className="grayscale opacity-70" />
              <span>Chromatic Style Advisor</span>
            </Link>
            <Link
              href="/membership"
              onClick={onClose}
              className="flex items-center gap-2.5 py-2 text-sm text-white/80 hover:text-white transition-colors text-left"
            >
              <IconImage type="authentic" size={13} className="grayscale opacity-70" />
              <span>Atelier Membership</span>
            </Link>
            <Link
              href="/refer"
              onClick={onClose}
              className="flex items-center gap-2.5 py-2 text-sm text-white/80 hover:text-white transition-colors text-left"
            >
              <IconImage type="gift" size={13} className="grayscale opacity-70" />
              <span>Refer & Earn (₹250 Credit)</span>
            </Link>
          </div>

          {/* Order & Policy Links */}
          <div className="py-3 border-t border-white/10 space-y-1 text-left">
            <Link
              href="/account"
              onClick={onClose}
              className="block py-1.5 text-xs text-white/60 hover:text-white transition-colors text-left"
            >
              Track Your Order
            </Link>
            <Link
              href="/refund-policy"
              onClick={onClose}
              className="block py-1.5 text-xs text-white/60 hover:text-white transition-colors text-left"
            >
              Exchange Your Order & Returns
            </Link>
            <Link
              href="/terms"
              onClick={onClose}
              className="block py-1.5 text-xs text-white/40 hover:text-white transition-colors text-left"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

        {/* Drawer Footer: Log In / Account */}
        <div className="border-t border-white/10 bg-white/[0.02] p-5 text-left">
          <Link
            href="/account"
            onClick={onClose}
            className="flex items-center gap-3 py-1 text-sm font-medium text-white hover:text-white/80 transition-colors text-left"
          >
            <IconImage type="user" size={16} className="grayscale opacity-80" />
            <span>{user ? `Client Suite (${user.email})` : "Log in"}</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
