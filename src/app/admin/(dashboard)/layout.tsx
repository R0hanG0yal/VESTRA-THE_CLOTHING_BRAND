import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { isSupabaseConfigured } from "@/lib/env";
import { IconImage } from "@/components/ui/icon-image";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login?from=/admin/products");

  return (
    <div className="relative z-10 bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6 text-left">
          <div className="border-l-2 border-foreground pl-4 text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/45 block">
              Admin Panel
            </span>
            <h1 className="mt-1 font-serif text-3xl font-light text-foreground text-left">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 border border-line bg-surface px-3 py-1.5 text-left">
            <IconImage name="authentic" alt="Status" className="h-4 w-4 object-cover grayscale" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/70">
              {isSupabaseConfigured ? "Database Connected" : "Demo Mode"}
            </span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 text-left">
          <aside className="text-left">
            <AdminNav />
          </aside>
          <div className="mt-8 min-w-0 lg:mt-0 text-left">{children}</div>
        </div>
      </div>
    </div>
  );
}
