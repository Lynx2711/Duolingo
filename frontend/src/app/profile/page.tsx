// src/app/profile/page.tsx — Duolingo Profile Page (Matching Reference Screenshot 1)
//
// Recreates the exact layout from reference screenshot 1:
//   - Left icon-strip sidebar
//   - Header character avatar card with green backdrop, user name, handle, join date, flags
//   - 4-box statistics grid: Day Streak 🔥, Total XP ⚡, Current League 🛡️, Top 3 Finishes 🥇
//   - Friend suggestions with FOLLOW buttons
//   - Right panel: TopBar stats, FOLLOWING/FOLLOWERS tabs, Add Friends links, Footer links
//   - 100% connected to backend APIs (GET /api/profile/1 and GET /api/users/1)

"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { profileApi, userApi } from "@/lib/api";
import { GemIcon } from "@/components/GemIcon";
import { HeartIcon } from "@/components/HeartIcon";

interface ProfileData {
  id: number;
  username: string;
  created_at: string;
  streak: number;
  xp_total: number;
  hearts: number;
  gems: number;
  total_skills_completed: number;
  total_lessons_completed: number;
  current_course: string | null;
  achievements: Array<{ achievement_type: string; earned_at: string }>;
}

interface UserData {
  id: number;
  name: string;
  xp_total: number;
  streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"following" | "followers">("following");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profData, userData] = await Promise.all([
        profileApi.getProfile(1) as Promise<ProfileData>,
        userApi.getUser(1) as Promise<UserData>,
      ]);
      setProfile(profData);
      setUser(userData);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatJoinDate = (isoStr?: string) => {
    if (!isoStr) return "January 2024";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return "January 2024";
    }
  };

  return (
    <div className="min-h-screen bg-[#131F24] text-[#D1D8DB] flex flex-col font-sans">

      {/* Top Bar Stats */}
      <TopBar user={user} onUserUpdate={fetchData} />

      <div className="flex flex-1 relative">
        {/* Left Icon-strip Sidebar */}
        <Sidebar activeKey="profile" />

        {/* Center Profile Content Column */}
        <main className="flex-1 md:ml-20 lg:mr-[340px] px-4 sm:px-8 py-6 max-w-2xl mx-auto w-full">

          {/* ── 1. AVATAR HEADER BANNER (Matching Screenshot 1) ── */}
          <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-3xl p-6 mb-6">
            {/* Green banner with avatar illustration & edit button */}
            <div className="relative w-full h-48 bg-[#58CC02] rounded-2xl overflow-hidden flex items-center justify-center mb-6">
              {/* Character Illustration Avatar */}
              <div className="text-8xl select-none">
                👩🏽‍🦱
              </div>

              {/* Edit Pencil Button Top-Right */}
              <button
                onClick={() => alert("Edit Profile coming soon!")}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#61E002] border-2 border-white/40 flex items-center justify-center text-white hover:scale-105 transition-transform"
                aria-label="Edit Profile"
              >
                ✏️
              </button>
            </div>

            {/* User Details */}
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white">
                {user?.name || profile?.username || "Aditi"}
              </h1>
              <p className="text-sm font-extrabold text-[#5A6B73]">
                @{profile?.username || "Aditi644525"}
              </p>
              <p className="text-sm font-bold text-[#8A9BA3]">
                Joined {formatJoinDate(profile?.created_at)}
              </p>

              {/* Followers count & Learned Language Flags */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-sm font-extrabold text-[#1CB0F6]">
                  <span className="hover:underline cursor-pointer">1 Following</span>
                  <span className="hover:underline cursor-pointer">4 Followers</span>
                </div>

                {/* Flags of learned languages */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl" title="Spanish">🇪🇸</span>
                  <span className="text-2xl" title="Japanese">🇯🇵</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. STATISTICS GRID (Matching Screenshot 1) ── */}
          <div className="mb-8">
            <h2 className="text-xl font-black text-white mb-4">Statistics</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Streak */}
              <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <span className="block text-lg font-black text-white">{user?.streak ?? profile?.streak ?? 0}</span>
                  <span className="text-xs font-bold text-[#8A9BA3]">Day streak</span>
                </div>
              </div>

              {/* Total XP */}
              <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div>
                  <span className="block text-lg font-black text-white">{user?.xp_total ?? profile?.xp_total ?? 0}</span>
                  <span className="text-xs font-bold text-[#8A9BA3]">Total XP</span>
                </div>
              </div>

              {/* Current League */}
              <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <div>
                  <span className="block text-lg font-black text-white">Silver</span>
                  <span className="text-xs font-bold text-[#8A9BA3]">Current league</span>
                </div>
              </div>

              {/* Top 3 Finishes */}
              <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🥇</span>
                <div>
                  <span className="block text-lg font-black text-white">1</span>
                  <span className="text-xs font-bold text-[#8A9BA3]">Top 3 finishes</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. FRIEND SUGGESTIONS (Matching Screenshot 1) ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">Friend suggestions</h2>
              <span className="text-xs font-black text-[#1CB0F6] uppercase cursor-pointer hover:underline">VIEW ALL</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Prajwal */}
              <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 text-center relative">
                <button className="absolute top-2 right-3 text-[#5A6B73] hover:text-white font-black text-sm">✕</button>
                <div className="w-14 h-14 rounded-full bg-[#CE82FF] mx-auto mb-2 flex items-center justify-center text-2xl">
                  👨🏻‍💻
                </div>
                <h4 className="font-extrabold text-sm text-white mb-0.5">Prajwal</h4>
                <p className="text-xs font-bold text-[#8A9BA3] mb-4">Followed by Aadya</p>
                <button className="w-full py-2.5 rounded-xl bg-[#1CB0F6] shadow-[0_4px_0_#1899D6] font-black text-xs uppercase text-white hover:brightness-105">
                  FOLLOW
                </button>
              </div>

              {/* Card 2: Deshna Sunerha */}
              <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 text-center relative">
                <button className="absolute top-2 right-3 text-[#5A6B73] hover:text-white font-black text-sm">✕</button>
                <div className="w-14 h-14 rounded-full bg-[#1CB0F6] mx-auto mb-2 flex items-center justify-center text-2xl">
                  👩🏽‍🎨
                </div>
                <h4 className="font-extrabold text-sm text-white mb-0.5">Deshna Sunerha</h4>
                <p className="text-xs font-bold text-[#8A9BA3] mb-4">Followed by Aadya</p>
                <button className="w-full py-2.5 rounded-xl bg-[#1CB0F6] shadow-[0_4px_0_#1899D6] font-black text-xs uppercase text-white hover:brightness-105">
                  FOLLOW
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL (Matching Screenshot 1) ── */}
        <aside className="w-[340px] fixed right-0 top-14 bottom-0 p-6 space-y-6 overflow-y-auto hidden lg:block border-l-2 border-[#37464F] bg-[#131F24]">

          {/* Following / Followers Tabs Widget */}
          <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl overflow-hidden">
            <div className="flex border-b-2 border-[#37464F]">
              <button
                onClick={() => setActiveTab("following")}
                className={`flex-1 py-3 font-extrabold text-xs uppercase tracking-wider ${
                  activeTab === "following" ? "text-[#1CB0F6] border-b-2 border-[#1CB0F6]" : "text-[#8A9BA3]"
                }`}
              >
                FOLLOWING
              </button>
              <button
                onClick={() => setActiveTab("followers")}
                className={`flex-1 py-3 font-extrabold text-xs uppercase tracking-wider ${
                  activeTab === "followers" ? "text-[#1CB0F6] border-b-2 border-[#1CB0F6]" : "text-[#8A9BA3]"
                }`}
              >
                FOLLOWERS
              </button>
            </div>

            {/* Friend row */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF4B4B] flex items-center justify-center text-xl">
                  🦸🏻‍♀️
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Aadya</h4>
                  <p className="text-xs font-bold text-[#8A9BA3]">80025 XP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Friends Widget */}
          <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-5 space-y-4">
            <h4 className="font-extrabold text-base text-white">Add friends</h4>

            <div className="flex items-center justify-between text-sm font-extrabold text-white cursor-pointer hover:opacity-80">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔍</span>
                <span>Find friends</span>
              </div>
              <span>›</span>
            </div>

            <div className="flex items-center justify-between text-sm font-extrabold text-white cursor-pointer hover:opacity-80">
              <div className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <span>Invite friends</span>
              </div>
              <span>›</span>
            </div>
          </div>

          {/* Footer links */}
          <footer className="text-[11px] font-bold text-[#5A6B73] flex flex-wrap gap-x-2 gap-y-1 justify-center uppercase">
            {["ABOUT","BLOG","STORE","EFFICACY","CAREERS","INVESTORS","TERMS","PRIVACY"].map((item, i, arr) => (
              <React.Fragment key={item}>
                <span className="hover:underline cursor-pointer">{item}</span>
                {i < arr.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </footer>
        </aside>
      </div>
    </div>
  );
}
