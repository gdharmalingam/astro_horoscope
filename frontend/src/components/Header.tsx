"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { useAppNav, type Tab } from "@/lib/appnav";
import { AccountMenu } from "./AccountMenu";

const TABS: [Tab, string][] = [
  ["horoscope", "horoscopeTab"],
  ["match", "matchTab"],
  ["transit", "transitTab"],
  ["ai", "aiTab"],
  ["profiles", "profilesTab"],
];

export function Header() {
  const { user, ready, openSignIn } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { tab, setTab } = useAppNav();
  const pathname = usePathname();
  const showTabs = pathname === "/";

  return (
    <header className="no-print site-header sticky top-0 z-40 backdrop-blur bg-cosmic/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="h-14 flex items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/"
            className="font-bold text-accent flex items-center gap-1 shrink-0 text-sm sm:text-base"
          >
            ✦ <span className="hidden sm:inline">{t("appTitle")}</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language"
              className="bg-black/30 border border-white/15 rounded-lg px-2 py-1.5 text-sm max-w-[6rem] sm:max-w-[7.5rem] text-[var(--fg)]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-black">
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-9 h-9 grid place-items-center rounded-lg bg-black/30 border border-white/15 text-base shrink-0"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {ready &&
              (user ? (
                <AccountMenu />
              ) : (
                <button
                  onClick={openSignIn}
                  className="px-3 sm:px-4 py-1.5 rounded-lg bg-accent text-cosmic font-semibold text-sm shrink-0"
                >
                  {t("signIn")}
                </button>
              ))}
          </div>
        </div>

        {showTabs && (
          <nav className="flex gap-1 overflow-x-auto no-scrollbar -mb-px pb-2 sm:pb-0 sm:justify-center">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative whitespace-nowrap px-3 sm:px-4 py-2 rounded-t-lg text-sm border-b-2 transition-colors ${
                  tab === key
                    ? "border-accent text-accent font-semibold"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {t(label)}
                {key === "ai" && (
                  <span className="ml-1 align-super text-[9px] uppercase tracking-wide opacity-70">
                    soon
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
