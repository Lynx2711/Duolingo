// =============================================================================
// src/components/PathNode.tsx — Single Lesson Circle on the Learning Path
// =============================================================================
//
// Ye component EKTAA CIRCLE (node) dikhata hai jo learning path par hoti hai.
// Har circle ek lesson ko represent karti hai.
//
// 3 states hoti hain (bilkul real Duolingo jaisi):
//   1. COMPLETED: Green circle, star icon — ye lesson pehle se finish hai
//   2. AVAILABLE: Colored pulsing circle, "START" badge — next karne wali lesson
//   3. LOCKED: Dark grey circle, padlock icon — abhi access nahi
// =============================================================================

// "use client": Kyunki is component me useState (interactive behavior) use ho raha hai,
// aur ye sirf browser me kaam karta hai, isliye ye directive zaroori hai.
"use client";

// React: UI library. useState: Interactive local state manage karne ke liye.
import React, { useState } from "react";

// Link: Next.js ka built-in component jo page navigation karta hai bina full
// page reload ke (fast SPA-style navigation). Ye HTML <a> tag ka replacement hai.
import Link from "next/link";

// DuoMascot: Duolingo owl graphic jo "next available" node ke side me dikhta hai.
// Ye isi project ki doosri file (DuoMascot.tsx) se import ho raha hai.
import { DuoMascot } from "./DuoMascot";


// =============================================================================
// PathNodeProps Interface — Ye component kya-kya data expect karta hai?
// =============================================================================
// Interface: TypeScript me ek contract/blueprint define karna.
// PathNodeProps batata hai ki jab bhi PathNode component use karo,
// toh kaun kaun si properties (props) pass karni zaroori hain.
//
// Props kya hote hain?
//   React me parent component child component ko data bhejta hai "props" ke through.
//   path/page.tsx → <PathNode lessonId={5} isCompleted={true} ... />
//   Ye sab values "props" hain.
//
// export interface: "export" ka matlab ye interface doosri files me bhi use ho sakta hai.
// path/page.tsx is interface ko import karke PathNode ke props type check karta hai.
// =============================================================================
export interface PathNodeProps {
  lessonId: number;        // Is circle ko click karne par kaunsi lesson open hogi
  skillName: string;       // Node ke neeche show hone wala naam (e.g., "Greetings")
  color: string;           // Node ka background color (hex code, e.g., "#58CC02")
  isCompleted: boolean;    // true = green completed state, false = nahi hua
  isLocked: boolean;       // true = grey padlock state — click par sirf shake hoga
  isNextAvailable: boolean; // true = pulsing blue ring + START badge + Duo mascot
  isSelected: boolean;     // true = popover card show karo (user ne click kiya)
  cx: number;              // Canvas par node ka center X coordinate (horizontal position)
  cy: number;              // Canvas par node ka center Y coordinate (vertical position)
  onSelect: () => void;    // Function jab user node click kare (tab parent ko batao)
                           // () => void: koi argument nahi, koi return nahi
}


// =============================================================================
// CONSTANTS — Measurement values
// =============================================================================

// NODE_DIAMETER: Node circle ka diameter (width/height) pixels me.
// "export": path/page.tsx bhi is value ko import karke canvas height calculate karta hai.
export const NODE_DIAMETER = 72; // px

// R: Radius = diameter/2 — node ke center point ko edges se calculate karne ke liye.
// Jab node ko canvas par position karte hain, center se position dekhte hain.
const R = NODE_DIAMETER / 2; // 36px


