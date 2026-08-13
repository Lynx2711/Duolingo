// src/components/UnitHeader.tsx — Unit Section Header Banner Component
//
// Renders Duolingo's colored banner header at the top of each Unit section.
// Features:
// - Left arrow + "SECTION 1, UNIT X" breadcrumb label
// - Large unit title
// - "GUIDEBOOK" button on right
// - Horizontal divider with unit description centered below the banner

"use client";

import React from "react";
import Link from "next/link";

interface UnitHeaderProps {
  unitNumber: number;
  title: string;
  description?: string | null;
  color?: string;
}

export const UnitHeader: React.FC<UnitHeaderProps> = ({
  unitNumber,
  title,
  description,
  color = "#58CC02",
}) => {
  return (
    <div className="w-full mb-2 select-none">
      {/* Main Banner */}
      <div
        className="w-full px-5 py-4 rounded-2xl text-white shadow-md flex items-center justify-between relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {/* Left: breadcrumb + title */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider opacity-90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="opacity-80">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            SECTION 1, UNIT {unitNumber}
          </div>
          <h2 className="text-xl font-black tracking-tight drop-shadow-sm text-white">
            {title}
          </h2>
        </div>

        {/* Right: Guidebook button */}
        <Link href={`/guidebook/${unitNumber}`}>
          <button
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white font-black text-xs uppercase px-3 py-2 rounded-xl shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            {/* Guidebook icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V6h10v2z" />
            </svg>
            <span>GUIDEBOOK</span>
          </button>
        </Link>
      </div>

      {/* Divider with unit description centered */}
      {description && (
        <div className="flex items-center justify-center my-5 gap-3 px-2">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-widest text-center px-2 max-w-[240px]">
            {description}
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
      )}
    </div>
  );
};
