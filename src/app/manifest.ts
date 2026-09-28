import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VESTRA — Haute Édition & Modern Silhouette",
    short_name: "VESTRA",
    description:
      "Haute tailoring, computational 3D drape kinematics, and calibrated skin-tone harmonic collections.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0B0E14",
    theme_color: "#0B0E14",
    categories: ["shopping", "lifestyle", "fashion"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Runway Shop",
        short_name: "Shop",
        description: "Browse all haute couture silhouettes",
        url: "/shop",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
      {
        name: "3D Try-On Studio",
        short_name: "Try-On",
        description: "Simulate volumetric garment drape physics",
        url: "/try-on",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
      {
        name: "Chromatic Style Advisor",
        short_name: "Advisor",
        description: "Calibrate pigment and undertone harmonies",
        url: "/style-advisor",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
      {
        name: "Shopping Bag",
        short_name: "Bag",
        description: "Review pending sartorial acquisitions",
        url: "/cart",
        icons: [{ src: "/icon", sizes: "192x192" }],
      },
    ],
  };
}