// =============================================================================
// PathNode Component — The actual UI function
// =============================================================================
// React.FC<PathNodeProps>: TypeScript ko batao ki ye ek React Function Component hai
// jo PathNodeProps ke saare fields accept karta hai.
//
// Destructuring syntax: ({ lessonId, color, isCompleted, ... }) =>
//   Matlab: props object ke saare fields directly variable ki tarah use karo.
//   props.lessonId likhne ki zaroorat nahi — sirf lessonId likho.
// =============================================================================
export const PathNode: React.FC<PathNodeProps> = ({
  lessonId,
  skillName,
  color,
  isCompleted,
  isLocked,
  isNextAvailable,
  isSelected,
  cx,
  cy,
  onSelect,
}) => {

  // shaking: Local state — kya node abhi shake animation me hai?
  // useState(false): Initial value false = shaking nahi ho raha.
  // setShaking: Is state ko change karne ka function.
  const [shaking, setShaking] = useState(false);


  // ── handleClick(): Node click par kya hoga ─────────────────────────────────
  const handleClick = () => {
    if (isLocked) {
      // Agar node locked hai:
      // Shake animation ON karo...
      setShaking(true);
      // ...aur 500ms (0.5 second) baad OFF karo (animation ek baar chal jaye)
      setTimeout(() => setShaking(false), 500);
    } else {
      // Node unlocked hai — parent ko batao ki is node ko select kiya
      // (parent = path/page.tsx jo selectedId track karta hai)
      onSelect();
    }
  };


  // ── Node ka color decide karo ──────────────────────────────────────────────
  // Ternary operator: condition ? valueIfTrue : valueIfFalse
  // Pehle check: locked? → grey
  // Phir check: completed? → green
  // Default: unit ka custom color (e.g., "#CE82FF" for Travel)
  const faceColor = isLocked
    ? "#37464F"          // Dark grey for locked
    : isCompleted
    ? "#58CC02"          // Duolingo green for completed
    : color || "#58CC02"; // Unit color, fallback to green

  // Sab nodes ka same grey shadow (3D button effect ke liye)
  const shadowColor = "#2B363C";


  // ── JSX — Actual HTML structure ──────────────────────────────────────────────
  return (
    // Root div: "absolute" = canvas ke andar exact pixel position par rakho
    // left: cx - R = node ka left edge (center minus radius)
    // top: cy - R = node ka top edge
    // width/height: NODE_DIAMETER (72px)
    <div
      className="absolute"
      style={{ left: cx - R, top: cy - R, width: NODE_DIAMETER, height: NODE_DIAMETER }}
    >

      {/* ── PULSE RING: Sirf "next available" node par dikhta hai ──────────── */}
      {/* && operator: Agar isNextAvailable true hai toh ye element render hoga */}
      {isNextAvailable && (
        <div
          className="absolute rounded-full border-4 border-[#58CC02] animate-ping opacity-30 pointer-events-none"
          // animate-ping: Tailwind CSS animation — bahar ki taraf expand hota hai repeatedly
          // pointer-events-none: Ye ring clicks ko block nahi karegi (passthrough)
          style={{ inset: -10 }} // Node se 10px bahar tak ring faili hogi
        />
      )}

      {/* ── DUO MASCOT: Sirf "next available" node ke right side par ──────── */}
      {isNextAvailable && (
        <div
          className="absolute pointer-events-none z-20"
          // Node ke right side par: left = node width + 10px gap
          // top: 50%, translateY(-50%) = vertically centered
          style={{ left: NODE_DIAMETER + 10, top: "50%", transform: "translateY(-50%)" }}
        >
          {/* DuoMascot component — 68×68px owl image with bounce animation */}
          <DuoMascot width={68} height={68} />
        </div>
      )}

      {/* ── START BADGE: "next available" node par, sirf jab selected nahi ── */}
      {/* isNextAvailable && !isSelected: Jab tak popover khula nahi, badge dikhao */}
      {isNextAvailable && !isSelected && (
        <div
          className="absolute z-20 pointer-events-none animate-bounce"
          // Node ke upar: bottom = NODE_DIAMETER + 6px above node
          // horizontally centered: left 50%, translateX(-50%)
          style={{ bottom: NODE_DIAMETER + 6, left: "50%", transform: "translateX(-50%)" }}
        >
          {/* Green "START" pill badge */}
          <div className="bg-[#58CC02] text-white text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-2xl border-b-4 border-[#46A302] whitespace-nowrap shadow-lg">
            START
          </div>
        </div>
      )}

      {/* ── 3D NODE BUTTON ────────────────────────────────────────────────── */}
      {/* Outer wrapper: grey shadow layer */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: shadowColor, padding: 4 }}
      >
        {/* Shadow div: Slightly shifted down (translateY 5px) to create 3D depth illusion */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: shadowColor, transform: "translateY(5px)" }}
        />

        {/* Button face — the actual clickable circle */}
        <button
          onClick={handleClick}
          // aria-label: Screen readers ke liye — accessibility feature
          aria-label={isLocked ? `Locked: ${skillName}` : skillName}
          className={`absolute inset-0 rounded-full flex items-center justify-center
            focus:outline-none transition-transform duration-100
            active:translate-y-1 hover:brightness-110 cursor-pointer
            ${shaking ? "animate-shake" : ""}`}
          // active:translate-y-1: Click karne par button neeche "press" hota hai (3D effect)
          // animate-shake: Custom CSS animation (globals.css me defined) — jab locked node click karo
          style={{ backgroundColor: faceColor }}
        >
          {/* Locked state: Padlock SVG icon */}
          {isLocked ? (
            // SVG (Scalable Vector Graphics): Resolution-independent vector icon.
            // viewBox="0 0 22 26": SVG ka coordinate space (width=22, height=26)
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
              {/* Lock body: rectangle */}
              <rect x="3" y="11" width="16" height="13" rx="3" fill="#5A6B73" />
              {/* Lock shackle (curved top part) */}
              <path
                d="M7 11V7C7 4.79 8.79 3 11 3C13.21 3 15 4.79 15 7V11"
                stroke="#5A6B73"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Lock keyhole */}
              <circle cx="11" cy="17" r="2" fill="#37464F" />
            </svg>
          ) : (
            // Unlocked/completed state: Official Duolingo Star icon from their CDN
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/images/path/icons/ef9c771afdb674f0ff82fae25c6a7b0a.svg"
              alt="Star"
              className="w-8 h-8 object-contain brightness-200"
              // brightness-200: CSS filter — star ko white/bright banao (dark background par)
            />
          )}
        </button>
      </div>

      {/* ── POPOVER CARD: Node click hone par dikhta hai ──────────────────── */}
      {/* isSelected && !isLocked: Sirf unlocked nodes par popover dikhao */}
      {isSelected && !isLocked && (
        <div
          className="absolute z-50 w-60 rounded-2xl shadow-2xl bg-[#1A2C32] border-2 border-[#37464F] p-4 text-center animate-bounce-in"
          // Node ke neeche: top = NODE_DIAMETER (below the circle) + 14px gap
          // horizontally centered: left 50%, translateX(-50%)
          style={{ top: NODE_DIAMETER + 14, left: "50%", transform: "translateX(-50%)" }}
        >
          {/* Arrow pointer (small rotated square) connecting popover to node */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-[9px] w-4 h-4 rotate-45 bg-[#1A2C32] border-t-2 border-l-2 border-[#37464F]" />

          {/* Skill name heading */}
          <p className="text-base font-black text-white mb-0.5">{skillName}</p>

          {/* Subtitle text changes based on completion status */}
          <p className="text-xs text-[#8A9BA3] font-bold mb-4">
            {isCompleted ? "Completed · Practice to earn XP" : "Lesson"}
          </p>

          {/* START / PRACTICE button — clicking navigates to /learn/{lessonId} */}
          {/* Link wraps button: href="/learn/5" for lesson 5 */}
          <Link href={`/learn/${lessonId}`}>
            <button className="w-full py-3 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] text-sm font-black text-white uppercase hover:brightness-105 active:translate-y-0.5 transition-all">
              {/* Template literal: backtick string me variable embed karna */}
              {isCompleted ? "PRACTICE" : "START"} &nbsp;
              {/* &nbsp; = non-breaking space (HTML entity) */}
              <span className="bg-black/20 text-[11px] px-1.5 py-0.5 rounded-full">+10 XP</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};
