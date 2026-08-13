// src/components/RightSidebar.tsx — Desktop Right Widgets Sidebar
//
// Recreates Duolingo's right desktop panel exactly:
// 1. Super Duolingo Promo Box (purple gradient, animated owl emoji top-right)
// 2. Leaderboard Widget (silver shield, "Better luck next time!" message)
// 3. Daily Quests Widget (XP quest with progress bar)
// 4. Footer links

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { leaderboardApi } from "@/lib/api";

interface RightSidebarProps {
  user?: {
    xp_total: number;
    daily_goal_xp: number;
  } | null;
}

interface LeaderboardUser {
  id: number;
  name: string;
  xp_total: number;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ user }) => {
  const [topLearners, setTopLearners] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    leaderboardApi
      .getLeaderboard()
      .then((data: unknown) => {
        if (Array.isArray(data)) setTopLearners(data.slice(0, 3));
      })
      .catch(() => null);
  }, []);

  // Daily XP quest: progress toward 10 XP
  const dailyGoal = 10;
  const earnedToday = user ? Math.min(dailyGoal, user.xp_total % dailyGoal) : 0;
  const questPct = Math.round((earnedToday / dailyGoal) * 100);

  return (
    <aside className="w-[340px] flex-shrink-0 space-y-4 hidden lg:flex lg:flex-col select-none pt-1">

      {/* ── 1. Super Duolingo Promo ── */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "var(--background-secondary)",
          border: "2px solid var(--border)",
        }}
      >
        {/* "SUPER" badge + owl top-right */}
        <div className="flex items-start justify-between mb-3">
          <span
            className="text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(90deg, #CE82FF, #1CB0F6)" }}
          >
            SUPER
          </span>
          {/* Duolingo super owl illustration (colorful gradient owl) */}
          <div className="w-14 h-14 -mt-1 -mr-1 flex items-center justify-center text-3xl animate-bounce">
            🦉✨
          </div>
        </div>

        <h4 className="font-extrabold text-base text-[var(--text-primary)] mb-1">
          Try Super for free
        </h4>
        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          No ads, personalized practice, and unlimited Legendary!
        </p>

        <button
          className="w-full py-3 rounded-xl font-black text-sm text-white uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "linear-gradient(90deg, #5B4FE9, #1CB0F6)", boxShadow: "0 4px 0 #3B2FC0" }}
        >
          TRY 1 WEEK FREE
        </button>
      </div>

      {/* ── 2. Leaderboards Widget ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--background-secondary)",
          border: "2px solid var(--border)",
        }}
      >
        {/* Header */}
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
          LEADERBOARDS
        </p>

        {topLearners.length > 0 ? (
          <>
            <div className="space-y-2 mb-4">
              {topLearners.map((learner, idx) => (
                <div
                  key={learner.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: "var(--background-hover)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-center font-black text-[var(--text-tertiary)]">{idx + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-[#37464F] flex items-center justify-center text-xs">👤</div>
                    <span className="text-[var(--text-primary)]">{learner.name}</span>
                  </div>
                  <span className="text-[#FF9600] font-black">{learner.xp_total} XP</span>
                </div>
              ))}
            </div>
            <Link href="/leaderboard">
              <button
                className="w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider text-[var(--text-secondary)] transition-all hover:bg-[var(--background-hover)]"
                style={{ border: "2px solid var(--border)" }}
              >
                VIEW LEADERBOARD
              </button>
            </Link>
          </>
        ) : (
          <>
            {/* Default state matching screenshot: silver shield + "Better luck next time" */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h4 className="font-extrabold text-sm text-[var(--text-primary)] mb-1">
                  Better luck next time!
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  You finished #17 and dropped down to the Silver League
                </p>
              </div>
              {/* Silver shield icon */}
              <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl"
                   style={{ background: "var(--background-hover)" }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 6v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z" fill="#C0C0C0"/>
                  <path d="M12 2L3 6v5c0 5.5 3.8 10.7 9 12" fill="#A8A8A8"/>
                  <path d="M12 4.5L5 8v4c0 4.4 3.1 8.5 7 9.8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                </svg>
              </div>
            </div>
            <Link href="/leaderboard">
              <button
                className="w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: "#1CB0F6", boxShadow: "0 4px 0 #1899D6" }}
              >
                GO TO LEADERBOARDS
              </button>
            </Link>
          </>
        )}
      </div>

      {/* ── 3. Daily Quests Widget ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--background-secondary)",
          border: "2px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
            Daily Quests
          </p>
          <span className="text-xs font-black text-[#1CB0F6] cursor-pointer hover:underline">
            VIEW ALL
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Lightning bolt */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#FFC800" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
            </svg>
          </div>

          {/* XP quest + progress bar */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold text-[var(--text-primary)]">Earn 10 XP</span>
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                {earnedToday} / {dailyGoal}
              </span>
            </div>
            {/* Progress track */}
            <div className="h-3.5 rounded-full overflow-hidden" style={{ background: "var(--background-hover)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${questPct}%`, background: "#FFC800" }}
              />
            </div>
          </div>

          {/* Gift box reward icon */}
          <div className="flex-shrink-0 text-xl">🎁</div>
        </div>
      </div>

      {/* ── 4. Footer links ── */}
      <footer className="px-2 text-[11px] font-bold text-[var(--text-tertiary)] flex flex-wrap gap-x-2 gap-y-1 justify-center uppercase">
        {["ABOUT","BLOG","STORE","EFFICACY","CAREERS","INVESTORS","TERMS","PRIVACY"].map((item, i, arr) => (
          <React.Fragment key={item}>
            <span className="hover:underline cursor-pointer">{item}</span>
            {i < arr.length - 1 && <span className="text-[var(--border)]">·</span>}
          </React.Fragment>
        ))}
      </footer>
    </aside>
  );
};
