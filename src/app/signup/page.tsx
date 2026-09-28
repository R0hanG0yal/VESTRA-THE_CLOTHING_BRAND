import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="skeleton mx-auto h-[560px] max-w-5xl rounded-4xl" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
