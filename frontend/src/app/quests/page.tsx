// src/app/quests/page.tsx — Daily Quests & Challenges Page
//
// Shows daily/monthly quests, XP target indicators, and chest rewards.
// Connected to live user API.

"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
import { userApi } from "@/lib/api";

interface UserData {
  id: number;
  name: string;
  xp_total: number;
  streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_goal_xp: number;
}

export default function QuestsPage() {
  const [user, setUser] = useState<UserData | null>(null);

  const fetchUser = async () => {
    try {
      const data = await userApi.getUser(1);
      setUser(data as UserData);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const xp = user?.xp_total ?? 0;
  const goal = user?.daily_goal_xp ?? 20;

  const quests = [
    { id: 1, title: "Earn 10 XP", current: Math.min(10, xp), target: 10, icon: "⚡", reward: "🎁 Chest" },
    { id: 2, title: `Reach Daily Goal (${goal} XP)`, current: Math.min(goal, xp), target: goal, icon: "🎯", reward: "💎 20 Gems" },
    { id: 3, title: "Complete 2 Lessons", current: Math.min(2, Math.floor(xp / 10)), target: 2, icon: "📚", reward: "🔥 Streak Boost" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <TopBar user={user} onUserUpdate={fetchUser} />

      <div className="flex flex-1 relative">
        <Sidebar activeKey="quests" />

        <main className="flex-1 md:ml-[220px] lg:mr-[340px] px-6 py-8 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Daily Quests 📜</h1>
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              Complete quests every day to earn gems and rewards!
            </p>
          </div>

          <div className="space-y-4">
            {quests.map((q) => {
              const pct = Math.round((q.current / q.target) * 100);
              const isDone = q.current >= q.target;
              return (
                <div key={q.id} className="card-duo p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-duo-xl bg-bee/20 flex items-center justify-center text-2xl shrink-0">
                    {q.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-extrabold text-sm">{q.title}</h4>
                      <span className="text-xs font-bold text-[var(--text-secondary)]">
                        {q.current} / {q.target}
                      </span>
                    </div>
                    <div className="h-3 bg-[var(--border)] rounded-duo-pill overflow-hidden">
                      <div
                        className="h-full bg-bee rounded-duo-pill transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    disabled={!isDone}
                    className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-duo-md uppercase ${
                      isDone
                        ? "bg-feather text-white shadow-duo-green hover:brightness-105"
                        : "bg-[var(--background-secondary)] text-[var(--text-tertiary)] border-2 border-[var(--border)]"
                    }`}
                  >
                    {isDone ? "CLAIM!" : q.reward}
                  </button>
                </div>
              );
            })}
          </div>
        </main>

        <RightSidebar user={user} />
      </div>
    </div>
  );
}
