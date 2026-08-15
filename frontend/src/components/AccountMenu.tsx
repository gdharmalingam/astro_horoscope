"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;
  const name = user.display_name || user.email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2"
      >
        <span className="w-8 h-8 rounded-full bg-accent text-cosmic grid place-items-center font-bold">
          {initial}
        </span>
        <span className="text-sm">{name}</span>
        <span className="opacity-60 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-cosmic border border-white/15 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <span className="w-9 h-9 rounded-full bg-accent text-cosmic grid place-items-center font-bold">
              {initial}
            </span>
            <div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs opacity-60">
                {user.is_admin ? "Admin" : "User"}
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2.5 text-sm hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            👤 Profile
          </Link>
          <Link
            href="/api-keys"
            className="block px-4 py-2.5 text-sm hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            🔑 API Keys
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 border-t border-white/10"
          >
            ⎋ Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
