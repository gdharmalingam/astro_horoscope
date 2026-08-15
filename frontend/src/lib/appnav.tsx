"use client";

import { createContext, useContext, useState } from "react";

export type Tab = "horoscope" | "match" | "transit" | "ai" | "profiles";

interface AppNavContextValue {
  tab: Tab;
  setTab: (t: Tab) => void;
}

const AppNavContext = createContext<AppNavContextValue | null>(null);

export function useAppNav(): AppNavContextValue {
  const ctx = useContext(AppNavContext);
  if (!ctx) throw new Error("useAppNav must be used within <AppNavProvider>");
  return ctx;
}

export function AppNavProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>("horoscope");
  return (
    <AppNavContext.Provider value={{ tab, setTab }}>
      {children}
    </AppNavContext.Provider>
  );
}
