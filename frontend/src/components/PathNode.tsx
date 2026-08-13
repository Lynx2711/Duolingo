// src/components/PathNode.tsx — Winding S-Curve Skill Node Component
//
// Renders an individual skill node along Duolingo's winding learning path.
//
// Key Mechanics:
// 1. S-Curve Offset: translateX offsets create the zigzag serpentine trail.
// 2. Graded Node States:
//    - Locked: Muted dark circle, lock icon, shake animation on click.
//    - Available (Next to do): Vibrant color, pulsing ring, Duo mascot to the right.
//    - Completed: Green circle with white checkmark, progress ring.
// 3. Tap-to-Preview Popover: Clicking opens a card below the node (in-flow,
//    not floating over the next node) with a START/PRACTICE button.
// 4. Connector line: A thin vertical segment renders between nodes.

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DuoMascot } from "./DuoMascot";

export interface SkillPathNodeData {
  id: number;
  unit_id: number;
  name: string;
  icon_url?: string | null;
  color: string;
  order: number;
  level: number;
  completed_lessons: number;
  total_lessons: number;
  is_locked: boolean;
  next_lesson_id?: number | null;
}

interface PathNodeProps {
  skill: SkillPathNodeData;
  // Flat index across all units (for S-curve calculation)
  index: number;
  isNextAvailable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  // Whether this node is last in its unit (suppress bottom connector)
  isLast?: boolean;
}

// Duolingo's S-curve offsets — nodes zigzag left-center-right
const OFFSETS = [0, 40, 65, 40, 0, -40, -65, -40];

