// src/app/path/page.tsx — Duolingo Learning Path Page (Clean & Pixel-Perfect)
//
// Features:
// - Always dashed SVG curve path connectors (green for completed, dark gray for locked)
// - Clean unit header banners
// - Dynamic DB learning path binding
// - Responsive layout with left sidebar and right widget panel

"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
import { UnitHeader } from "@/components/UnitHeader";
import { PathNode, NODE_DIAMETER } from "@/components/PathNode";
import { courseApi, userApi } from "@/lib/api";

interface SkillData {
  id: number;
  unit_id: number;
  name: string;
  color: string;
  order: number;
  level: number;
  completed_lessons: number;
  total_lessons: number;
  is_locked: boolean;
  next_lesson_id?: number | null;
  lesson_ids?: number[];
}

interface UnitData {
  id: number;
  course_id: number;
  order: number;
  title: string;
  description?: string | null;
  color: string;
  skills: SkillData[];
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

interface NodeItem {
  lessonId: number;
  skillName: string;
  color: string;
  isCompleted: boolean;
  isLocked: boolean;
  isNextAvailable: boolean;
}

function flattenNodes(unit: UnitData): NodeItem[] {
  const items: NodeItem[] = [];
  let foundNext = false;

  for (const skill of unit.skills) {
    const ids =
      skill.lesson_ids && skill.lesson_ids.length > 0
        ? skill.lesson_ids
        : skill.next_lesson_id
          ? [skill.next_lesson_id]
          : [skill.id];

    ids.forEach((lid, i) => {
      const isCompleted = skill.level >= 1 || skill.completed_lessons > i;
      const isLocked = skill.is_locked;
      const isNextAvailable = !isLocked && !isCompleted && !foundNext;
      if (isNextAvailable) foundNext = true;

      items.push({
        lessonId: lid,
        skillName: skill.name,
        color: skill.color || unit.color,
        isCompleted,
        isLocked,
        isNextAvailable,
      });
    });
  }
  return items;
}

// Layout constants
const NODE_R = NODE_DIAMETER / 2; // 36px
const ROW_H = 100;               // 72px node + 28px vertical gap = 100px
const CANVAS_W = 480;
const PAD_TOP = 60;
const OFFSETS = [0, 55, 80, 55, 0, -55, -80, -55];

function colX(idx: number) {
  return CANVAS_W / 2 + OFFSETS[idx % OFFSETS.length];
}

export default function PathPage() {
  const [coursePath, setCoursePath] = useState<CoursePathData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchData = async (retries = 10) => {
    try {
      setLoading(true);
      setError(null);
      const [path, u] = await Promise.all([
        courseApi.getLearningPath(1, 1),
        userApi.getUser(1),
      ]);
      setCoursePath(path as CoursePathData);
      setUser(u as UserData);
      setLoading(false);
    } catch (e: unknown) {
      if (retries > 0) {
        setTimeout(() => fetchData(retries - 1), 2000);
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--text-primary)" }}
    >
      <TopBar user={user} onUserUpdate={() => fetchData(10)} />

      {/* 3-Column Body: [Left Sidebar] [Center flex-1] [Right 368px lg-only] */}
      <div className="flex flex-1 w-full">

        {/* Left Sidebar (fixed, full-height) */}
        <Sidebar activeKey="learn" />

        {/* Center Column */}
        {/* ml offsets match sidebar widths: 88px collapsed, 256px expanded */}
        <main
          className="flex-1 ml-0 md:ml-20 lg:ml-[200px] flex justify-center overflow-y-auto px-3 sm:px-4 md:px-6 pt-4 pb-24 md:pb-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          {/* Inner canvas: max 704px, centered */}
          <div className="w-full max-w-[704px] mx-auto flex flex-col items-stretch">
            {loading && (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <img
                  src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg"
                  alt="Duo"
                  className="w-16 h-16 animate-bounce"
                />
                <p className="text-sm font-bold text-[var(--text-secondary)]">
                  Loading your path…
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="p-8 text-center rounded-2xl border-2 border-[#37464F] bg-[#1A2C32] my-12">
                <p className="text-[#FF4B4B] font-black mb-2">Unable to load path</p>
                <p className="text-xs text-[#8A9BA3] mb-4">{error}</p>
                <button
                  onClick={() => fetchData(10)}
                  className="px-5 py-2 rounded-xl bg-[#58CC02] text-white font-black text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && coursePath && coursePath.units.map((unit) => {
              const nodes = flattenNodes(unit);
              const n = nodes.length;
              const canvasH = PAD_TOP + n * ROW_H + 40;

              const positions = nodes.map((_, i) => ({
                cx: colX(i),
                cy: PAD_TOP + i * ROW_H + NODE_R,
              }));

              return (
                <section key={unit.id} className="flex flex-col items-center mb-10 w-full">
                  {/* Unit header banner */}
                  <div className="w-full">
                    <UnitHeader
                      unitNumber={unit.order}
                      title={unit.title}
                      description={unit.description}
                      color={unit.color}
                    />
                  </div>

                  {/* Node canvas */}
                  <div
                    className="relative w-full"
                    style={{ height: canvasH, maxWidth: CANVAS_W }}
                  >
                    {/* Always Dashed SVG connector curves */}
                    <svg
                      className="absolute inset-0 pointer-events-none z-0"
                      width={CANVAS_W}
                      height={canvasH}
                      style={{ overflow: "visible" }}
                    >
                      {positions.slice(0, -1).map(({ cx: ax, cy: ay }, i) => {
                        const { cx: bx, cy: by } = positions[i + 1];
                        const midY = (ay + by) / 2;
                        const completed = nodes[i].isCompleted;
                        // Always dashed lines: green when completed, dark gray when locked
                        const strokeColor = completed ? "#58CC02" : "#37464F";

                        return (
                          <path
                            key={i}
                            d={`M ${ax} ${ay + NODE_R + 4} C ${ax} ${midY}, ${bx} ${midY}, ${bx} ${by - NODE_R - 4}`}
                            stroke={strokeColor}
                            strokeWidth={6}
                            strokeDasharray="8 6"
                            strokeLinecap="round"
                            fill="none"
                          />
                        );
                      })}
                    </svg>

                    {/* Lesson nodes */}
                    {nodes.map((node, i) => {
                      const { cx, cy } = positions[i];
                      return (
                        <PathNode
                          key={node.lessonId}
                          lessonId={node.lessonId}
                          skillName={node.skillName}
                          color={node.color}
                          isCompleted={node.isCompleted}
                          isLocked={node.isLocked}
                          isNextAvailable={node.isNextAvailable}
                          isSelected={selectedId === node.lessonId}
                          cx={cx}
                          cy={cy}
                          onSelect={() =>
                            setSelectedId((prev) =>
                              prev === node.lessonId ? null : node.lessonId
                            )
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </main>

        {/* Right Sidebar: hidden < lg, 368px at lg+ */}
        <div className="hidden lg:block w-[368px] shrink-0">
          <div className="sticky top-14 overflow-y-auto max-h-[calc(100vh-3.5rem)] py-6 px-4">
            <RightSidebar user={user} />
          </div>
        </div>

      </div>
    </div>
  );
}
