// src/components/DuoMascot.tsx — Duolingo Owl Mascot (Official SVG Graphic)
//
// Renders Duolingo's official Duo owl mascot SVG asset.
// Features gentle up-down jump bounce animation.

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
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      style={{
        animation: "owl-jump 1.2s ease-in-out infinite",
      }}
    >
      <img
        src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg"
        alt="Duo Owl Mascot"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: "contain",
        }}
      />
    </div>
  );
};
