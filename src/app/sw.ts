// @ts-nocheck
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "@serwist/precaching";
import { Serwist, NetworkOnly } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

// Filter out the generic /api/ cache rule and admin routes from defaultCache.
// Admin API calls must NEVER be cached — they depend on live auth cookies.
const filteredCache = defaultCache.filter((entry) => {
  // Remove the rule that matches /api/ paths (it caches admin 401s)
  const matcherStr = String(entry.matcher);
  return !matcherStr.includes("startsWith(\"/api/\"");
});

// Add a network-only rule for all admin routes (no caching at all)
const adminNetworkOnly = {
  matcher: ({ url }: { url: URL }) =>
    url.pathname.startsWith("/api/admin") || url.pathname.startsWith("/admin"),
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [adminNetworkOnly, ...filteredCache],
});

serwist.addEventListeners();
