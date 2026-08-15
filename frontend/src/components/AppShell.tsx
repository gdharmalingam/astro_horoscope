"use client";

import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/i18n";
import { AppNavProvider } from "@/lib/appnav";
import { Header } from "./Header";
import { SignInModal } from "./SignInModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppNavProvider>
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">{children}</div>
            <SignInModal />
          </AppNavProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
