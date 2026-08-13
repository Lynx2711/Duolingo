// src/components/TopBar.tsx — Sticky Gamification Top Bar
//
// Shows learner stats in the top-right: flag, streak 🔥, XP ⚡, gems 💎, hearts ❤️
// Clicking hearts opens the HeartRefillModal.

"use client";

import React, { useState } from "react";
import { HeartRefillModal } from "./HeartRefillModal";

interface TopBarProps {
  user?: {
    id: number;
    name: string;
    xp_total: number;
    streak: number;
    hearts: number;
    max_hearts: number;
    gems: number;
  } | null;
  onUserUpdate?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onUserUpdate }) => {
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);

  const streak = user?.streak ?? 3;
  const xp = user?.xp_total ?? 450;
  const gems = user?.gems ?? 337;
  const hearts = user?.hearts ?? 5;

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full h-14 flex items-center justify-between px-4 select-none"
        style={{
          background: "var(--topbar-bg)",
          borderBottom: "2px solid var(--topbar-border)",
        }}
      >
        {/* Left: mobile logo only */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="text-xl font-black text-[#58CC02]">duolingo</span>
        </div>

        {/* Spacer on desktop (sidebar takes the left) */}
        <div className="hidden md:block" />

        {/* Right: stats group */}
        <div className="flex items-center gap-5 ml-auto">

          {/* Flag */}
          <div className="hidden md:flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-xl">🇩🇪</span>
            <span className="text-xs font-black text-[var(--text-secondary)] uppercase">8</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" title="Streak">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF9600">
              <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
            </svg>
            <span className="font-black text-sm text-[#FF9600]">{streak}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" title="XP">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFC800">
              <path d="M13 2.05V2c0-1.1-.9-2-2-2s-2 .9-2 2v.05C4.05 2.55 1 6.17 1 10.5 1 16.25 5.5 21 11.25 22h1.5C18.5 21 23 16.25 23 10.5c0-4.33-3.05-7.95-10-8.45zM11 20v-8.59l-2.5 2.5L7.09 12.5 12 7.59l4.91 4.91-1.41 1.41L13 11.41V20h-2z"/>
            </svg>
            <span className="font-black text-sm" style={{ color: "#FFC800" }}>0</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" title="Gems">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1CB0F6">
              <path d="M6 2l-6 9 6 3 6-3-6-9zm0 2.5L10.6 11 6 13.2 1.4 11 6 4.5zM18 2l-6 9 6 3 6-3-6-9zm0 2.5L22.6 11 18 13.2 13.4 11 18 4.5zM12 13l-6 3 6 6 6-6-6-3z"/>
            </svg>
            <span className="font-black text-sm text-[#1CB0F6]">{gems}</span>
          </div>

          {/* Hearts */}
          <button
            onClick={() => setIsRefillModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
            title="Hearts"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF4B4B">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="font-black text-sm text-[#FF4B4B]">{hearts}</span>
          </button>
        </div>
      </header>

      {isRefillModalOpen && (
        <HeartRefillModal
          user={user}
          onClose={() => setIsRefillModalOpen(false)}
          onRefillSuccess={() => {
            setIsRefillModalOpen(false);
            if (onUserUpdate) onUserUpdate();
          }}
        />
      )}
    </>
  );
};
