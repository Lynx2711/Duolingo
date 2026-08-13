// src/components/DarkModeProvider.tsx — Client-side Dark Mode Bootstrapper
//
// PURPOSE: Reads the user's saved theme preference from localStorage on mount
// and applies the 'dark' class to <html> so CSS variables kick in immediately.
//
// Why "use client"? This component uses browser-only APIs: localStorage and
// document.documentElement — neither of which exist on the server.
//
// Why a separate provider instead of inline in layout.tsx?
// layout.tsx must be a Server Component to export `metadata`. This
// component bridges the gap by running the class-toggle on the client.

"use client";

import React, { useEffect } from "react";

// Props type — this component only wraps children, no other config needed
interface DarkModeProviderProps {
  children: React.ReactNode;
}

// DarkModeProvider reads localStorage('duo-theme') on mount and sets the
// .dark class on <html>. Defaults to dark mode (Duolingo's own default).
export function DarkModeProvider({ children }: DarkModeProviderProps) {
  useEffect(() => {
    // Read stored preference; null means first visit → default to dark
    const savedTheme = localStorage.getItem("duo-theme");

    if (savedTheme === "light") {
      // User explicitly chose light — remove dark class if present
      document.documentElement.classList.remove("dark");
    } else {
      // "dark" or null (first visit) → activate dark mode
      document.documentElement.classList.add("dark");
      // Persist the default so future visits are consistent
      if (!savedTheme) localStorage.setItem("duo-theme", "dark");
    }
  }, []); // Runs once after the first render (client-side only)

  // Render children directly — this component is purely a side-effect wrapper
  return <>{children}</>;
}
