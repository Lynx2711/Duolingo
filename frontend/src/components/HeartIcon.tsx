// src/components/HeartIcon.tsx — Duolingo Official Red Heart SVG Icon
//
// Shared SVG component for Duolingo's signature red heart with highlight specular,
// ensuring 100% visual consistency across TopBar, Lesson, Shop, OutOfHeartsModal, etc.

import React from "react";

interface HeartIconProps {
  size?: number;
  className?: string;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ size = 20, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart Body */}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#FF4B4B"
      />
      {/* Heart Specular Highlight */}
      <circle cx="8" cy="7.5" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );
};