export const PathNode: React.FC<PathNodeProps> = ({
  skill,
  index,
  isNextAvailable,
  isSelected,
  onSelect,
  isLast = false,
}) => {
  const [isShaking, setIsShaking] = useState(false);

  const offsetX = OFFSETS[index % OFFSETS.length];

  // SVG Progress Ring
  const radius = 36;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const progressRatio =
    skill.total_lessons > 0
      ? Math.min(1, skill.completed_lessons / skill.total_lessons)
      : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleClick = () => {
    if (skill.is_locked) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    onSelect();
  };

  const lessonToLaunch = skill.next_lesson_id || 1;

  // Node color: locked = dark muted, else use skill color
  const nodeColor = skill.is_locked ? "#3C4B52" : (skill.color || "#58CC02");
  const nodeShadow = skill.is_locked
    ? "0 4px 0 #2A363C"
    : `0 5px 0 ${skill.color ? skill.color + "99" : "#46A302"}`;

  // Completed = has level ≥ 1
  const isCompleted = skill.level >= 1;

  return (
    // Outer wrapper: reserves vertical space for the popover when open
    // min-h allows the popover to expand the row without pushing into the next node
    <div
      className="relative flex flex-col items-center select-none"
      style={{
        transform: `translateX(${offsetX}px)`,
        // Reserve enough vertical space: base node height + popover height when selected
        marginBottom: isSelected ? "12px" : "40px",
        marginTop: "8px",
      }}
    >
      {/* ── Duo Mascot: floats to the RIGHT of the active node ── */}
      {isNextAvailable && (
        <div
          className="absolute z-20"
          style={{
            // Position mascot to the right and vertically centered with the node button
            right: "-90px",
            top: "50%",
            transform: "translateY(-60%)",
          }}
        >
          <DuoMascot width={72} height={72} />
        </div>
      )}

      {/* ── "START" speech-bubble badge above active node ── */}
      {isNextAvailable && !isSelected && (
        <div
          className="absolute z-20 bg-white text-[#1A2C32] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border-2 border-[#E5E5E5]"
          style={{ top: "-34px" }}
        >
          START
          {/* Triangle pointer */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              bottom: "-7px",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "7px solid white",
            }}
          />
        </div>
      )}

      {/* ── Main Circular Node ── */}
      <div className={`relative ${isShaking ? "animate-shake" : ""}`}>
        {/* Pulsing halo ring for next-available node */}
        {isNextAvailable && (
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring z-0"
            style={{
              margin: "-8px",
              background: skill.color || "#58CC02",
              opacity: 0.35,
            }}
          />
        )}

        {/* SVG Progress Ring (for non-locked skills) */}
        {!skill.is_locked && (
          <svg
            width="84"
            height="84"
            className="absolute -top-[10px] -left-[10px] z-0 pointer-events-none -rotate-90"
          >
            {/* Track */}
            <circle
              cx="42" cy="42" r={radius}
              stroke="#37464F"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Fill */}
            <circle
              cx="42" cy="42" r={radius}
              stroke={skill.color || "#58CC02"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-700 ease-out"
            />
          </svg>
        )}

        {/* Node Circle Button */}
        <button
          onClick={handleClick}
          aria-label={`Skill: ${skill.name}`}
          className="w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-all duration-150 active:scale-95 active:translate-y-1 focus:outline-none"
          style={{
            backgroundColor: nodeColor,
            boxShadow: nodeShadow,
          }}
        >
          {skill.is_locked ? (
            // Lock icon SVG
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
              <rect x="3" y="11" width="16" height="13" rx="2" fill="#5A6B73"/>
              <path d="M7 11V7C7 4.79 8.79 3 11 3C13.21 3 15 4.79 15 7V11" stroke="#5A6B73" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="11" cy="17" r="2" fill="#3C4B52"/>
            </svg>
          ) : isCompleted ? (
            // White star for completed
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ) : isNextAvailable ? (
            // Book/start icon for next available
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M12 3C8.5 3 5.73 4.46 4 6.78V20l8-3 8 3V6.78C18.27 4.46 15.5 3 12 3z" opacity="0.9"/>
              <path d="M12 3v14" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
            </svg>
          ) : (
            // Headphone icon for audio/listen skills
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M12 3C7.03 3 3 7.03 3 12v4c0 1.1.9 2 2 2h2v-6H5v-1c0-3.86 3.14-7 7-7s7 3.14 7 7v1h-2v6h2c1.1 0 2-.9 2-2v-4c0-4.97-4.03-9-9-9z"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Skill Name Label (no truncation) ── */}
      <span
        className="mt-3 text-xs font-extrabold text-[var(--text-primary)] text-center leading-tight"
        style={{ maxWidth: "96px", wordBreak: "break-word" }}
      >
        {skill.name}
      </span>

      {/* ── Tap-to-Preview Popover Card (in-flow, below the node) ── */}
      {isSelected && !skill.is_locked && (
        <div
          className="relative z-30 w-60 mt-3 p-4 rounded-2xl shadow-2xl text-center animate-float-in"
          style={{
            background: "var(--background-secondary)",
            border: "2px solid var(--border)",
          }}
        >
          {/* Arrow pointer pointing up to node */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-[9px] w-4 h-4 rotate-45"
            style={{
              background: "var(--background-secondary)",
              borderTop: "2px solid var(--border)",
              borderLeft: "2px solid var(--border)",
            }}
          />

          {/* Skill title */}
          <h4 className="text-base font-black text-[var(--text-primary)] mb-0.5">
            {skill.name}
          </h4>

          {/* Status line */}
          <p className="text-xs font-bold text-[var(--text-secondary)] mb-3">
            {isCompleted
              ? `Crown Level ${skill.level} • Completed!`
              : `Lesson ${skill.completed_lessons + 1} of ${skill.total_lessons}`}
          </p>

          {/* CTA Button */}
          <Link href={`/learn/${lessonToLaunch}`}>
            <button className="btn-duo-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <span>{isCompleted ? "PRACTICE" : "START"}</span>
              <span className="bg-black/20 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                +10 XP
              </span>
            </button>
          </Link>
        </div>
      )}

      {/* ── Connector line to next node (vertical trail) ── */}
      {!isLast && (
        <div
          className="w-[3px] rounded-full mt-1"
          style={{
            height: "28px",
            background: skill.is_locked
              ? "#37464F"
              : isCompleted
              ? (skill.color || "#58CC02")
              : "#37464F",
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
};
