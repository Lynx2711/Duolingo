// src/app/practice/page.tsx — Practice Hub Page
//
// Duolingo's Practice Hub allows learners to review past concepts,
// regain lost hearts through practice sessions, and earn bonus XP.
// Fully connected to backend APIs.

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

export default function PracticePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await userApi.getUser(1);
      setUser(data as UserData);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <TopBar user={user} onUserUpdate={fetchUser} />

      <div className="flex flex-1 relative">
        <Sidebar activeKey="practice" />

        <main className="flex-1 md:ml-[220px] lg:mr-[340px] px-6 py-8 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Practice Hub 🎯</h1>
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              Strengthen your skills, regain hearts, and earn extra XP!
            </p>
          </div>

          {/* Heart refill practice card */}
          <div className="card-duo p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-feather/10 border-feather/30">
            <div className="flex items-center gap-4">
              <span className="text-5xl animate-bounce">❤️</span>
              <div>
                <h3 className="text-lg font-black text-feather">Earn Hearts Back</h3>
                <p className="text-xs font-bold text-[var(--text-secondary)]">
                  Complete a quick practice lesson to regain 1 heart without spending gems.
                </p>
              </div>
            </div>
            <Link href="/learn/1" className="w-full sm:w-auto shrink-0">
              <button className="btn-duo-primary py-3 px-6 text-xs w-full">
                PRACTICE +1 ❤️
              </button>
            </Link>
          </div>

          {/* Practice options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/learn/1">
              <div className="card-duo p-5 hover:border-macaw hover:bg-macaw/5 cursor-pointer transition-all">
                <span className="text-3xl mb-2 block">🗣️</span>
                <h4 className="font-extrabold text-base mb-1">Vocabulary Practice</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Review words from Greetings and Travel units.
                </p>
              </div>
            </Link>

            <Link href="/learn/2">
              <div className="card-duo p-5 hover:border-bee hover:bg-bee/5 cursor-pointer transition-all">
                <span className="text-3xl mb-2 block">⚡</span>
                <h4 className="font-extrabold text-base mb-1">Timed XP Sprint</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Answer exercises quickly to maximize your XP total.
                </p>
              </div>
            </Link>
          </div>
        </main>

        <RightSidebar user={user} />
      </div>
    </div>
  );
}
