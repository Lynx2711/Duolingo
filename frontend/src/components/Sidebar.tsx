// src/components/Sidebar.tsx — Responsive Dual-Mode Left Navigation Sidebar
//
// Responsive Behavior (Matches Duolingo Website Exactly):
// 1. Medium / Standard Desktop (md to 2xl, width 80px):
//    - Icon-strip layout with Duo Owl face SVG logo (70a4be81077a8037698067f583816ff9.svg)
//    - Nav avatars in rounded squares
// 2. Wide Desktop (2xl and up, width 240px):
//    - Expanded layout with Duolingo text logo SVG (0cecd302cf0bcd0f73d51768feff75fe.svg)
//    - Official SVGs for LEARN, LEADERBOARDS, QUESTS, SHOP, PROFILE, MORE with text labels
//    - Bottom "Want to learn chess?" promo card

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  activeKey?: string;
}

const NAV_ITEMS = [
  {
    key: "learn",
    label: "LEARN",
    href: "/path",
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/784035717e2ff1d448c0f6cc4efc89fb.svg",
  },
  {
    key: "leaderboards",
    label: "LEADERBOARDS",
    href: "/leaderboard",
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/ca9178510134b4b0893dbac30b6670aa.svg",
  },
  {
    key: "quests",
    label: "QUESTS",
    href: "/quests",
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/7ef36bae3f9d68fc763d3451b5167836.svg",
  },
  {
    key: "shop",
    label: "SHOP",
    href: "/shop",
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/0e58a94dda219766d98c7796b910beee.svg",
  },
  {
    key: "profile",
    label: "PROFILE",
    href: "/profile",
    isProfile: true,
  },
  {
    key: "more",
    label: "MORE",
    href: "/settings",
    isMore: true,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeKey }) => {
  const pathname = usePathname();

  const isItemActive = (key: string, href: string) => {
    if (activeKey) return activeKey === key;
    if (key === "learn" && (pathname === "/" || pathname === "/learn" || pathname === "/path")) {
      return true;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── MODE 1: Collapsed Icon-Strip Sidebar (md–xl: width 80px) ── */}
      <aside className="w-20 fixed left-0 top-0 bottom-0 bg-[#131F24] border-r-2 border-[#37464F] py-5 flex flex-col items-center justify-between z-40 select-none hidden md:flex xl:hidden">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Duo Owl Face Logo */}
          <Link
            href="/path"
            className="w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
            title="Duolingo Home"
          >
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg"
              alt="Duo Owl"
              className="w-10 h-10 object-contain"
            />
          </Link>

          {/* Navigation Item Avatars */}
          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.key, item.href);

              return (
                <div key={item.key} className="relative group flex items-center justify-center w-full">
                  <Link href={item.href} aria-label={item.label} className="focus:outline-none">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border-2 ${active
                          ? "bg-[#1CB0F6]/10 border-[#1CB0F6]"
                          : "border-transparent hover:bg-[#1A2C32]"
                        }`}
                    >
                      {item.isProfile ? (
                        <div className="w-8 h-8 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-black text-xs">
                          A
                        </div>
                      ) : item.isMore ? (
                        <div className="w-8 h-8 rounded-full bg-[#CE82FF]/20 flex items-center justify-center text-[#CE82FF] font-black text-xs">
                          •••
                        </div>
                      ) : (
                        <img
                          src={item.iconUrl}
                          alt={item.label}
                          className="w-7 h-7 object-contain"
                        />
                      )}
                    </div>
                  </Link>

                  {/* Tooltip on hover */}
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1A2C32] border border-[#37464F] text-white text-xs font-black uppercase px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── MODE 2: Expanded Sidebar (xl and up: width 240px) ── */}
      <aside className="w-[240px] fixed left-0 top-0 bottom-0 bg-[#131F24] border-r-2 border-[#37464F] px-4 py-6 flex flex-col justify-between z-40 select-none hidden xl:flex">
        <div className="flex flex-col gap-8">
          {/* Duolingo Text Logo */}
          <Link href="/path" className="px-3 flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/vendor/0cecd302cf0bcd0f73d51768feff75fe.svg"
              alt="Duolingo"
              className="h-8 object-contain"
            />
          </Link>

          {/* Navigation Items with Labels */}
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.key, item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 ${active
                      ? "bg-[#1CB0F6]/10 border-[#1CB0F6] text-[#1CB0F6]"
                      : "border-transparent text-[#8A9BA3] hover:bg-[#1A2C32] hover:text-white"
                    }`}
                >
                  {item.isProfile ? (
                    <div className="w-8 h-8 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-black text-xs shrink-0">
                      A
                    </div>
                  ) : item.isMore ? (
                    <div className="w-8 h-8 rounded-full bg-[#CE82FF]/20 flex items-center justify-center text-[#CE82FF] shrink-0 font-black">
                      •••
                    </div>
                  ) : (
                    <img
                      src={item.iconUrl}
                      alt={item.label}
                      className="w-8 h-8 object-contain shrink-0"
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Promo Card: Want to learn chess? */}
        <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 text-center space-y-2">
          <div className="text-3xl">♟️</div>
          <h4 className="text-sm font-black text-white leading-tight">
            Want to learn chess?
          </h4>
          <p className="text-xs font-bold text-[#8A9BA3]">
            Duolingo makes it easy!
          </p>
          <button className="text-xs font-black text-[#1CB0F6] uppercase hover:underline pt-1">
            TRY CHESS
          </button>
        </div>
      </aside>
    </>
  );
};
