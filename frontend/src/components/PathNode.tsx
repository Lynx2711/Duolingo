// src/components/PathNode.tsx — Duolingo Path Level Node
//
// Features 3 distinct states matching real Duolingo:
// 1. Completed: Feather Green (#58CC02), gray shadow (#2B363C), official Star SVG icon
// 2. Available: Unit Color (#58CC02 / #CE82FF / #1CB0F6), gray shadow (#2B363C), pulsing glow ring, START badge & Duo Mascot beside it
// 3. Locked: Dark Gray (#37464F), gray shadow (#2B363C), Padlock SVG icon

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DuoMascot } from "./DuoMascot";

export interface PathNodeProps {
  lessonId: number;
  skillName: string;
  color: string;
  isCompleted: boolean;
  isLocked: boolean;
  isNextAvailable: boolean;
  isSelected: boolean;
  cx: number;
  cy: number;
  onSelect: () => void;
}

export const NODE_DIAMETER = 72; // px
const R = NODE_DIAMETER / 2;     // 36px

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
  const [shaking, setShaking] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } else {
      onSelect();
    }
  };

  // Node Face Color
  const faceColor = isLocked
    ? "#37464F"
    : isCompleted
    ? "#58CC02"
    : color || "#58CC02";

  // Gray shadow for all nodes as requested
  const shadowColor = "#2B363C";

  return (
    <div
      className="absolute"
      style={{ left: cx - R, top: cy - R, width: NODE_DIAMETER, height: NODE_DIAMETER }}
    >
      {/* ── Active pulse glow ring for current available node ── */}
      {isNextAvailable && (
        <div
          className="absolute rounded-full border-4 border-[#58CC02] animate-ping opacity-30 pointer-events-none"
          style={{ inset: -10 }}
        />
      )}

      {/* ── Duo mascot beside active available node ── */}
      {isNextAvailable && (
        <div
          className="absolute pointer-events-none z-20"
          style={{ left: NODE_DIAMETER + 10, top: "50%", transform: "translateY(-50%)" }}
        >
          <DuoMascot width={68} height={68} />
        </div>
      )}

      {/* ── START speech-bubble badge above active available node ── */}
      {isNextAvailable && !isSelected && (
        <div
          className="absolute z-20 pointer-events-none animate-bounce"
          style={{ bottom: NODE_DIAMETER + 6, left: "50%", transform: "translateX(-50%)" }}
        >
          <div className="bg-[#58CC02] text-white text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-2xl border-b-4 border-[#46A302] whitespace-nowrap shadow-lg">
            START
          </div>
        </div>
      )}

      {/* ── 3D Node Button with Gray Shadow ── */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: shadowColor, padding: 4 }}
      >
        {/* Shadow layer */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: shadowColor, transform: "translateY(5px)" }}
        />

        {/* Button face */}
        <button
          onClick={handleClick}
          aria-label={isLocked ? `Locked: ${skillName}` : skillName}
          className={`absolute inset-0 rounded-full flex items-center justify-center
            focus:outline-none transition-transform duration-100
            active:translate-y-1 hover:brightness-110 cursor-pointer
            ${shaking ? "animate-shake" : ""}`}
          style={{ backgroundColor: faceColor }}
        >
          {isLocked ? (
            /* Locked state padlock icon */
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
              <rect x="3" y="11" width="16" height="13" rx="3" fill="#5A6B73" />
              <path
                d="M7 11V7C7 4.79 8.79 3 11 3C13.21 3 15 4.79 15 7V11"
                stroke="#5A6B73"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="11" cy="17" r="2" fill="#37464F" />
            </svg>
          ) : (
            /* Official Duolingo Star SVG Icon */
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/images/path/icons/ef9c771afdb674f0ff82fae25c6a7b0a.svg"
              alt="Star"
              className="w-8 h-8 object-contain brightness-200"
            />
          )}
        </button>
      </div>

      {/* ── Popover card on tap ── */}
      {isSelected && !isLocked && (
        <div
          className="absolute z-50 w-60 rounded-2xl shadow-2xl bg-[#1A2C32] border-2 border-[#37464F] p-4 text-center animate-bounce-in"
          style={{ top: NODE_DIAMETER + 14, left: "50%", transform: "translateX(-50%)" }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-[9px] w-4 h-4 rotate-45 bg-[#1A2C32] border-t-2 border-l-2 border-[#37464F]" />
          <p className="text-base font-black text-white mb-0.5">{skillName}</p>
          <p className="text-xs text-[#8A9BA3] font-bold mb-4">
            {isCompleted ? "Completed · Practice to earn XP" : "Lesson"}
          </p>
          <Link href={`/learn/${lessonId}`}>
            <button className="w-full py-3 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] text-sm font-black text-white uppercase hover:brightness-105 active:translate-y-0.5 transition-all">
              {isCompleted ? "PRACTICE" : "START"} &nbsp;
              <span className="bg-black/20 text-[11px] px-1.5 py-0.5 rounded-full">+10 XP</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};
