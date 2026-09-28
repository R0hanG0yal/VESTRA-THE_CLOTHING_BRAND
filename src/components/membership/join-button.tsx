"use client";

import { useRouter } from "next/navigation";
import { IconImage } from "@/components/ui/icon-image";
import { useMembership, MEMBERSHIP_PRICE } from "@/providers/membership-provider";
import { useToast } from "@/providers/toast-provider";
import { formatINR } from "@/lib/utils";

interface JoinButtonProps {
  className?: string;
  redirectToCart?: boolean;
  label?: string;
}

export function JoinButton({
  className = "",
  redirectToCart = true,
  label,
}: JoinButtonProps) {
  const { isActive, pending, join } = useMembership();
  const { push } = useToast();
  const router = useRouter();

  if (pending) {
    return <span className={`inline-block h-12 w-48 animate-pulse rounded-full bg-white/10 ${className}`} />;
  }

  if (isActive) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-left">
        <button
          onClick={() => router.push("/cart")}
          className={`group flex items-center gap-2.5 rounded-full border border-accent/40 bg-accent/15 px-6 py-3.5 text-xs text-foreground backdrop-blur-md transition-all hover:bg-accent/25 label-ui tracking-[0.15em] font-medium text-left cursor-pointer ${className}`}
        >
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <IconImage type="crown" size={14} className="grayscale opacity-85" />
          <span>PASS ACTIVE · VIEW SHOPPING BAG</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    );
  }

  const handleJoin = () => {
    join();
    push({
      title: "Patron Membership Added & Activated",
      description: "30% preferential archival valuation is now active across your bag and entire archive.",
      variant: "success",
    });
    if (redirectToCart) {
      router.push("/cart");
    }
  };

  return (
    <button
      onClick={handleJoin}
      className={`group relative flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-xs text-background transition-all duration-300 hover:opacity-90 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] label-ui tracking-[0.18em] font-semibold text-left cursor-pointer ${className}`}
    >
      <IconImage type="sparkles" size={14} className="border-none invert dark:invert-0" />
      <span>{label || `ADD MEMBERSHIP TO BAG — ${formatINR(MEMBERSHIP_PRICE)}/YR`}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </button>
  );
}

