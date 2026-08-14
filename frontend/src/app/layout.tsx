// src/app/layout.tsx — Root Next.js Layout (OVERWRITTEN)
//
// This is the outermost shell for every page in the app.
// It defines:
//   1. Google Fonts import (Nunito — closest free approximation of DIN Round)
//   2. Global metadata for SEO (title, description, open graph tags)
//   3. DarkModeProvider — reads localStorage and sets .dark on <html>
//   4. Global CSS via globals.css
//
// WHY is this a Server Component (no "use client")?
// Next.js requires the root layout to be a Server Component so it can
// export `metadata`. The DarkModeProvider bridges client-side logic.
//
// WHY suppressHydrationWarning on <html>?
// DarkModeProvider modifies the className of <html> on the client after SSR.
// Without suppressHydrationWarning, React would log a hydration mismatch
// warning because the server renders "dark" but the client might change it.

import type { Metadata } from "next";
// Nunito from Google Fonts — 400 (regular), 600 (semibold), 700 (bold),
// 800 (extrabold), 900 (black) — mirrors Duolingo's typographic weight range
import { Nunito } from "next/font/google";
// Global CSS with Tailwind directives and Duolingo CSS design tokens
import "./globals.css";
// DarkModeProvider bootstraps dark/light theme from localStorage on mount
import { DarkModeProvider } from "@/components/DarkModeProvider";

// Initialize Nunito font with the weights Duolingo uses
// subsets: ["latin"] keeps the font bundle small for Latin-script languages
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  // CSS variable name so we can also reference the font via var(--font-nunito)
  variable: "--font-nunito",
  // display: 'swap' prevents invisible text while the font loads
  display: "swap",
});

// =====================================================================
// SEO METADATA
// Individual pages can override any of these values with their own
// `export const metadata` export.
// =====================================================================
export const metadata: Metadata = {
  // Browser tab title and the default for search-engine result titles
  title: "Duolingo Clone",
  // Meta description shown beneath the title in Google search results
  description: "Learn languages for free",
  // Keywords help less-sophisticated crawlers categorize the page
  keywords: ["language learning", "Duolingo", "Spanish", "education", "free"],
  // Canonical author attribution
  authors: [{ name: "Duolingo Clone" }],
  // Open Graph tags — used by Facebook, Twitter cards, Slack previews, etc.
  openGraph: {
    // OG title (can differ from <title> — keep it punchy)
    title: "Duolingo Clone — Learn Languages for Free",
    // OG description shown in social media link previews
    description: "The free, fun, and effective way to learn a language.",
    // Content type: "website" is correct for a web app
    type: "website",
    // Locale for language/region targeting
    locale: "en_US",
  },
  // Twitter-specific card metadata
  twitter: {
    // "summary_large_image" shows a large image preview on Twitter
    card: "summary_large_image",
    title: "Duolingo Clone",
    description: "Learn languages for free",
  },
  // Robots directives for search engine crawlers
  robots: {
    index: true,    // Allow the page to be indexed
    follow: true,   // Allow following links on the page
  },
};

// RootLayout — wraps every page route in the application
export default function RootLayout({
  children,
}: Readonly<{
  // children is the page or nested layout that Next.js injects here
  children: React.ReactNode;
}>) {
  return (
    // lang="en" helps screen readers pick the correct pronunciation engine
    // suppressHydrationWarning: DarkModeProvider may change className client-side
    // className="dark" ensures dark bg is applied server-side before JS runs
    <html lang="en" suppressHydrationWarning className="dark">
      {/*
        Blocking inline script — runs synchronously before any paint.
        Reads localStorage and sets the correct theme class immediately,
        preventing a white flash for dark-mode users on first load.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var t=localStorage.getItem('duo-theme');
                if(t==='light'){
                  document.documentElement.classList.remove('dark');
                }else{
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        // Apply Nunito via the CSS variable AND as a direct class
        // antialiased: enables sub-pixel font smoothing for crisper text
        // bg-[#131F24] is the dark-mode background — fallback before CSS vars resolve
        className={`${nunito.variable} font-[family-name:var(--font-nunito)] antialiased bg-[#131F24]`}
        style={{ background: "var(--background)" }}
      >
        {/*
          DarkModeProvider still handles runtime theme toggling.
          The inline script above handles the critical first paint.
        */}
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}
