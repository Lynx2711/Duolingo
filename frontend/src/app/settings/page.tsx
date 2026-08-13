// src/app/settings/page.tsx — Settings Page
//
// OVERVIEW:
//   A clean, Duolingo-aesthetic settings page with four section cards:
//     1. Account         — username, email, password (coming soon)
//     2. Notifications   — push, email, streak reminders (coming soon)
//     3. Appearance      — dark/light mode note (DarkModeToggle lives in TopBar)
//     4. Sound & Haptics — lesson sounds, correct answer sfx (coming soon)
//
// Each item in a section uses a row with:
//   - Label (left)
//   - Coming Soon badge (right) — styled like a small pill
//
// No API calls needed — this is a pure UI placeholder.

"use client";

import React from "react";
// Fixed left navigation sidebar
import { Sidebar } from "@/components/Sidebar";
// DarkModeToggle — embedded in the Appearance section so users can toggle here too
import { DarkModeToggle } from "@/components/DarkModeToggle";

// ── Types ─────────────────────────────────────────────────────────────────────

// Shape of a single settings row item
interface SettingItem {
  label: string;         // Row label text
  description?: string;  // Optional sub-text shown below the label
  action?: "toggle" | "dark-mode" | "coming-soon"; // What the row does
}

// Shape of a settings section (group of rows)
interface SettingSection {
  title: string;          // Section header text
  icon: string;           // Section emoji icon
  items: SettingItem[];   // Rows in this section
}

// ── Settings data ─────────────────────────────────────────────────────────────

// All setting sections with their items.
// Easily extensible — just add to the array below.
const SETTINGS_SECTIONS: SettingSection[] = [
  {
    title: "Account",
    icon: "👤",
    items: [
      { label: "Username",        description: "Change your display name" },
      { label: "Email Address",   description: "Update your login email" },
      { label: "Password",        description: "Change your password" },
      { label: "Linked Accounts", description: "Connect Google or Apple" },
      { label: "Delete Account",  description: "Permanently remove your data" },
    ],
  },
  {
    title: "Notifications",
    icon: "🔔",
    items: [
      { label: "Push Notifications",    description: "Daily reminders on your device" },
      { label: "Email Reminders",        description: "Weekly progress emails" },
      { label: "Streak Freeze Alerts",   description: "Warn before you lose your streak" },
      { label: "Friend Activity",        description: "Get notified when friends complete lessons" },
    ],
  },
  {
    title: "Appearance",
    icon: "🎨",
    items: [
      {
        label: "Dark Mode",
        description: "Toggle between dark and light theme",
        action: "dark-mode", // Special — renders DarkModeToggle instead of badge
      },
      { label: "Font Size",     description: "Adjust text size for readability" },
      { label: "High Contrast", description: "Improve accessibility with higher contrast" },
    ],
  },
  {
    title: "Sound & Haptics",
    icon: "🔊",
    items: [
      { label: "Lesson Sounds",          description: "Sound effects during exercises" },
      { label: "Correct Answer Sound",   description: "Play a chime for correct answers" },
      { label: "Speaking Exercises",     description: "Enable microphone for speaking tasks" },
      { label: "Vibration / Haptics",    description: "Tactile feedback on mobile" },
    ],
  },
];

// ── ComingSoonBadge Sub-component ─────────────────────────────────────────────

// Small pill-shaped badge shown on the right side of most setting rows
function ComingSoonBadge() {
  return (
    <span
      className="px-3 py-1 text-xs font-extrabold rounded-duo-pill uppercase tracking-wide"
      style={{
        background: "var(--background-hover)",
        color: "var(--text-tertiary)",
        border: "1.5px solid var(--border)",
      }}
    >
      Soon
    </span>
  );
}

// ── SettingRow Sub-component ──────────────────────────────────────────────────

// A single row within a settings section
function SettingRow({ item }: { item: SettingItem }) {
  return (
    <div
      className="flex items-center justify-between py-3.5 px-1 transition-colors"
    >
      {/* Left: label + optional description */}
      <div>
        <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
          {item.label}
        </p>
        {item.description && (
          <p className="text-xs mt-0.5 font-semibold" style={{ color: "var(--text-secondary)" }}>
            {item.description}
          </p>
        )}
      </div>

      {/* Right: DarkModeToggle for the appearance row, badge for everything else */}
      {item.action === "dark-mode" ? (
        // Embed the actual dark mode toggle button
        <DarkModeToggle />
      ) : (
        // All other rows show a coming-soon badge
        <ComingSoonBadge />
      )}
    </div>
  );
}

// ── SettingSection Sub-component ──────────────────────────────────────────────

// A titled card containing a group of SettingRow components
function SettingSectionCard({ section }: { section: SettingSection }) {
  return (
    <div
      className="rounded-duo-xl border-2 overflow-hidden"
      style={{
        background: "var(--background-secondary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b-2"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Section icon */}
        <span className="text-lg">{section.icon}</span>
        {/* Section title */}
        <h2 className="font-black text-sm uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          {section.title}
        </h2>
      </div>

      {/* Rows */}
      <div className="px-5 divide-y" style={{ borderColor: "var(--border)" }}>
        {section.items.map((item, i) => (
          // Divider between rows — uses the CSS variable border color
          <div key={i} style={{ borderColor: "var(--border)" }}>
            <SettingRow item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SettingsPage Component
// ══════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  return (
    // Full-height wrapper with the global background color
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* ── LEFT: Fixed sidebar navigation ── */}
      <Sidebar activeKey="more" />

      {/* ── MAIN: settings content ── */}
      {/* ml-[220px]: compensates for the fixed sidebar */}
      <main className="flex-1 ml-0 md:ml-[220px] px-4 md:px-8 py-8 max-w-2xl animate-fade-in">

        {/* Page heading */}
        <div className="mb-8">
          <h1
            className="text-2xl font-black uppercase tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            Settings
          </h1>
          <p className="text-sm font-bold mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage your account and preferences
          </p>
        </div>

        {/* Settings section cards — stacked vertically */}
        <div className="space-y-4">
          {SETTINGS_SECTIONS.map((section) => (
            <SettingSectionCard key={section.title} section={section} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-xs font-bold" style={{ color: "var(--text-tertiary)" }}>
            Duolingo Clone • Version 0.1.0
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
            Most settings are coming soon ✨
          </p>
        </div>
      </main>
    </div>
  );
}
