// src/app/guidebook/[unitId]/page.tsx — Duolingo Unit Guidebook Page
//
// Matches the reference design exactly:
//   - Header with Back link, Unit Title ("Unit 1 Guidebook"), subtitle
//   - KEY PHRASES section with speech-bubble cards showing Spanish phrase + English translation
//   - GRAMMAR TIPS section with styled rule cards
//   - Right Sidebar with "Try Super for free", "Silver League", and "Daily Quests" widgets
//   - Full live data connection to backend API (GET /api/courses/units/{unitId}/guidebook)

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
import { courseApi, userApi } from "@/lib/api";

interface KeyPhrase {
  phrase: string;
  translation: string;
}

interface GrammarTip {
  title: string;
  content: string;
}

interface GuidebookData {
  unit_id: number;
  unit_number: number;
  title: string;
  description: string;
  color: string;
  key_phrases: KeyPhrase[];
  grammar_tips: GrammarTip[];
}

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

export default function UnitGuidebookPage() {
  const params = useParams();
  const unitId = Number(params.unitId) || 1;

  const [guidebook, setGuidebook] = useState<GuidebookData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [gData, uData] = await Promise.all([
          courseApi.getGuidebook(unitId),
          userApi.getUser(1),
        ]);
        setGuidebook(gData as GuidebookData);
        setUser(uData as UserData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load guidebook");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unitId]);

  return (
    <div
      className="min-h-screen flex flex-col font-sans select-none"
      style={{ background: "var(--background)", color: "var(--text-primary)" }}
    >
      {/* Sticky top bar */}
      <TopBar user={user} />

      {/* Page body */}
      <div className="flex flex-1 relative">
        {/* Left icon-strip sidebar (fixed, 80px) */}
        <Sidebar activeKey="learn" />

        {/* Center Guidebook Content Column */}
        <main className="flex-1 md:ml-20 lg:mr-[340px] px-6 py-8 overflow-y-auto max-w-3xl">
          {/* Back button link */}
          <div className="mb-6">
            <Link
              href="/path"
              className="inline-flex items-center gap-2 text-sm font-black text-[#5A6B73] hover:text-[#D1D8DB] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>Back</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-5xl animate-bounce">📖</div>
              <p className="font-extrabold text-sm text-[var(--text-secondary)]">
                Loading guidebook...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl">
              <h3 className="font-black text-[#FF4B4B] text-base mb-2">
                Unable to load guidebook
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">{error}</p>
            </div>
          ) : guidebook ? (
            <div className="space-y-10">
              {/* Header Title Section */}
              <div className="border-b-2 border-[#37464F] pb-8">
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                  Unit {guidebook.unit_number} Guidebook
                </h1>
                <p className="text-base font-bold text-[#8A9BA3]">
                  {guidebook.description}
                </p>
              </div>

              {/* KEY PHRASES Section */}
              <section className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#1CB0F6]">
                  KEY PHRASES
                </h2>

                <div className="space-y-4">
                  {guidebook.key_phrases.map((kp, idx) => (
                    <div
                      key={idx}
                      className="relative bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-5 shadow-lg transition-all hover:border-[#5A6B73]"
                    >
                      {/* Speech bubble pointer on top left */}
                      <div className="absolute left-6 -top-[9px] w-4 h-4 rotate-45 bg-[#1A2C32] border-t-2 border-l-2 border-[#37464F]" />

                      <p className="text-lg font-black text-white mb-1 leading-snug">
                        <span className="border-b-2 border-dotted border-white/40 pb-0.5">
                          {kp.phrase}
                        </span>
                      </p>
                      <p className="text-sm font-extrabold text-[#8A9BA3]">
                        {kp.translation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* GRAMMAR TIPS Section */}
              <section className="space-y-4 pt-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#1CB0F6]">
                  TIP
                </h2>

                <div className="space-y-4">
                  {guidebook.grammar_tips.map((gt, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-6 shadow-lg space-y-2"
                    >
                      <h3 className="text-lg font-black text-white">
                        {gt.title}
                      </h3>
                      <p className="text-sm font-bold text-[#D1D8DB] leading-relaxed">
                        {gt.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </main>

        {/* Right sidebar */}
        <div
          className="hidden lg:block fixed right-0 top-14 bottom-0 overflow-y-auto"
          style={{ width: "340px", padding: "24px" }}
        >
          <RightSidebar user={user} />
        </div>
      </div>
    </div>
  );
}
