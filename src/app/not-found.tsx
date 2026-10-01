import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";

export default function NotFound() {
  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 text-left">
      <div className="max-w-2xl border-l-2 border-foreground pl-8 sm:pl-12 text-left">
        <div className="flex items-center gap-3">
          <IconImage
            name="search"
            alt="Search"
            className="h-8 w-8 object-cover grayscale"
          />
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">
            Error 404 — Page Not Found
          </span>
        </div>

        <h1 className="mt-6 font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl text-left">
          Page Not Found
        </h1>

        <p className="mt-4 max-w-lg font-sans text-sm text-foreground/70 leading-relaxed text-left">
          The page or product you are looking for does not exist, has been removed, or the link is incorrect.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-left">
          <Link
            href="/"
            className="border border-foreground bg-foreground px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-foreground/90"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="border border-line bg-transparent px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:border-foreground"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
