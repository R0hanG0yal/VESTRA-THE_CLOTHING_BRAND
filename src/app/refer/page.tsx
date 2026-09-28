import type { Metadata } from "next";
import { ReferClient } from "@/components/refer/refer-client";

export const metadata: Metadata = {
  title: "Refer & Earn",
  description: "Share your code, and you both get ₹250 in wallet cash.",
};

export default function ReferPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ReferClient />
    </div>
  );
}
