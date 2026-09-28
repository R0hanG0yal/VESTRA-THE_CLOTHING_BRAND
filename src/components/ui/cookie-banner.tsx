"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = "vestra_cookie_consent_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Delay slightly for smooth page presentation
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }

    // Listen for manual trigger from footer "Cookie Preferences" link
    const handleReopen = () => {
      setVisible(true);
      setCustomize(true);
    };
    window.addEventListener("vestra_open_cookie_preferences", handleReopen);
    return () => window.removeEventListener("vestra_open_cookie_preferences", handleReopen);
  }, []);

  function savePreferences(prefs: CookiePreferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("vestra_consent_updated", { detail: prefs }));
    setVisible(false);
    setCustomize(false);
  }

  function handleAcceptAll() {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    });
  }

  function handleNecessaryOnly() {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      timestamp: new Date().toISOString(),
    });
  }

  function handleSaveCustom() {
    savePreferences({
      necessary: true,
      functional,
      analytics,
      timestamp: new Date().toISOString(),
    });
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Telemetry Consent Notice"
      className="fixed bottom-0 inset-x-0 z-[150] border-t-2 border-foreground bg-surface p-6 sm:p-8 shadow-none text-left"
    >
      <div className="mx-auto max-w-7xl text-left">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-left">
          <div className="max-w-3xl text-left">
            <div className="flex items-center gap-2 mb-2 text-left">
              <IconImage type="shield" alt="Consent" className="h-4 w-4 object-cover grayscale" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/50">
                Statutory Notice // DPDP Act 2023 Consent Protocol
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground text-left">
              Patron Telemetry & Storage Preferences
            </h2>

            <p className="mt-2 font-sans text-xs text-foreground/70 leading-relaxed max-w-2xl text-left">
              VESTRA deploys strictly necessary storage tokens to maintain your bag and secure UPI sessions. Optional analytical telemetry helps calibrate catalog performance. Review our{" "}
              <Link href="/cookies" className="underline text-foreground">Cookie Protocol</Link> and{" "}
              <Link href="/privacy" className="underline text-foreground">Privacy Charter</Link>.
            </p>

            {customize && (
              <div className="mt-6 border-t border-line pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-left">
                <div className="border border-line bg-surface-muted/30 p-4 text-left">
                  <div className="flex items-center justify-between text-left">
                    <span className="font-semibold text-foreground uppercase tracking-wider">Strictly Necessary</span>
                    <span className="text-[10px] text-foreground/50 border border-foreground/30 px-1 py-0.5">[MANDATORY]</span>
                  </div>
                  <p className="font-sans text-[11px] text-foreground/60 mt-1">Required for authentication, security nonces, and checkout.</p>
                </div>

                <label className="border border-line bg-surface-muted/30 p-4 text-left cursor-pointer hover:border-foreground">
                  <div className="flex items-center justify-between text-left">
                    <span className="font-semibold text-foreground uppercase tracking-wider">Functional Modes</span>
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <p className="font-sans text-[11px] text-foreground/60 mt-1">Preserves midnight/daylight spectral palette preferences.</p>
                </label>

                <label className="border border-line bg-surface-muted/30 p-4 text-left cursor-pointer hover:border-foreground">
                  <div className="flex items-center justify-between text-left">
                    <span className="font-semibold text-foreground uppercase tracking-wider">Anonymized Telemetry</span>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <p className="font-sans text-[11px] text-foreground/60 mt-1">Anonymous catalog drop engagement (zero ad cookies).</p>
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 text-left">
            {customize ? (
              <button
                onClick={handleSaveCustom}
                className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
              >
                [Save Configured Preferences]
              </button>
            ) : (
              <>
                <button
                  onClick={() => setCustomize(true)}
                  className="border border-line bg-transparent px-5 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-foreground transition-colors"
                >
                  Configure
                </button>
                <button
                  onClick={handleNecessaryOnly}
                  className="border border-line bg-transparent px-5 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-foreground transition-colors"
                >
                  Necessary Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-foreground/90 transition-colors"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
