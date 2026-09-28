"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch(() => {
            // Ignore SW registration failure in unsupported environments
          });
      });
    }

    // 2. Check if already installed / running in standalone mode
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isStandaloneMode));

      // Check iOS user agent
      const ua = window.navigator.userAgent;
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
      setIsIOS(isIOSDevice);

      // Check dismiss preference
      const isDismissed = sessionStorage.getItem("vestra_pwa_dismissed");
      if (isDismissed) setDismissed(true);
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("vestra_pwa_dismissed", "true");
  };

  // Do not display if already installed, dismissed, or prompt not available (unless on iOS)
  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  // On iOS, only show if not standalone and prompt is relevant
  if (isIOS && !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Install VESTRA Atelier Web App"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/20 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-left animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 font-serif text-lg font-bold text-white">
            V
          </div>
          <div>
            <h4 className="font-serif text-sm font-medium text-white">
              Install VESTRA Atelier
            </h4>
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
              Desktop & Mobile App Edition
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss installation prompt"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="mt-3 font-serif text-xs italic text-white/75 leading-relaxed">
        Experience ultra-low latency, tactile 3D try-on rendering, and instant bag access offline.
      </p>

      <div className="mt-4 flex items-center gap-2">
        {deferredPrompt ? (
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-full bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-white/90 cursor-pointer text-center"
          >
            Install Web App
          </button>
        ) : (
          <div className="font-mono text-[10px] text-white/70">
            Tap <span className="font-bold text-white">Share</span> then <span className="font-bold text-white">&apos;Add to Home Screen&apos;</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-white/20 bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-white/70 hover:text-white transition cursor-pointer"
        >
          Later
        </button>
      </div>
    </aside>
  );
}
