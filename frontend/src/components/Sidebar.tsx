// src/components/Sidebar.tsx — Left Navigation Sidebar Component
//
// Recreates Duolingo's fixed left navigation sidebar with:
// - "duolingo" logo in green
// - SVG icon nav items (Learn, Practice, Leaderboards, Quests, Shop, Profile, More)
// - Active item: green text + highlighted background
// - Bottom "Want to learn chess?" promo card

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  activeKey?: string;
}

// Duolingo-accurate SVG icons for each nav item
const NavIcons: Record<string, React.ReactNode> = {
  learn: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  practice: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
    </svg>
  ),
  leaderboards: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L9 9H2l5.9 4.3L5.8 21 12 16.7l6.2 4.3-2.1-7.7L22 9h-7z"/>
    </svg>
  ),
  quests: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-2.18C17.93 5.69 18 5.35 18 5c0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
    </svg>
  ),
  shop: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6V4c0-1.11-.89-2-2-2h-4C8.89 2 8 2.89 8 4v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18V9l7.5 3L9 18z"/>
    </svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  more: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
    </svg>
  ),
};

const navItems = [
  { key: "learn",        label: "LEARN",        href: "/path" },
  { key: "practice",    label: "PRACTICE",     href: "/practice" },
  { key: "leaderboards",label: "LEADERBOARDS", href: "/leaderboard" },
  { key: "quests",      label: "QUESTS",       href: "/quests" },
  { key: "shop",        label: "SHOP",         href: "/shop" },
  { key: "profile",     label: "PROFILE",      href: "/profile" },
  { key: "more",        label: "MORE",         href: "/settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeKey }) => {
  const pathname = usePathname();

  const isActive = (itemKey: string, href: string) => {
    if (activeKey) return activeKey === itemKey;
    if (itemKey === "learn" && (pathname === "/" || pathname === "/learn" || pathname === "/path")) {
      return true;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[220px] fixed left-0 top-0 bottom-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] px-3 py-5 flex flex-col justify-between z-40 select-none hidden md:flex">
      {/* Top: Logo + Nav */}
      <div>
        {/* Duolingo wordmark */}
        <Link href="/path" className="flex items-center gap-2 px-3 mb-6">
          <span className="text-2xl font-black tracking-tight text-[#58CC02]" style={{ fontFamily: "Nunito, sans-serif" }}>
            duolingo
          </span>
        </Link>

        {/* Nav items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.key, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-150 ${
                  active
                    ? "text-[#58CC02] bg-[#58CC02]/10 border-2 border-[#58CC02]/30"
                    : "text-[var(--text-secondary)] border-2 border-transparent hover:bg-[var(--background-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className={active ? "text-[#58CC02]" : "text-[var(--text-tertiary)]"}>
                  {NavIcons[item.key]}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Chess promo card */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{
          background: "var(--background-secondary)",
          border: "2px solid var(--border)",
        }}
      >
        {/* Chess knight icon */}
        <div className="text-3xl mb-1 flex justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#37464F"/>
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="20">♟️</text>
          </svg>
        </div>
        <h4 className="font-extrabold text-sm text-[var(--text-primary)] mb-1">
          Want to learn chess?
        </h4>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Duolingo makes it easy!
        </p>
        <button className="w-full py-2 px-3 text-xs font-black uppercase text-[#1CB0F6] border-2 border-[#1CB0F6] rounded-xl hover:bg-[#1CB0F6]/10 transition-colors">
          TRY CHESS
        </button>
      </div>
    </aside>
  );
};
