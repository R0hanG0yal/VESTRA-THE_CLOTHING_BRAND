import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { PwaInstallBanner } from "@/components/pwa/pwa-install-banner";
import {
  BRAND_LEGAL_NAME,
  BRAND_NAME,
  SITE_URL,
} from "@/lib/env-public";

/* DM Sans — Body text, buttons, navigation, UI labels */
const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Cormorant Garamond — All headings, hero text, brand wordmark */
const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} — Atelier Editorial Fashion & Volumetric Silhouettes`,
    template: `%s · ${BRAND_NAME} Atelier`,
  },
  description:
    "Haute tailoring, computational 3D drape kinematics, and calibrated skin-tone harmonic collections. Handcrafted sartorial architecture by VESTRA Atelier.",
  applicationName: BRAND_NAME,
  authors: [{ name: BRAND_LEGAL_NAME, url: SITE_URL }],
  creator: BRAND_LEGAL_NAME,
  publisher: BRAND_LEGAL_NAME,
  keywords: [
    "haute couture",
    "business clothing",
    "tailored blazers",
    "editorial fashion",
    "3d virtual try-on",
    "colorimetric advisor",
    "vestra atelier",
    "sustainable tailoring",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND_NAME,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: `${BRAND_NAME} Atelier`,
    title: `${BRAND_NAME} — Haute Édition & Modern Silhouette`,
    description:
      "Engineered business tailoring and tactile garments. Spatial fitting calibration and skin-tone spectral harmonic advisement.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Haute Édition & Modern Silhouette`,
    description:
      "Engineered business tailoring and tactile garments. Spatial fitting calibration and skin-tone spectral harmonic advisement.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F2EE" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1D24" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const themeScript = `(function(){try{var t=localStorage.getItem('vestra_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="relative flex min-h-full flex-col bg-background text-foreground text-left selection:bg-foreground selection:text-background overflow-x-hidden"
      >
        {/* ═══ ATMOSPHERIC LIQUID GLASS LIGHTING (Radial glowing corner gradients) ═══ */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Top-Right Glowing Radial Gradient (Frosted Sage & Luminous Azure) */}
          <div
            className="absolute -top-[20%] -right-[15%] h-[750px] w-[750px] rounded-full opacity-65 dark:opacity-40 animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(143, 166, 151, 0.45) 0%, rgba(90, 112, 148, 0.25) 40%, transparent 70%)",
              filter: "blur(120px)",
              transform: "translate3d(0, 0, 0)",
            }}
          />
          {/* Bottom-Left Glowing Radial Gradient (Deep Midnight Indigo & Warm Amber Slub) */}
          <div
            className="absolute -bottom-[20%] -left-[15%] h-[850px] w-[850px] rounded-full opacity-60 dark:opacity-35 animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(90, 112, 148, 0.4) 0%, rgba(179, 110, 89, 0.18) 45%, transparent 70%)",
              filter: "blur(140px)",
              animationDelay: "-3s",
              transform: "translate3d(0, 0, 0)",
            }}
          />
          {/* Center-Mid Ambient Refraction Sheen */}
          <div
            className="absolute top-[40%] left-[30%] h-[600px] w-[600px] rounded-full opacity-35 dark:opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(143, 166, 151, 0.25) 0%, transparent 65%)",
              filter: "blur(150px)",
            }}
          />
        </div>

        {/* Accessible Skip Landmark */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:border focus:border-foreground focus:bg-foreground focus:px-4 focus:py-2.5 focus:font-mono focus:text-xs focus:text-background"
        >
          Skip to main editorial content
        </a>

        <Providers>
          <div className="relative z-10 flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1 pt-24 sm:pt-28 outline-none" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
            <CookieBanner />
            <PwaInstallBanner />
          </div>
        </Providers>
      </body>
    </html>
  );
}
