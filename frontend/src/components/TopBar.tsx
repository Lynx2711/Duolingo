// src/components/TopBar.tsx — Sticky Gamification Top Bar (Official Assets)
//
// Uses official CloudFront SVGs for flag, streak flame, 3D gems, and red hearts.

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

  const streak = user ? user.streak : 0;
  const gems = user ? user.gems : 0;
  const hearts = user ? user.hearts : 0;
  const xp = user ? user.xp_total : 0;

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full h-14 flex items-center justify-between px-6 select-none"
        style={{
          background: "var(--topbar-bg)",
        }}
      >
        {/* Duolingo logo — only on md (icon-strip mode). At lg+ the expanded sidebar already shows it. */}
        <div className="flex items-center flex-1">
          <a href="/path" className="hidden md:flex lg:hidden items-center">
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/vendor/0cecd302cf0bcd0f73d51768feff75fe.svg"
              alt="Duolingo"
              className="h-6 object-contain"
            />
          </a>
        </div>

        {/* Right: Gamification Stats Bar (Matches reference screenshot) */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Spanish Course Flag */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/vendor/59a90a2cedd48b751a8fd22014768fd7.svg"
              alt="Spanish Flag"
              className="w-7 h-5 object-contain"
            />
          </div>

          {/* Total XP Counter */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" title="Total XP">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFC800" className="shrink-0 drop-shadow-[0_1px_2px_rgba(255,200,0,0.4)]">
              <path d="M7 2v11h3v9l7-12h-4l4-8z" />
            </svg>
            <span className="text-sm font-black text-[#FFC800]">
              {xp}
            </span>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src={
                streak > 0
                  ? "https://d35aaqx5ub95lt.cloudfront.net/images/icons/398e4298a3b39ce566050e5c041949ef.svg"
                  : "https://d35aaqx5ub95lt.cloudfront.net/images/icons/65b8a029d7a148218f1ac98a198f8b42.svg"
              }
              alt="Streak"
              className="w-6 h-6 object-contain"
            />
            <span className={`text-sm font-black ${streak > 0 ? "text-[#FF9600]" : "text-[#5A6B73]"}`}>
              {streak}
            </span>
          </div>

          {/* Gems Counter */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/images/gems/45c14e05be9c1af1d7d0b54c6eed7eee.svg"
              alt="Gems"
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-black text-[#1CB0F6]">
              {gems}
            </span>
          </div>

          {/* Hearts Counter */}
          <button
            onClick={() => setIsRefillModalOpen(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
            title="Refill Hearts"
          >
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/images/hearts/8fdba477c56a8eeb23f0f7e67fdec6d9.svg"
              alt="Hearts"
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-black text-[#FF4B4B]">
              {hearts}
            </span>
          </button>
        </div>
      </header>

      {/* Heart Refill Modal */}
      {isRefillModalOpen && (
        <HeartRefillModal
          user={user}
          onClose={() => setIsRefillModalOpen(false)}
          onRefillSuccess={() => {
            if (onUserUpdate) onUserUpdate();
            setIsRefillModalOpen(false);
          }}
        />
      )}
    </>
  );
};
