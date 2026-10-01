import type { Metadata, Viewport } from "next";
import { DM_Sans, Cinzel } from "next/font/google";
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

/* DM Sans — Unified across all headings, body, buttons, navigation, UI labels */
const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Cinzel — The world's most prestigious Roman luxury typeface.
   Chiseled classical proportions inspired by 1st century Roman inscriptions.
   Used by premier luxury Maisons, haute horlogerie, and fine jewelry houses. */
const brandFont = Cinzel({
  variable: "--font-brand-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} — Atelier Editorial Fashion & Volumetric Silhouettes`,
    template: `%s · ${BRAND_NAME} Atelier`,
  },
  description:
    "Premium fashion brand with 3D virtual try-on, colour advice, and great discounts. Shop jackets, shirts, dresses, jeans, and more.",
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
      "Premium clothing brand with virtual try-on and personalised style advice. Shop online and get fast delivery across India.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Haute Édition & Modern Silhouette`,
    description:
      "Premium clothing brand with virtual try-on and personalised style advice. Shop online and get fast delivery across India.",
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
      className={`${bodyFont.variable} ${brandFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="relative flex min-h-full flex-col bg-background text-foreground text-left selection:bg-foreground selection:text-background overflow-x-hidden"
      >
        <Providers>
          <div className="relative z-10 flex min-h-screen flex-col bg-background">
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
