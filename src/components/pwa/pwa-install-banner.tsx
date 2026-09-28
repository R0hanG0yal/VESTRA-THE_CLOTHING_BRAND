"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "desktop" | "ios">("android");
  const [platform, setPlatform] = useState<"android" | "desktop" | "ios">("desktop");

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

      // Detect OS
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setPlatform("ios");
        setActiveTab("ios");
      } else if (/android/.test(ua)) {
        setPlatform("android");
        setActiveTab("android");
      } else {
        setPlatform("desktop");
        setActiveTab("desktop");
      }

      // Check dismiss preference; if not dismissed and not standalone, show banner after 2.5s
      const isDismissed = sessionStorage.getItem("vestra_pwa_dismissed");
      if (!isDismissed && !isStandaloneMode) {
        const timer = setTimeout(() => {
          setBannerVisible(true);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 4. Global custom event to open download/install modal from any button
    const handleOpenModal = () => {
      setModalOpen(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("vestra_open_install_modal", handleOpenModal);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("vestra_open_install_modal", handleOpenModal);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        setBannerVisible(false);
        setModalOpen(false);
      }
    } else {
      // Open the comprehensive download modal if native prompt is not available
      setModalOpen(true);
    }
  };

  const handleDismissBanner = () => {
    setBannerVisible(false);
    sessionStorage.setItem("vestra_pwa_dismissed", "true");
  };

  return (
    <>
      {/* ═══ FLOATING INSTALL POPUP BANNER (AUTO-DISPLAY AFTER 2.5S) ═══ */}
      {bannerVisible && !isStandalone && (
        <aside
          aria-label="Install VESTRA Atelier App"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-[340px] sm:max-w-sm rounded-2xl bg-zinc-950/90 text-white dark:bg-white/95 dark:text-zinc-950 backdrop-blur-2xl border border-white/25 dark:border-zinc-300/40 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-left animate-fade-in transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/20 dark:border-zinc-300">
                <Image
                  src="/icons/icon-192.png"
                  alt="VESTRA App Icon"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wide">
                  Download VESTRA App
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-wider opacity-75">
                  Available for Android, iOS & Desktop
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="rounded-full p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss download prompt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="mt-2.5 font-sans text-xs opacity-80 leading-relaxed text-left">
            Experience ultra-fast loading, tactile 3D try-on, and offline bag access on your device.
          </p>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (deferredPrompt) {
                  handleInstallClick();
                } else {
                  setModalOpen(true);
                }
              }}
              className="flex-1 rounded-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white px-3.5 py-2 font-mono text-[11px] font-black uppercase tracking-wider transition-opacity hover:opacity-90 cursor-pointer text-center shadow-xs"
            >
              {deferredPrompt ? "Install App" : "Download Options"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-full border border-current px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Guide
            </button>
          </div>
        </aside>
      )}

      {/* ═══ FULL COMPREHENSIVE DOWNLOAD & INSTALL MODAL ═══ */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Download VESTRA Atelier App"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-zinc-950 text-white border border-white/20 p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-left max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/20">
                  <Image
                    src="/icons/icon-192.png"
                    alt="VESTRA Atelier Icon"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                    VESTRA Atelier App
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                    Official Application Suite · Version 1.0.0
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Platform Selection Tabs */}
            <div className="mt-5 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/10 border border-white/15 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("android")}
                className={`py-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  activeTab === "android"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("desktop")}
                className={`py-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  activeTab === "desktop"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Laptop / PC
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ios")}
                className={`py-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  activeTab === "ios"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Apple iOS
              </button>
            </div>

            {/* Tab 1: Android Package & PWA */}
            {activeTab === "android" && (
              <div className="mt-5 space-y-4 text-left">
                {/* Direct Android Package Download */}
                <div className="rounded-2xl bg-white/5 border border-white/15 p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-white">
                        Android Package (.apk)
                      </h4>
                      <p className="font-mono text-[10px] text-white/60">
                        Direct standalone installer for all Android devices
                      </p>
                    </div>
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Ready
                    </span>
                  </div>

                  <p className="mt-2 font-sans text-xs text-white/75 leading-relaxed">
                    Install the native Android package container directly on your phone with zero app store overhead.
                  </p>

                  <a
                    href="/downloads/vestra-atelier.apk"
                    download="vestra-atelier.apk"
                    className="mt-3.5 flex items-center justify-center gap-2 w-full rounded-full bg-white text-zinc-950 py-2.5 font-mono text-xs font-black uppercase tracking-wider hover:bg-white/90 transition-all text-center cursor-pointer shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Android Package (.apk)</span>
                  </a>
                </div>

                {/* Android Chrome PWA 1-Click Install */}
                <div className="rounded-2xl bg-white/5 border border-white/15 p-4 text-left">
                  <h4 className="font-serif text-sm font-semibold text-white">
                    Instant Browser App (PWA)
                  </h4>
                  <p className="font-mono text-[10px] text-white/60 mt-0.5">
                    Fast, auto-updating web app added directly to your home screen
                  </p>

                  {deferredPrompt ? (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="mt-3 w-full rounded-full border border-white/40 bg-white/10 hover:bg-white/20 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer text-center"
                    >
                      Install to Home Screen Now
                    </button>
                  ) : (
                    <div className="mt-3 space-y-1.5 font-sans text-xs text-white/80 bg-black/40 rounded-xl p-3 border border-white/10">
                      <p className="font-bold text-white font-mono text-[11px]">How to install in Chrome:</p>
                      <p>1. Tap the three dots <span className="font-bold text-white">⋮</span> in the top-right corner of Chrome.</p>
                      <p>2. Select <span className="font-bold text-white">&apos;Install app&apos;</span> or <span className="font-bold text-white">&apos;Add to Home screen&apos;</span>.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Desktop / Laptop */}
            {activeTab === "desktop" && (
              <div className="mt-5 space-y-4 text-left">
                <div className="rounded-2xl bg-white/5 border border-white/15 p-4 text-left">
                  <h4 className="font-serif text-sm font-semibold text-white">
                    Desktop PWA for Windows & Mac
                  </h4>
                  <p className="font-mono text-[10px] text-white/60 mt-0.5">
                    Runs in its own high-speed standalone window with desktop notifications
                  </p>

                  {deferredPrompt ? (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="mt-3.5 w-full rounded-full bg-white text-zinc-950 py-2.5 font-mono text-xs font-black uppercase tracking-wider hover:bg-white/90 transition text-center cursor-pointer shadow-md"
                    >
                      Install VESTRA Desktop App
                    </button>
                  ) : (
                    <div className="mt-3.5 space-y-2 font-sans text-xs text-white/80 bg-black/40 rounded-xl p-3.5 border border-white/10 text-left">
                      <p className="font-bold text-white font-mono text-[11px]">Installation Steps:</p>
                      <p className="flex items-start gap-2">
                        <span className="font-mono text-white/60">①</span>
                        <span>Look at the right side of your browser address bar (URL bar).</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="font-mono text-white/60">②</span>
                        <span>Click the <span className="font-bold text-white">&apos;Install&apos;</span> icon (monitor with down arrow or ⊕ symbol).</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="font-mono text-white/60">③</span>
                        <span>Or click browser menu <span className="font-bold text-white">⋮</span> &gt; <span className="font-bold text-white">&apos;Save and share&apos;</span> &gt; <span className="font-bold text-white">&apos;Install VESTRA Atelier&apos;</span>.</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Apple iOS */}
            {activeTab === "ios" && (
              <div className="mt-5 space-y-4 text-left">
                <div className="rounded-2xl bg-white/5 border border-white/15 p-4 text-left">
                  <h4 className="font-serif text-sm font-semibold text-white">
                    Install on iPhone & iPad
                  </h4>
                  <p className="font-mono text-[10px] text-white/60 mt-0.5">
                    Full-screen native iOS web application
                  </p>

                  <div className="mt-3.5 space-y-2.5 font-sans text-xs text-white/85 bg-black/40 rounded-xl p-3.5 border border-white/10 text-left">
                    <p className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 font-mono text-[11px] font-bold">1</span>
                      <span>Tap the <span className="font-bold text-white">Share</span> button at the bottom of Safari (square with up arrow).</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 font-mono text-[11px] font-bold">2</span>
                      <span>Scroll down and select <span className="font-bold text-white">&apos;Add to Home Screen&apos;</span>.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 font-mono text-[11px] font-bold">3</span>
                      <span>Tap <span className="font-bold text-white">&apos;Add&apos;</span> in top right corner. VESTRA will appear on your home screen.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Close */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-white/25 px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
