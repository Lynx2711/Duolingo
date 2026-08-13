// src/components/DuoMascot.tsx — Duolingo Owl Mascot (Duo) Component
//
// Renders a faithful SVG illustration of Duolingo's iconic green owl (Duo).
// Displayed floating to the right of the currently active skill node on the path,
// with a gentle up-down bounce animation matching Duolingo's desktop UI.

import React from "react";

interface DuoMascotProps {
  width?: number;
  height?: number;
  className?: string;
}

export const DuoMascot: React.FC<DuoMascotProps> = ({
  width = 80,
  height = 80,
  className = "",
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{
        animation: "owl-jump 1.2s ease-in-out infinite",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Shadow on ground ── */}
        <ellipse cx="60" cy="125" rx="22" ry="5" fill="rgba(0,0,0,0.15)" />

        {/* ── Orange feet ── */}
        <ellipse cx="44" cy="116" rx="12" ry="5" fill="#FF9600" />
        <ellipse cx="76" cy="116" rx="12" ry="5" fill="#FF9600" />
        {/* Toe lines */}
        <line x1="36" y1="118" x2="44" y2="112" stroke="#E07A00" strokeWidth="2" strokeLinecap="round"/>
        <line x1="44" y1="118" x2="44" y2="112" stroke="#E07A00" strokeWidth="2" strokeLinecap="round"/>
        <line x1="52" y1="118" x2="44" y2="112" stroke="#E07A00" strokeWidth="2" strokeLinecap="round"/>
        <line x1="68" y1="118" x2="76" y2="112" stroke="#E07A00" strokeWidth="2" strokeLinecap="round"/>
        <line x1="76" y1="118" x2="76" y2="112" stroke="#E07A00" strokeWidth="2" strokeLinecap="round"/>
        <line x1="84" y1="118" x2="76" y2="112" stroke="#E07A00" strokeWidth="2" strokeLinecap="round"/>

        {/* ── Main body ── Feather Green */}
        <path
          d="M60 8 C32 8 16 28 16 60 C16 90 32 112 60 112 C88 112 104 90 104 60 C104 28 88 8 60 8Z"
          fill="#58CC02"
        />

        {/* ── Ear tufts (darker green, pointed top) ── */}
        <path d="M28 20 L36 38 L20 38 Z" fill="#46A302" />
        <path d="M92 20 L100 38 L84 38 Z" fill="#46A302" />

        {/* ── Wings (darker green, angled sides) ── */}
        <path
          d="M16 58 C6 66 4 82 18 84 C14 76 12 66 16 58Z"
          fill="#46A302"
        />
        <path
          d="M104 58 C114 66 116 82 102 84 C106 76 108 66 104 58Z"
          fill="#46A302"
        />

        {/* ── Belly patch (lighter green) ── */}
        <ellipse cx="60" cy="82" rx="26" ry="28" fill="#89E219" />

        {/* ── Eye whites (large circles) ── */}
        <circle cx="42" cy="50" r="19" fill="#FFFFFF" />
        <circle cx="78" cy="50" r="19" fill="#FFFFFF" />

        {/* ── Eye irises (dark) ── */}
        <circle cx="44" cy="51" r="11" fill="#1C2B33" />
        <circle cx="76" cy="51" r="11" fill="#1C2B33" />

        {/* ── Pupil highlights ── */}
        <circle cx="47" cy="47" r="4" fill="#FFFFFF" />
        <circle cx="79" cy="47" r="4" fill="#FFFFFF" />
        <circle cx="42" cy="54" r="2" fill="#FFFFFF" />
        <circle cx="74" cy="54" r="2" fill="#FFFFFF" />

        {/* ── Beak (orange diamond shape) ── */}
        <path d="M52 58 L60 72 L68 58 Z" fill="#FF9600" />
        <path d="M54 58 H66 V62 C66 67 60 70 60 70 C60 70 54 67 54 62 V58Z" fill="#FFC800" />

        {/* ── Rosy cheeks ── */}
        <ellipse cx="26" cy="58" rx="7" ry="4" fill="#FF8484" opacity="0.5" />
        <ellipse cx="94" cy="58" rx="7" ry="4" fill="#FF8484" opacity="0.5" />

        {/* ── Eyebrow lines (gives expressive look) ── */}
        <path d="M33 34 Q42 30 50 33" stroke="#46A302" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M70 33 Q78 30 87 34" stroke="#46A302" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </svg>
    </div>
  );
};
