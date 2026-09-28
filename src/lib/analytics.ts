"use client";

/**
 * Privacy-preserving, DPDP Act-compliant local analytics.
 * Only fires if user has granted explicit cookie consent.
 * Zero external scripts, zero third-party cookies, zero PII transmission.
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
}

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("vestra_cookie_consent_v1");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.analytics);
  } catch {
    return false;
  }
}

export function trackEvent(event: string, properties?: Record<string, string | number | boolean>) {
  if (!hasAnalyticsConsent()) return;

  const payload: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Log in development and dispatch to internal audit stream
  if (process.env.NODE_ENV !== "production") {
    // console.info("[Atelier Telemetry // Opt-In]", payload);
  }

  // Dispatch custom event for extensible server telemetry if configured
  window.dispatchEvent(new CustomEvent("vestra_telemetry", { detail: payload }));
}

export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}
