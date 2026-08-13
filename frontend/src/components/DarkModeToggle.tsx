// src/components/DarkModeToggle.tsx — Dark/Light Mode Toggle Button
//
// PURPOSE: A small icon button that lives in the TopBar. Clicking it
// toggles the 'dark' class on <html> and persists the choice in localStorage
// under the key 'duo-theme' — the same key DarkModeProvider reads on boot.
//
// Why "use client"? We read/write document.documentElement.classList and
// localStorage, both of which are browser-only APIs unavailable on the server.

"use client";

import React, { useState, useEffect } from "react";

// DarkModeToggle renders ☀️ when dark mode is ON (click → go light)
//                        and 🌙 when dark mode is OFF (click → go dark)
export function DarkModeToggle() {
  // Track whether we are currently in dark mode.
  // We initialize to true (dark) so it matches DarkModeProvider's default,
  // then sync with reality after the first client render.
  const [isDark, setIsDark] = useState<boolean>(true);

  // After mount, read the actual class on <html> so the icon is correct
  useEffect(() => {
    // Check the live DOM — more reliable than localStorage alone
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // handleToggle — switches the class on <html> and persists the new value
  const handleToggle = () => {
    const html = document.documentElement;

    if (html.classList.contains("dark")) {
      // Currently dark → switch to light
      html.classList.remove("dark");
      localStorage.setItem("duo-theme", "light");
      setIsDark(false); // Update React state so icon re-renders
    } else {
      // Currently light → switch to dark
      html.classList.add("dark");
      localStorage.setItem("duo-theme", "dark");
      setIsDark(true); // Update React state so icon re-renders
    }
  };

  return (
    // Small circular button that fits neatly in the TopBar icon row
    // Uses a subtle hover background that works in both light and dark mode
    <button
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={[
        "w-9 h-9",                              // Fixed square size
        "flex items-center justify-center",     // Center the emoji icon
        "rounded-duo-md",                       // Duolingo-style rounded corners
        "text-xl",                              // Large enough emoji
        "transition-all duration-150",          // Smooth hover feedback
        "hover:bg-[var(--background-hover)]",   // Subtle hover tint
        "border border-transparent",            // Invisible border (reserves space)
        "hover:border-[var(--border)]",         // Border appears on hover
        "cursor-pointer",                       // Pointer hand on hover
      ].join(" ")}
    >
      {/* Show sun ☀️ when dark mode is active (clicking will go light) */}
      {/* Show moon 🌙 when light mode is active (clicking will go dark) */}
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
