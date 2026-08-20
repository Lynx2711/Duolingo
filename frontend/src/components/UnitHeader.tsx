// =============================================================================
// src/components/UnitHeader.tsx — Unit Section Header Banner Component
// =============================================================================
//
// Ye component har Unit ke upar wala COLORED BANNER dikhata hai.
// Jaise real Duolingo me "SECTION 1, UNIT 1 · Basics" wala green/purple/blue banner.
//
// Isme aata hai:
//   1. Left side: "← SECTION 1, UNIT X" breadcrumb + Unit title (h2)
//   2. Right side: "GUIDEBOOK" button (clicks to /guidebook/{unitNumber})
//   3. Below banner (optional): Horizontal line with unit description in middle
// =============================================================================

// "use client": Is component me koi hooks (useState, useEffect) nahi hain,
// lekin Link component browser navigation use karta hai isliye client required hai.
"use client";

// React: JSX likhne ke liye import zaroori hai.
import React from "react";

// Link: Next.js navigation — "GUIDEBOOK" button click par /guidebook/1 pe jaayega
// full page reload ke bina.
import Link from "next/link";


// =============================================================================
// UnitHeaderProps Interface
// =============================================================================
// Ye interface batata hai ki UnitHeader component apne PARENT (path/page.tsx) se
// kya data expect karta hai.
//
// Kahan se aata hai ye data?
//   path/page.tsx me `coursePath.units.map(unit => ...)` loop chalata hai aur
//   har unit ke liye <UnitHeader unitNumber={unit.order} title={unit.title} ...> pass karta hai.
//   Aur wo unit data backend API se aata hai → GET /api/courses/1/path/1
// =============================================================================
interface UnitHeaderProps {
  unitNumber: number;         // Unit ki position: 1, 2, 3... (banner me "UNIT 1" dikhega)
  title: string;              // Unit ka naam: "Basics", "Travel", "Numbers"
  description?: string | null; // ? = Optional. Agar exist kare toh banner ke neeche dikhega.
                               // null: Backend null bhej sakta hai (no description)
  color?: string;             // ? = Optional. Default green use hoga agar pass na karo.
                               // Unit ka theme color (hex code, e.g., "#CE82FF" for purple)
}


// =============================================================================
// UnitHeader Component
// =============================================================================
// React.FC<UnitHeaderProps>: TypeScript typed functional component.
//
// ({ unitNumber, title, description, color = "#58CC02" }):
//   Destructuring props.
//   color = "#58CC02": Default parameter — agar parent color pass na kare,
//   toh automatically "#58CC02" (Duolingo green) use hoga.
// =============================================================================
export const UnitHeader: React.FC<UnitHeaderProps> = ({
  unitNumber,
  title,
  description,
  color = "#58CC02", // Default: Duolingo green
}) => {
  return (
    // Root wrapper: Full width, no text selection
    <div className="w-full mb-2 select-none">

      {/* ── MAIN BANNER ──────────────────────────────────────────────────── */}
      {/* style={{ backgroundColor: color }}: Dynamic color — Tailwind me dynamic
          hex colors directly class me nahi likhte (JIT me work nahi karta always),
          isliye inline style use kiya. */}
      <div
        className="w-full px-5 py-4 rounded-2xl text-white shadow-md flex items-center justify-between relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {/* ── LEFT SIDE: Breadcrumb + Title ─────────────────────────────── */}
        {/* space-y-0.5: children ke beech 2px vertical gap */}
        <div className="space-y-0.5">

          {/* Breadcrumb row: "← SECTION 1, UNIT 1" */}
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider opacity-90">
            {/* Left arrow SVG icon */}
            {/* viewBox="0 0 24 24": SVG coordinate system — 24x24 unit grid */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="opacity-80">
              {/* Path: Left-pointing chevron shape using SVG path notation */}
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            {/* Template literal string: "SECTION 1, UNIT 1", "SECTION 1, UNIT 2"... */}
            SECTION 1, UNIT {unitNumber}
          </div>

          {/* Unit title — h2 tag: Semantic HTML heading level 2 */}
          {/* h2 is important for SEO and accessibility (screen readers) */}
          <h2 className="text-xl font-black tracking-tight drop-shadow-sm text-white">
            {title}
          </h2>
        </div>

        {/* ── RIGHT SIDE: Guidebook Button ──────────────────────────────── */}
        {/* href={`/guidebook/${unitNumber}`}: Template literal URL
            unitNumber=1 → /guidebook/1
            unitNumber=2 → /guidebook/2 */}
        <Link href={`/guidebook/${unitNumber}`}>
          <button
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white font-black text-xs uppercase px-3 py-2 rounded-xl shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
            // bg-white/20: White background at 20% opacity (glassmorphism effect)
            // backdrop-blur-sm: Slight blur behind the button glass effect
            // active:scale-95: Click par thoda shrink (3D press feel)
            // shrink-0: Flex container me ye button apna size nahi chhoda
          >
            {/* Book icon SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              {/* Book pages path */}
              <path d="M18 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V6h10v2z" />
            </svg>
            <span>GUIDEBOOK</span>
          </button>
        </Link>
      </div>

      {/* ── DESCRIPTION ROW (Optional) ──────────────────────────────────── */}
      {/* description &&: Sirf tab render karo jab description truthy ho
          (null, undefined, empty string ke case me render nahi hoga) */}
      {description && (
        <div className="flex items-center justify-center my-5 gap-3 px-2">
          {/* Left horizontal line — h-px: 1px height, flex-1: remaining space fill */}
          <div className="h-px flex-1 bg-[var(--border)]" />

          {/* Description text in center */}
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-widest text-center px-2 max-w-[240px]">
            {description}
          </span>

          {/* Right horizontal line */}
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
      )}
    </div>
  );
};
