// src/app/path/page.tsx — Duolingo Home Learning Path Page
//
// Core page: Duolingo's signature winding S-curve skill path.
// Fetches course path + user data, renders:
// - Sticky TopBar (gamification stats)
// - Fixed left Sidebar (navigation)
// - Scrollable center column with unit banners + skill nodes
// - Fixed right sidebar (Super promo, Leaderboard, Quests)

"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
import { UnitHeader } from "@/components/UnitHeader";
import { PathNode, SkillPathNodeData } from "@/components/PathNode";
import { courseApi, userApi } from "@/lib/api";

interface UnitData {
  id: number;
  course_id: number;
  order: number;
  title: string;
  description?: string | null;
  color: string;
  skills: SkillPathNodeData[];
}

interface CoursePathData {
  id: number;
  name: string;
  language_code: string;
  units: UnitData[];
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

export default function PathPage() {
  const [coursePath, setCoursePath] = useState<CoursePathData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pathData, userData] = await Promise.all([
        courseApi.getLearningPath(1, 1),
        userApi.getUser(1),
      ]);
      setCoursePath(pathData as CoursePathData);
      setUser(userData as UserData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load learning path");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Find the first uncompleted & unlocked skill
  let nextAvailableSkillId: number | null = null;
  if (coursePath) {
    outer: for (const unit of coursePath.units) {
      for (const skill of unit.skills) {
        if (!skill.is_locked && skill.level < 1) {
          nextAvailableSkillId = skill.id;
          break outer;
        }
      }
    }
  }

  // Close popover when clicking outside nodes
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedSkillId(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--text-primary)" }}
    >
      {/* Sticky top bar */}
      <TopBar user={user} onUserUpdate={fetchData} />

      {/* Page body */}
      <div className="flex flex-1 relative">

        {/* Left sidebar (fixed, 220px) */}
        <Sidebar activeKey="learn" />

        {/* Center scrollable path column */}
        <main
          className="flex-1 flex flex-col items-center overflow-y-auto"
          style={{
            // Account for fixed sidebar widths
            marginLeft: "220px",
            marginRight: "0",
            paddingTop: "24px",
            paddingBottom: "80px",
          }}
          onClick={handleBackgroundClick}
        >
          {/* Inner container — narrow like Duolingo (~380px) */}
          <div className="w-full max-w-[380px] flex flex-col items-center px-2">

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="text-5xl animate-bounce">🦉</div>
                <p className="font-extrabold text-sm text-[var(--text-secondary)]">
                  Loading your learning path...
                </p>
              </div>

            ) : error ? (
              <div
                className="p-8 text-center max-w-sm my-12 rounded-2xl"
                style={{ background: "var(--background-secondary)", border: "2px solid var(--border)" }}
              >
                <div className="text-4xl mb-2">⚠️</div>
                <h3 className="font-black text-base text-[#FF4B4B] mb-2">Unable to load learning path</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="btn-duo-primary py-2.5 px-6 text-xs"
                >
                  RETRY
                </button>
              </div>

            ) : coursePath && coursePath.units.length > 0 ? (
              // Render each unit
              (() => {
                // Build a flat global index for consistent S-curve across all units
                let globalIdx = 0;
                return coursePath.units.map((unit) => {
                  const unitStart = globalIdx;
                  globalIdx += unit.skills.length;

                  return (
                    <section key={unit.id} className="w-full flex flex-col items-center mb-8">
                      {/* Unit banner */}
                      <UnitHeader
                        unitNumber={unit.order}
                        title={unit.title}
                        description={unit.description}
                        color={unit.color}
                      />

                      {/* Skill nodes */}
                      <div className="w-full flex flex-col items-center">
                        {unit.skills.map((skill, skillIdx) => {
                          const flatIndex = unitStart + skillIdx;
                          const isNext = skill.id === nextAvailableSkillId;
                          const isSelected = skill.id === selectedSkillId;
                          const isLast = skillIdx === unit.skills.length - 1;

                          return (
                            <PathNode
                              key={skill.id}
                              skill={skill}
                              index={flatIndex}
                              isNextAvailable={isNext}
                              isSelected={isSelected}
                              isLast={isLast}
                              onSelect={() =>
                                setSelectedSkillId((prev) =>
                                  prev === skill.id ? null : skill.id
                                )
                              }
                            />
                          );
                        })}
                      </div>
                    </section>
                  );
                });
              })()

            ) : (
              <div className="text-center py-12 text-[var(--text-secondary)] font-bold">
                No units available.
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <div
          className="hidden lg:block flex-shrink-0 overflow-y-auto"
          style={{
            width: "340px",
            paddingTop: "24px",
            paddingRight: "24px",
            paddingBottom: "24px",
          }}
        >
          <RightSidebar user={user} />
        </div>
      </div>
    </div>
  );
}
