// Import the Tailwind CSS Config type for type-safe configuration
import type { Config } from "tailwindcss";

// Define the Tailwind CSS configuration object
const config: Config = {
  // Tell Tailwind which files to scan for class names (purges unused CSS in production)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Scan pages directory (if using Pages Router)
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Scan all component files
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Scan all App Router files
  ],
  // Use 'class' strategy for dark mode so we can toggle it via JavaScript
  // instead of relying on the OS preference (prefers-color-scheme)
  darkMode: "class",
  theme: {
    extend: {
      // ===== DUOLINGO COLOR PALETTE =====
      // These colors are sourced from Duolingo's official brand guidelines
      // and are used consistently across the app for visual identity
      colors: {
        // --- Primary Brand Colors ---
        // "Feather Green" — the signature Duolingo green, used for primary CTAs and success states
        "feather": "#58CC02",
        // Darker shade of Feather Green for hover states and bottom-border 3D effects
        "feather-dark": "#46A302",
        // --- Secondary Accent Colors ---
        // "Macaw Blue" — used for informational elements, links, and secondary actions
        "macaw": "#1CB0F6",
        // Darker shade for hover/pressed states on blue elements
        "macaw-dark": "#1899D6",
        // "Cardinal Red" — used for errors, wrong answers, and heart indicators
        "cardinal": "#FF4B4B",
        // Darker shade for hover states on red elements
        "cardinal-dark": "#EA2B2B",
        // "Bee Yellow" — used for streak indicators, warnings, and crown icons
        "bee": "#FFC800",
        // Darker shade for hover states
        "bee-dark": "#E5B800",
        // "Fox Orange" — used for XP indicators and fire/streak icons
        "fox": "#FF9600",
        // "Beetle Purple" — used for legendary challenges and premium features
        "beetle": "#CE82FF",
        // Darker shade for hover states
        "beetle-dark": "#B966E6",
        // --- Neutral Colors (named after animals, per Duolingo's system) ---
        // "Eel" — primary text color on light backgrounds
        "eel": "#4B4B4B",
        // "Wolf" — secondary text color for less prominent text
        "wolf": "#777777",
        // "Hare" — tertiary text, placeholders, disabled states
        "hare": "#AFAFAF",
        // "Swan" — borders, dividers, and subtle separators
        "swan": "#E5E5E5",
        // "Polar" — very light background for cards, input fields
        "polar": "#F7F7F7",
        // "Snow" — pure white background
        "snow": "#FFFFFF",
        // --- Dark Mode Specific Colors ---
        // Dark background matching Duolingo's dark theme
        "dark-bg": "#131F24",
        // Slightly elevated dark surface (for cards, modals)
        "dark-elevated": "#1A2C32",
        // Borders in dark mode
        "dark-border": "#37464F",
        // Text colors for dark mode
        "dark-text": "#D1D8DB",
        "dark-text-secondary": "#8A9BA3",
      },
      // ===== TYPOGRAPHY =====
      // Duolingo uses "DIN Round" as their primary font, with fallbacks
      fontFamily: {
        // Primary font stack — "DIN Round Pro" is Duolingo's brand font
        // We fall back to system UI fonts for performance when DIN Round is unavailable
        "din": ['"DIN Round Pro"', '"Nunito"', "system-ui", "sans-serif"],
        // Monospace font for code-like elements (exercise type indicators, etc.)
        "mono": ['"JetBrains Mono"', "monospace"],
      },
      // ===== BORDER RADIUS =====
      // Duolingo uses generously rounded corners for a friendly, approachable feel
      borderRadius: {
        // Small radius for input fields and minor UI elements (like chips)
        "duo-sm": "8px",
        // Medium radius for buttons and interactive elements
        "duo-md": "12px",
        // Large radius for cards, modals, and content containers
        "duo-lg": "16px",
        // Extra large radius for prominent UI sections
        "duo-xl": "20px",
        // Pill shape for tags, badges, and rounded buttons
        "duo-pill": "9999px",
      },
      // ===== BOX SHADOWS =====
      // Duolingo's signature 3D "tactile" button effect uses a colored bottom border/shadow
      boxShadow: {
        // 3D shadow for the primary green button — creates a "raised" look
        "duo-green": "0 4px 0 #46A302",
        // 3D shadow for blue buttons
        "duo-blue": "0 4px 0 #1899D6",
        // 3D shadow for red/danger buttons
        "duo-red": "0 4px 0 #EA2B2B",
        // 3D shadow for neutral/gray buttons (like "Skip" or secondary actions)
        "duo-gray": "0 4px 0 #E5E5E5",
        // 3D shadow for disabled buttons
        "duo-disabled": "0 4px 0 #E5E5E5",
        // Subtle card shadow for elevated content
        "duo-card": "0 2px 8px rgba(0, 0, 0, 0.08)",
        // Stronger shadow for modals and overlays
        "duo-modal": "0 8px 32px rgba(0, 0, 0, 0.15)",
        // Dark mode card shadow — slightly stronger to stand out against dark bg
        "duo-card-dark": "0 2px 8px rgba(0, 0, 0, 0.3)",
      },
      // ===== ANIMATIONS =====
      // Micro-animations for Duolingo's playful, gamified feel
      keyframes: {
        // Bounce animation for correct answer celebrations
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Shake animation for wrong answer feedback
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        // Slide up animation for feedback bars and modals
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // Fade in animation for smooth transitions
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Pulse animation for streak counter and XP gains
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(88, 204, 2, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(88, 204, 2, 0)" },
        },
        // Progress bar fill animation
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width, 100%)" },
        },
        // Owl mascot bounce — gentle vertical bob like Duolingo's Duo
        "owl-jump": {
          "0%, 100%": { transform: "translateY(0px)" },
          "40%": { transform: "translateY(-10px)" },
          "60%": { transform: "translateY(-7px)" },
        },
        // Pulsing ring for the active/next available skill node
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.18)", opacity: "0.3" },
          "100%": { transform: "scale(1)", opacity: "0.8" },
        },
        // Gentle float for popovers
        "float-in": {
          "0%": { transform: "translateY(8px) scale(0.97)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
      // Map keyframes to animation utility classes
      animation: {
        "bounce-in": "bounce-in 0.4s ease-out",       // For correct answer pop
        "shake": "shake 0.5s ease-in-out",             // For wrong answer shake
        "slide-up": "slide-up 0.3s ease-out",          // For bottom sheets / feedback bars
        "fade-in": "fade-in 0.2s ease-out",            // For general transitions
        "pulse-glow": "pulse-glow 2s infinite",        // For streak/XP highlights
        "progress-fill": "progress-fill 0.8s ease-out", // For lesson progress bar
        "owl-jump": "owl-jump 1.2s ease-in-out infinite",  // Duo mascot bob
        "pulse-ring": "pulse-ring 1.8s ease-in-out infinite", // Active node halo
        "float-in": "float-in 0.25s ease-out",        // Popover entrance
      },
      // ===== SPACING =====
      // Duolingo uses a 4px grid system for consistent spacing
      spacing: {
        "duo-1": "4px",   // Tightest spacing (icon gaps)
        "duo-2": "8px",   // Small spacing (between text elements)
        "duo-3": "12px",  // Medium spacing (padding inside buttons)
        "duo-4": "16px",  // Standard spacing (card padding)
        "duo-5": "20px",  // Comfortable spacing (section gaps)
        "duo-6": "24px",  // Large spacing (between major sections)
        "duo-8": "32px",  // Extra large spacing (page margins)
      },
    },
  },
  // No additional plugins needed for now
  plugins: [],
};

// Export the configuration for Tailwind to use
export default config;
