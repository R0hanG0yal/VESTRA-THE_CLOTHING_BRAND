import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="skeleton mx-auto h-[520px] max-w-5xl rounded-4xl" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
