// src/components/RightSidebar.tsx — Desktop Right Widgets Sidebar
//
// Compact layout designed to fit 921px viewport height without scrolling.
// Parent (PathPage) controls visibility (hidden lg:flex) and width (260px).

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

  const dailyGoal    = user?.daily_goal_xp ?? 20;
  const earnedToday  = user ? Math.min(dailyGoal, user.xp_total % (dailyGoal || 1)) : 0;
  const questPct     = Math.round((earnedToday / dailyGoal) * 100);

  return (
    <aside className="flex flex-col gap-3 select-none w-full">

      {/* ── 1. Super Duolingo Promo ── */}
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: "var(--background-secondary)", border: "2px solid var(--border)" }}
      >
        <div className="flex items-start justify-between mb-2">
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(90deg, #CE82FF, #1CB0F6)" }}
          >
            SUPER
          </span>
          <span className="text-2xl animate-bounce">🦉✨</span>
        </div>
        <h4 className="font-extrabold text-sm text-[var(--text-primary)] mb-0.5">
          Try Super for free
        </h4>
        <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
          No ads, personalized practice, and unlimited Legendary!
        </p>
        <button
          className="w-full py-2.5 rounded-xl font-black text-xs text-white uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "linear-gradient(90deg, #5B4FE9, #1CB0F6)", boxShadow: "0 3px 0 #3B2FC0" }}
        >
          TRY 1 WEEK FREE
        </button>
      </div>

      {/* ── 2. Leaderboards Widget ── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--background-secondary)", border: "2px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
            Leaderboards
          </p>
          <Link href="/leaderboard">
            <span className="text-[10px] font-black text-[#1CB0F6] cursor-pointer hover:underline uppercase">
              VIEW LEAGUE
            </span>
          </Link>
        </div>

        {topLearners.length > 0 ? (
          <>
            <div className="space-y-1.5 mb-3">
              {topLearners.map((learner, idx) => (
                <div
                  key={learner.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: "var(--background-hover)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-center font-black text-[var(--text-tertiary)]">{idx + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-[#37464F] flex items-center justify-center text-xs">👤</div>
                    <span className="text-[var(--text-primary)] truncate max-w-[80px]">{learner.name}</span>
                  </div>
                  <span className="text-[#FF9600] font-black text-[11px]">{learner.xp_total} XP</span>
                </div>
              ))}
            </div>
            <Link href="/leaderboard">
              <button
                className="w-full py-2 rounded-xl font-black text-xs uppercase tracking-wider text-[var(--text-secondary)] transition-all hover:bg-[var(--background-hover)]"
                style={{ border: "2px solid var(--border)" }}
              >
                VIEW LEADERBOARD
              </button>
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h4 className="font-extrabold text-xs text-[var(--text-primary)] mb-0.5">
                  Silver League
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Complete a lesson to join this week&apos;s leaderboard!
                </p>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ background: "var(--background-hover)" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 6v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z" fill="#C0C0C0" />
                  <path d="M12 2L3 6v5c0 5.5 3.8 10.7 9 12" fill="#A8A8A8" />
                </svg>
              </div>
            </div>
            <Link href="/leaderboard">
              <button
                className="w-full py-2 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: "#1CB0F6", boxShadow: "0 3px 0 #1899D6" }}
              >
                GO TO LEADERBOARDS
              </button>
            </Link>
          </>
        )}
      </div>

      {/* ── 3. Daily Quests Widget ── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--background-secondary)", border: "2px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
            Daily Quests
          </p>
          <span className="text-[10px] font-black text-[#1CB0F6] cursor-pointer hover:underline uppercase">
            VIEW ALL
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#FFC800" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M7 2v11h3v9l7-12h-4l4-8z" />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold text-[var(--text-primary)]">Earn {dailyGoal} XP</span>
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                {earnedToday} / {dailyGoal}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--background-hover)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${questPct}%`, background: "#FFC800" }}
              />
            </div>
          </div>

          <div className="flex-shrink-0 text-lg">🎁</div>
        </div>
      </div>

      {/* ── 4. Footer links ── */}
      <footer className="px-1 text-[10px] font-bold text-[var(--text-tertiary)] flex flex-wrap gap-x-1.5 gap-y-1 justify-center uppercase">
        {["ABOUT", "BLOG", "STORE", "EFFICACY", "CAREERS", "TERMS", "PRIVACY"].map((item, i, arr) => (
          <React.Fragment key={item}>
            <span className="hover:underline cursor-pointer">{item}</span>
            {i < arr.length - 1 && <span className="text-[var(--border)]">·</span>}
          </React.Fragment>
        ))}
      </footer>
    </aside>
  );
};
