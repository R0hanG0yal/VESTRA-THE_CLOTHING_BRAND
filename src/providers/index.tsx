"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { AuthProvider } from "./auth-provider";
import { WalletProvider } from "./wallet-provider";
import { MembershipProvider } from "./membership-provider";
import { CartProvider } from "./cart-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WalletProvider>
            <MembershipProvider>
              <CartProvider>{children}</CartProvider>
            </MembershipProvider>
          </WalletProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
