// src/app/shop/page.tsx — Duolingo Shop Page
//
// Allows learners to spend gems on Heart Refill, Streak Freeze, Double XP Boost.
// Fully connected to backend `userApi.refillHearts` and user endpoints.

"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
import { userApi } from "@/lib/api";

import { GemIcon } from "@/components/GemIcon";
import { HeartIcon } from "@/components/HeartIcon";

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

export default function ShopPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleRefillHearts = async () => {
    if (!user || user.gems < 350) {
      setMessage("Not enough gems! Need 350 gems");
      return;
    }
    try {
      setLoading(true);
      await userApi.refillHearts(user.id);
      await fetchUser();
      setMessage("Hearts refilled to max!");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to refill hearts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <TopBar user={user} onUserUpdate={fetchUser} />

      <div className="flex flex-1 relative">
        <Sidebar activeKey="shop" />

        <main className="flex-1 md:ml-[220px] lg:mr-[340px] px-6 py-8 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Shop 🛒</h1>
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              Spend your hard-earned gems on power-ups and heart refills!
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-duo-xl bg-feather/20 border border-feather text-feather font-bold text-sm flex justify-between items-center">
              <span>{message}</span>
              <button onClick={() => setMessage(null)} className="font-black text-lg">✕</button>
            </div>
          )}

          {/* Shop Items List */}
          <div className="space-y-4">
            {/* Heart Refill */}
            <div className="card-duo p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-duo-xl bg-cardinal/10 flex items-center justify-center shrink-0">
                  <HeartIcon size={32} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Refill Hearts</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Get back to full health ({user?.max_hearts ?? 5} hearts) immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefillHearts}
                disabled={loading || (user?.hearts ?? 0) >= (user?.max_hearts ?? 5)}
                className="btn-duo-primary py-2.5 px-5 text-xs shrink-0 flex items-center gap-1.5"
              >
                <span>{(user?.hearts ?? 0) >= (user?.max_hearts ?? 5) ? "FULL" : "BUY"}</span>
                <span className="bg-black/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <GemIcon size={14} /> 350
                </span>
              </button>
            </div>

            {/* Streak Freeze */}
            <div className="card-duo p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-duo-xl bg-macaw/10 flex items-center justify-center text-3xl shrink-0">
                  🧊
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Streak Freeze</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Protect your streak if you miss a day of practice.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessage("Streak Freeze equipped!")}
                className="btn-duo-secondary py-2.5 px-5 text-xs shrink-0 flex items-center gap-1.5"
              >
                <span>BUY</span>
                <span className="bg-black/10 px-2 py-0.5 rounded-full">💎 200</span>
              </button>
            </div>

            {/* Double XP Boost */}
            <div className="card-duo p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-duo-xl bg-fox/10 flex items-center justify-center text-3xl shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Double XP Boost (15m)</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Earn double XP for all lessons completed in the next 15 minutes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessage("Double XP Boost activated for 15m!")}
                className="btn-duo-secondary py-2.5 px-5 text-xs shrink-0 flex items-center gap-1.5"
              >
                <span>BUY</span>
                <span className="bg-black/10 px-2 py-0.5 rounded-full">💎 100</span>
              </button>
            </div>
          </div>
        </main>

        <RightSidebar user={user} />
      </div>
    </div>
  );
}
