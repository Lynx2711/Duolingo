// src/app/leaderboard/page.tsx — Duolingo Leaderboards Page (Matching Reference Screenshot 2)
//
// Recreates the exact layout from reference screenshot 2:
//   - Top League Shields carousel (Bronze, Silver active feather shield, Gold locked, Sapphire locked)
//   - Heading: "Silver League" & "Complete a lesson to join this week's leaderboard"
//   - CTA: "START A LESSON" button
//   - Live ranked list from GET /api/leaderboard/
//   - Bottom sticky current user row: "- [Avatar] Aditi (or Alex)  0 XP (or live xp_total)"
//   - Right panel: "Set your status" widget with interactive emoji picker grid
//   - 100% connected to backend APIs (GET /api/leaderboard/ and GET /api/users/1)

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { leaderboardApi, userApi } from "@/lib/api";

interface LeaderboardUser {
  id: number;
  name: string;
  xp_total: number;
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

const EMOJI_STATUSES = ["🕶️", "🎉", "💪", "👀", "🍿", "🇪🇸", "🦉", "💯", "💩", "🏆", "🍿", "🐱"];

export default function LeaderboardPage() {
  const [boardUsers, setBoardUsers] = useState<LeaderboardUser[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("🐱");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [boardData, userData] = await Promise.all([
        leaderboardApi.getLeaderboard() as Promise<LeaderboardUser[]>,
        userApi.getUser(1) as Promise<UserData>,
      ]);
      setBoardUsers(boardData);
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

  return (
    <div className="min-h-screen bg-[#131F24] text-[#D1D8DB] flex flex-col font-sans">

      <TopBar user={user} onUserUpdate={fetchData} />

      <div className="flex flex-1 relative">
        <Sidebar activeKey="leaderboards" />

        {/* Center Main Leaderboard Content */}
        <main className="flex-1 md:ml-20 lg:mr-[340px] px-4 sm:px-8 py-6 max-w-2xl mx-auto w-full">

          {/* ── 1. LEAGUE SHIELDS HEADER CAROUSEL (Matching Screenshot 2) ── */}
          <div className="flex flex-col items-center text-center mb-8">

            {/* Shields Row */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Bronze Shield */}
              <div className="w-12 h-14 bg-[#C084FC]/20 border-2 border-[#86198F] rounded-2xl flex items-center justify-center opacity-40">
                🛡️
              </div>

              {/* Silver Shield (ACTIVE FEATURED LEAGUE) */}
              <div className="w-16 h-20 bg-[#37464F] border-2 border-[#8A9BA3] rounded-3xl flex items-center justify-center text-3xl shadow-xl animate-bounce-in">
                🪶
              </div>

              {/* Gold Shield (Locked) */}
              <div className="w-12 h-14 bg-[#37464F] border-2 border-[#37464F] rounded-2xl flex items-center justify-center text-lg opacity-40">
                🔒
              </div>

              {/* Sapphire Shield (Locked) */}
              <div className="w-12 h-14 bg-[#37464F] border-2 border-[#37464F] rounded-2xl flex items-center justify-center text-lg opacity-40">
                🔒
              </div>
            </div>

            {/* League Heading */}
            <h1 className="text-3xl font-black text-white mb-2">
              Silver League
            </h1>

            <p className="text-sm font-bold text-[#8A9BA3] max-w-md mb-6">
              Complete a lesson to join this week&apos;s leaderboard
            </p>

            {/* START A LESSON CTA Button */}
            <Link href="/lesson/1">
              <button className="px-8 py-3.5 rounded-2xl bg-[#1A2C32] border-2 border-[#37464F] text-[#1CB0F6] font-black text-sm uppercase tracking-wider hover:bg-[#233A42] active:scale-95 transition-all">
                START A LESSON
              </button>
            </Link>
          </div>

          {/* ── 2. RANKED LEADERBOARD LIST (Matching Screenshot 2) ── */}
          <div className="space-y-3 mb-16">
            {boardUsers.map((learner, idx) => (
              <div
                key={learner.id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  learner.id === user?.id
                    ? "bg-[#58CC02]/10 border-[#58CC02] text-white"
                    : "bg-[#1A2C32] border-[#37464F] text-[#D1D8DB]"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank indicator dot/number */}
                  <span className="w-6 text-center font-black text-base text-[#5A6B73]">
                    {idx + 1}
                  </span>

                  {/* Avatar circle */}
                  <div className="w-10 h-10 rounded-full bg-[#37464F] flex items-center justify-center font-black text-white text-base">
                    {learner.name[0]}
                  </div>

                  {/* Name */}
                  <span className="font-extrabold text-base text-white">
                    {learner.name}
                  </span>
                </div>

                {/* Live XP Total */}
                <span className="font-black text-sm text-[#FF9600]">
                  {learner.xp_total} XP
                </span>
              </div>
            ))}
          </div>

          {/* ── 3. STICKY CURRENT USER BOTTOM BAR (Matching Screenshot 2) ── */}
          <div className="fixed bottom-4 left-4 md:left-24 right-4 lg:right-[360px] z-30 max-w-2xl mx-auto">
            <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-[#5A6B73]">-</span>

                {/* User avatar with status bubble overlay */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#58CC02] flex items-center justify-center font-black text-white text-base">
                    {(user?.name || "A")[0]}
                  </div>
                  {/* Status emoji bubble */}
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-xs shadow-md">
                    {selectedStatus}
                  </div>
                </div>

                <span className="font-extrabold text-base text-white">
                  {user?.name || "Aditi"}
                </span>
              </div>

              {/* Current user's live XP total */}
              <span className="font-black text-sm text-[#8A9BA3]">
                {user?.xp_total ?? 0} XP
              </span>
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL: SET YOUR STATUS WIDGET (Matching Screenshot 2) ── */}
        <aside className="w-[340px] fixed right-0 top-14 bottom-0 p-6 space-y-6 overflow-y-auto hidden lg:block border-l-2 border-[#37464F] bg-[#131F24]">

          {/* Set your status Widget */}
          <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-base text-white">Set your status</h4>
              <button onClick={() => setSelectedStatus("🐱")} className="text-xs font-black text-[#1CB0F6] uppercase hover:underline">
                CLEAR
              </button>
            </div>

            {/* Avatar display with selected status speech bubble */}
            <div className="flex justify-center py-2 relative">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#58CC02] flex items-center justify-center text-4xl text-white">
                  👩🏽‍🦱
                </div>
                {/* Selected Status Bubble */}
                <div className="absolute -top-3 -right-2 bg-white text-black p-1.5 rounded-2xl shadow-xl text-lg border-2 border-[#37464F] animate-bounce-in">
                  {selectedStatus}
                </div>
              </div>
            </div>

            {/* Status Emoji Selector Grid */}
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_STATUSES.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedStatus(emoji)}
                  className={`w-10 h-10 rounded-xl bg-[#131F24] border-2 ${
                    selectedStatus === emoji ? "border-[#58CC02] bg-[#58CC02]/20" : "border-[#37464F]"
                  } flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all`}
                >
                  {emoji}
                </button>
              ))}
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
