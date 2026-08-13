// Root layout.tsx — The top-level layout component for the entire application.
// In Next.js App Router, this wraps EVERY page and is where we set up:
// 1. HTML metadata (title, description) for SEO
// 2. Global font imports
// 3. Dark mode class on <html> for Tailwind's 'class' dark mode strategy
// 4. Global CSS import

// Import Next.js Metadata type for type-safe SEO configuration
import type { Metadata } from "next";
// Import the global CSS file that contains our Duolingo design system
import "./globals.css";

// ===================================================================
// SEO METADATA
// This metadata object configures the <head> tags for every page.
// Individual pages can override these values with their own metadata exports.
// ===================================================================
export const metadata: Metadata = {
  // Page title — shown in browser tab and search results
  title: "Lingo — Learn a Language for Free",
  // Meta description — shown in search engine result snippets
  description:
    "Learn Spanish and more with Lingo! The free, fun, and effective way to learn a language. Practice with interactive lessons, earn XP, and maintain your streak.",
  // Keywords for search engine optimization
  keywords: [
    "language learning",
    "Spanish",
    "Duolingo clone",
    "education",
    "gamified learning",
  ],
};

// ===================================================================
// ROOT LAYOUT COMPONENT
// This is the outermost wrapper for all pages in the application.
// It renders the <html> and <body> tags, which means it controls
// global attributes like language, dark mode class, and font.
// ===================================================================
export default function RootLayout({
  children,
}: Readonly<{
  // children is the page content that Next.js injects into this layout
  children: React.ReactNode;
}>) {
  return (
    // Set lang="en" for accessibility (screen readers use this to determine pronunciation)
    // We add the "dark" class by default to match Duolingo's dark charcoal theme.
    <html lang="en" className="dark" suppressHydrationWarning>
      {/* 
        suppressHydrationWarning is needed because we may modify the <html> 
        element's class on the client side (for dark mode), which would cause 
        a mismatch between server-rendered and client-rendered HTML.
      */}
      <body
        // Apply the Nunito font family as the base font for the entire app
        // antialiased enables font smoothing for crisper text rendering
        className="font-din antialiased"
      >
        {/* Render the page content passed by Next.js routing */}
        {children}
      </body>
    </html>
  );
}
