// src/components/GemIcon.tsx — Duolingo Official Gem/Diamond SVG Icon
//
// Shared SVG component for Duolingo's signature blue gem/diamond,
// ensuring 100% visual consistency across TopBar, Lesson, Shop, OutOfHeartsModal, etc.

import React from "react";

interface GemIconProps {
  size?: number;
  className?: string;
}

export const GemIcon: React.FC<GemIconProps> = ({ size = 20, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer polygon facet */}
      <path
        d="M6 2L0 11L6 14L12 11L6 2Z"
        fill="#1CB0F6"
      />
      {/* Top right facet */}
      <path
        d="M6 2L12 11L18 14L12 2Z"
        fill="#58CC02"
        style={{ display: "none" }}
      />
      <path
        d="M18 2L12 11L18 14L24 11L18 2Z"
        fill="#1899D6"
      />
      {/* Center facet */}
      <path
        d="M6 2L12 11L18 2H6Z"
        fill="#4CD6FF"
      />
      {/* Lower facets */}
      <path
        d="M0 11L12 22L6 14L0 11Z"
        fill="#1582B7"
      />
      <path
        d="M24 11L12 22L18 14L24 11Z"
        fill="#1899D6"
      />
      <path
        d="M6 14L12 22L18 14L12 11L6 14Z"
        fill="#1CB0F6"
      />
    </svg>
  );
};
