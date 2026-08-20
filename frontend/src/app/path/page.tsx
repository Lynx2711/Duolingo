// =============================================================================
// src/app/path/page.tsx — Duolingo Learning Path Page
// =============================================================================
// "use client" — Next.js ka ek special directive.
// By default Next.js pages SERVER par render hote hain (SSR) — yaani browser
// JavaScript run karne se pehle hi HTML ready hota hai.
// Lekin is page par hum React Hooks (useState, useEffect) use karte hain
// jo sirf BROWSER me kaam karte hain. Isliye "use client" likhna zaroori hai
// taaki Next.js is page ko browser side par render kare.
"use client";
// React: JavaScript UI library jo components aur hooks provide karta hai.
//   - useEffect: Jab component screen par aata hai tab code run karne ke liye
//     (jaise API call). "Side effect" isliye bolte hain kyunki ye UI rendering
//     se alag kaam karta hai.
//   - useState: Component ke andar variable store karne ke liye. Normal
//     JavaScript variable se fark ye hai ki jab useState variable badlta hai,
//     React automatically screen ko update (re-render) kar deta hai.
import React, { useEffect, useState } from "react";
// "@/" Next.js ka shortcut hai "src/" directory ke liye.
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
// UnitHeader: Har unit (Unit 1: Basics, Unit 2: Travel) ka colored banner.
import { UnitHeader } from "@/components/UnitHeader";
// PathNode: Har skill circle (the clickable bubbles on the path).
// NODE_DIAMETER: PathNode file se export hua constant — node ka pixel size (72px).
import { PathNode, NODE_DIAMETER } from "@/components/PathNode";

// courseApi, userApi: Humare api.ts me defined functions jo backend FastAPI
//   server se HTTP requests (fetch) karte hain.
//   courseApi.getLearningPath() → GET /api/courses/1/path/1
//   userApi.getUser()          → GET /api/users/1
import { courseApi, userApi } from "@/lib/api";

// TYPESCRIPT INTERFACES — Yahan data ka "blueprint" define hota hai
// Interface vs Backend Schema (Pydantic) — Kya farq hai?
// BACKEND me Pydantic Schema (Python):
//   class SkillWithProgress(BaseModel):
//       id: int
//       name: str
//       is_locked: bool
//   ↑ Ye server ke andar JSON validate karta hai BEFORE sending to browser.
// FRONTEND me TypeScript Interface (TypeScript):
//   interface SkillData { id: number; name: string; is_locked: boolean; }
//   ↑ Ye BROWSER ke andar TypeScript ko batata hai ki API se aane wala
//     JSON object ka shape kaisa hoga — taaki galti hone par compile-time
//     error mile, runtime crash nahi.
// Dono INDEPENDENT hain lekin ek doosre ko MIRROR karte hain:
//   Backend Schema → FastAPI JSON response banata hai
//   Frontend Interface → us JSON response ko TypeScript me safely use karta hai
//
// CONNECT: Frontend `courseApi.getLearningPath()` se jo JSON aata hai,
//   uski shape exactly `CoursePathData` → `UnitData[]` → `SkillData[]` jaisi hoti hai.
// =============================================================================

// SkillData: Ek skill (jaise "Greetings") ka data structure
interface SkillData {
  id: number;                    // DB me skill ka unique ID (1, 2, 3...)
  unit_id: number;               // Kaunse unit (Basics, Travel...) ka part hai
  name: string;                  // Skill ka naam, e.g. "Greetings"
  color: string;                 // Skill ka theme color (hex code), e.g. "#58CC02"
  order: number;                 // Unit ke andar kaunsi position par hai (1st, 2nd...)
  level: number;                 // User ne is skill ka kaunsa level complete kiya (0 = none, 1 = done)
  completed_lessons: number;     // User ne is skill ke kitne lessons finish kiye hain
  total_lessons: number;         // Is skill me total kitne lessons hain
  is_locked: boolean;            // true = grey/locked node, false = clickable
  next_lesson_id?: number | null; // Agla incomplete lesson ka ID (? = optional, may be absent)
  lesson_ids?: number[];         // Is skill ke saare lesson IDs ka array (optional)
}

// UnitData: Ek unit (jaise "Unit 1: Basics") ka data structure
// Ek unit ke andar multiple skills hoti hain — isliye `skills: SkillData[]`
// (SkillData ka ARRAY — [] ka matlab "list of")
interface UnitData {
  id: number;                    // DB me unit ka unique ID
  course_id: number;             // Kaunse course (Spanish) ka part hai
  order: number;                 // Course me unit ki position (1st unit, 2nd unit...)
  title: string;                 // Unit ka naam, e.g. "Basics"
  description?: string | null;   // Unit ki description (optional — ? means may not exist)
  color: string;                 // Unit ka theme color
  skills: SkillData[];           // Is unit ke andar saari skills ka array
}

// CoursePathData: Pura course data structure — jo backend se ek hi API call me aata hai
// Ek course ke andar multiple units hain → SkillData[] nested in UnitData[] nested here
interface CoursePathData {
  id: number;                    // Course ID (1 = Spanish)
  name: string;                  // Course naam, e.g. "Spanish"
  language_code: string;         // Language code, e.g. "es"
  units: UnitData[];             // Course ke saare units ka array
}

// UserData: Logged-in user ki information
// Ye `/api/users/1` se aata hai aur TopBar + RightSidebar ko pass hota hai
interface UserData {
  id: number;                    // User ka DB ID
  name: string;                  // User ka naam 
  xp_total: number;              // User ke total XP points
  streak: number;                // Consecutive days active 
  hearts: number;                // Abhi kitne hearts bache hain 
  max_hearts: number;            // Maximum hearts limit 
  gems: number;                  // Virtual currency 
  daily_goal_xp: number;         // User ka daily XP goal (default: 20 XP)
}
// NodeItem: Ek single PATH NODE ko represent karta hai — ye interface is FILE ke
// andar hi use hota hai, backend se directly nahi aata.
// `flattenNodes()` function SkillData se NodeItem banata hai.
interface NodeItem {
  lessonId: number;              // Is node ko click karne par kaunsa lesson kholega
  skillName: string;             // Node ke neeche dikhne wala naam
  color: string;                 // Node ka color
  isCompleted: boolean;          // true = green checkmark node
  isLocked: boolean;             // true = grey locked node
  isNextAvailable: boolean;      // true = pulsing blue "START" node (sirf ek hoga puri path par)
}
// flattenNodes() — Helper Function
// =============================================================================
// Parameter: `unit: UnitData`
//   → Matlab is function ko ek UnitData object pass karo (jaise Unit 1: Basics)
// Return Type: `NodeItem[]`
//   → Matlab ye function ek NodeItem ka ARRAY return karega
// Kaam kya karta hai?
//   Backend se ek skill ke andar multiple lessons ho sakte hain.
//   Ye function har skill ke har lesson ke liye ek alag NodeItem banata hai
//   taaki path par unhe alag-alag circles me dikhaya ja sake.
//
//   Sochlo: "Greetings" skill = 2 lessons
//   flattenNodes → [NodeItem for Lesson 1, NodeItem for Lesson 2]
//   Path par dono alag circles banenge.
// =============================================================================
function flattenNodes(unit: UnitData): NodeItem[] {
  // Khaali array banao — isme saare nodes push karte jayenge
  const items: NodeItem[] = [];
  // Ye flag track karta hai ki "next available" node mil gaya ya nahi.
  // Pure unit me sirf EK node ko isNextAvailable = true milega (pehla incomplete).
  let foundNext = false;

  // Har skill pe loop chalao (e.g. Greetings, Introductions)
  for (const skill of unit.skills) {
    // Lesson IDs determine karo:
    // Priority 1: Agar skill.lesson_ids[] available hai → use karo (multiple lessons)
    // Priority 2: Agar sirf next_lesson_id hai → array me wrap karo [id]
    // Priority 3: Fallback: skill.id itself use karo (edge case)
    const ids =
      skill.lesson_ids && skill.lesson_ids.length > 0
        ? skill.lesson_ids
        : skill.next_lesson_id
          ? [skill.next_lesson_id]
          : [skill.id];

    // Har lesson ID ke liye ek NodeItem banao
    // `lid` = lesson ID, `i` = index (0, 1, 2...)
    ids.forEach((lid, i) => {
      // isCompleted logic:
      //   - skill.level >= 1 → Puri skill complete hai (saare lessons done)
      //   - skill.completed_lessons > i → Yahi specific lesson (index i) complete hai
      const isCompleted = skill.level >= 1 || skill.completed_lessons > i;
      // isLocked: Backend ne calculate karke bheja hai — sirf copy karo
      const isLocked = skill.is_locked;
      // isNextAvailable: Pehla node jo locked bhi nahi aur complete bhi nahi —
      //   wahi "START" button wala pulsing blue node hoga
      const isNextAvailable = !isLocked && !isCompleted && !foundNext;

      // Agar ye node "next available" hai, toh flag set karo taaki agle nodes
      // ko isNextAvailable = false mile
      if (isNextAvailable) foundNext = true;

      // NodeItem banao aur array me push karo
      items.push({
        lessonId: lid,
        skillName: skill.name,
        color: skill.color || unit.color, // Fallback: agar skill ka color nahi, unit ka use karo
        isCompleted,
        isLocked,
        isNextAvailable,
      });
    });
  }
  return items;
}
// LAYOUT CONSTANTS — Path Canvas ke dimensions aur node positions
// NODE_R: Node ka radius (half of diameter) — center point calculate karne ke liye
const NODE_R = NODE_DIAMETER / 2; // e.g. 72/2 = 36px

// ROW_H: Ek node row ki height — node size + vertical gap between nodes
const ROW_H = 100; // 72px node + 28px gap = 100px total per row

// CANVAS_W: SVG canvas ki width pixels me — nodes iske andar draw honge
const CANVAS_W = 480;

// PAD_TOP: Canvas ke top pe extra padding taaki pehla node edge pe na ho
const PAD_TOP = 60;

// OFFSETS: Ye array define karta hai ki har node left/right me kitna shift hoga.
// Isse Duolingo jaisi ZIGZAG/WINDING path milti hai.
// 0 = center, +ve = right, -ve = left
// Pattern: Center → Right → FarRight → Right → Center → Left → FarLeft → Left → (repeat)
const OFFSETS = [0, 55, 80, 55, 0, -55, -80, -55];
// colX(): Ek node ka X coordinate (horizontal position) calculate karta hai.
// Parameter: `idx` = node ka index (0, 1, 2, 3...)
// `idx % OFFSETS.length` — modulo operator: OFFSETS array baar baar repeat karta hai
// Canvas center (CANVAS_W/2 = 240) + offset = final X position

function colX(idx: number) {
  return CANVAS_W / 2 + OFFSETS[idx % OFFSETS.length];
}
// PathPage — Main Page Component
// Ye "export default function" hai — Next.js is function ko automatically
// `/path` URL par render karta hai (kyunki ye file `app/path/page.tsx` me hai).
// "default" matlab: Is file ka PRIMARY export yahi hai.

export default function PathPage() {
  // ── STATE VARIABLES ─────────────────────────────────────────────────────────
  // useState<Type>(initialValue) — ek reactive variable banata hai.
  // Jab bhi in variables ki value change hoti hai, React automatically
  // screen (JSX) ko re-render karta hai.

  // coursePath: Backend se aaya hua pura course + units + skills data
  // Initial value: null (data load hone se pehle kuch nahi)
  const [coursePath, setCoursePath] = useState<CoursePathData | null>(null);

  // user: Backend se aaya hua logged-in user ka data (XP, hearts, gems)
  const [user, setUser] = useState<UserData | null>(null);

  // loading: true jab tak API call complete nahi hoti — loading spinner dikhane ke liye
  const [loading, setLoading] = useState(true);
  // error: Agar API call fail ho jaye toh error message store karte hain
  const [error, setError] = useState<string | null>(null);

  // selectedId: User ne kaunsa node click kiya — uss node par tooltip/popup dikhane ke liye
  // null = koi node select nahi
  const [selectedId, setSelectedId] = useState<number | null>(null);


  // ── fetchData() — API se data laane wala function ──────────────────────────
  // Parameter: `retries = 10` — agar API fail ho toh kitni baar retry karna hai
  // (default = 10, matlab 10 baar try karo 2 second ke gap me)
  const fetchData = async (retries = 10) => {
    try {
      setLoading(true);  // Loading spinner ON
      setError(null);    // Purani error clear karo

      // Promise.all() — DONO API calls ek saath (parallel) launch karo.
      // Ye dono result ke aane ka wait karta hai simultaneously,
      // matlab total wait time = max(call1_time, call2_time) instead of sum.
      const [path, u] = await Promise.all([
        // courseApi.getLearningPath(1, 1) → GET /api/courses/1/path/1
        // (course_id=1 = Spanish, user_id=1 = hardcoded demo user)
        courseApi.getLearningPath(1, 1),

        // userApi.getUser(1) → GET /api/users/1
        userApi.getUser(1),
      ]);

      // TypeScript ko batao ki in responses ki shape kya hai
      setCoursePath(path as CoursePathData);
      setUser(u as UserData);

      setLoading(false); // Loading spinner OFF
    } catch (e: unknown) {
      // Agar error aaya:
      if (retries > 0) {
        // Abhi bhi retries bache hain — 2 second baad phir try karo
        setTimeout(() => fetchData(retries - 1), 2000);
        return; // Is execution ko yahan rok do
      }
      // Saari retries khatam — error dikhao
      setError(e instanceof Error ? e.message : "Failed to load");
      setLoading(false);
    }
  };


  // ── useEffect() — Component pehli baar mount hone par run karo ─────────────
  // useEffect(callback, [dependencies]):
  //   - callback: Kya run karna hai
  //   - []: Khaali array = sirf ek baar run karo (page load par)
  //   Agar [] nahi hota toh har re-render par dobara API call hoti!
  useEffect(() => {
    fetchData(); // Page load par data fetch karo
  }, []); // [] = sirf pehli baar

  // ── JSX RETURN — Yahan se screen par dikhne wala HTML/UI define hota hai ──
  // JSX: JavaScript me HTML jaisi syntax — React ise actual DOM elements me
  // convert karta hai. className="..." use hota hai (HTML ka class= nahi,
  // kyunki class JavaScript me reserved keyword hai).
  return (
    // Root container: Full screen height, flex column layout
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--text-primary)" }}
      // var(--background): CSS variable — dark/light mode ke hisaab se change hoti hai
    >
      {/* TopBar: Sticky top navigation bar
          user={user} → user data pass karo taaki XP/Hearts/Gems dikhae
          onUserUpdate → Agar hearts refill ho toh data dobara fetch karo */}
      <TopBar user={user} onUserUpdate={() => fetchData(10)} />

      {/* 3-Column Body Layout:
          [Left Sidebar | Center Main Content | Right Widgets]
          flex: horizontal row layout
          flex-1: remaining height fill karo */}
      <div className="flex flex-1 w-full">

        {/* Left Sidebar: activeKey="learn" = "Learn" tab highlighted */}
        <Sidebar activeKey="learn" />

        {/* Center Column — Yahan pura path dikhta hai
            ml-0 md:ml-20 lg:ml-[200px]: Sidebar ke width ke hisaab se left margin
            (Sidebar collapsed = 80px, expanded = 200px) */}
        <main
          className="flex-1 ml-0 md:ml-20 lg:ml-[200px] flex justify-center overflow-y-auto px-3 sm:px-4 md:px-6 pt-4 pb-24 md:pb-10"
          onClick={(e) => {
            // Agar user ne main area (background) click kiya (koi node nahi),
            // toh selected node deselect karo
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          {/* Inner canvas — max 704px wide, center aligned */}
          <div className="w-full max-w-[704px] mx-auto flex flex-col items-stretch">

            {/* ── LOADING STATE: Data load ho raha hai ── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <img
                  src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg"
                  alt="Duo"
                  className="w-16 h-16 animate-bounce" // Bouncing Duolingo owl
                />
                <p className="text-sm font-bold text-[var(--text-secondary)]">
                  Loading your path…
                </p>
              </div>
            )}

            {/* ── ERROR STATE: API call fail ho gayi ── */}
            {!loading && error && (
              <div className="p-8 text-center rounded-2xl border-2 border-[#37464F] bg-[#1A2C32] my-12">
                <p className="text-[#FF4B4B] font-black mb-2">Unable to load path</p>
                <p className="text-xs text-[#8A9BA3] mb-4">{error}</p>
                {/* Retry button — 10 retries se phir shuru karo */}
                <button
                  onClick={() => fetchData(10)}
                  className="px-5 py-2 rounded-xl bg-[#58CC02] text-white font-black text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── SUCCESS STATE: Data aa gaya, units render karo ── */}
            {/* coursePath.units.map() — har unit ke liye ek <section> render karo */}
            {!loading && !error && coursePath && coursePath.units.map((unit) => {

              // Is unit ke saare lesson nodes ka flat array banao
              const nodes = flattenNodes(unit);

              // Kitne nodes hain is unit me
              const n = nodes.length;

              // SVG canvas ki height calculate karo:
              // PAD_TOP + (n nodes × ROW_H each) + 40px bottom padding
              const canvasH = PAD_TOP + n * ROW_H + 40;

              // Har node ka (cx, cy) — center X aur center Y position calculate karo
              // cx: zigzag pattern se (colX function)
              // cy: top padding + (row index × row height) + node radius
              const positions = nodes.map((_, i) => ({
                cx: colX(i),
                cy: PAD_TOP + i * ROW_H + NODE_R,
              }));
              return (
                // key={unit.id}: React ko batao ki har unit unique hai —
                // performance optimization ke liye zaroori
                <section key={unit.id} className="flex flex-col items-center mb-10 w-full">

                  {/* Unit Header Banner — "SECTION 1, Unit 1: Basics" */}
                  <div className="w-full">
                    <UnitHeader
                      unitNumber={unit.order}      // 1, 2, 3...
                      title={unit.title}           // "Basics", "Travel"...
                      description={unit.description}
                      color={unit.color}           // Green, Purple, Blue
                    />
                  </div>

                  {/* Node Canvas — SVG + absolute positioned nodes */}
                  <div
                    className="relative w-full"
                    style={{ height: canvasH, maxWidth: CANVAS_W }}
                  >
                    {/* ── SVG CONNECTOR LINES ──────────────────────────────── */}
                    {/* SVG = Scalable Vector Graphics — khatam nahi hoga zoom karne se */}
                    {/* pointer-events-none: Lines clicks intercept nahi karein */}
                    {/* z-0: Lines nodes ke PEECHE rahein */}
                    <svg
                      className="absolute inset-0 pointer-events-none z-0"
                      width={CANVAS_W}
                      height={canvasH}
                      style={{ overflow: "visible" }}
                    >
                      {/* Consecutive node pairs ke beech ek curve draw karo */}
                      {/* positions.slice(0, -1) = last node ko chhod do (uske baad koi nahi) */}
                      {positions.slice(0, -1).map(({ cx: ax, cy: ay }, i) => {
                        // Next node ka position
                        const { cx: bx, cy: by } = positions[i + 1];

                        // Bezier curve ka midpoint (control point)
                        const midY = (ay + by) / 2;

                        // Completed nodes ke baad green line, baaki grey
                        const completed = nodes[i].isCompleted;
                        const strokeColor = completed ? "#58CC02" : "#37464F";

                        return (
                          <path
                            key={i}
                            // M = Move to start, C = Cubic Bezier curve to end
                            // "M ax (ay+pad) C ax midY, bx midY, bx (by-pad)"
                            // = Smooth S-curve from node bottom to next node top
                            d={`M ${ax} ${ay + NODE_R + 4} C ${ax} ${midY}, ${bx} ${midY}, ${bx} ${by - NODE_R - 4}`}
                            stroke={strokeColor}
                            strokeWidth={6}
                            strokeDasharray="8 6"  // "8px dash, 6px gap" = dashed line
                            strokeLinecap="round"  // Dashes ke ends round honge
                            fill="none"            // Sirf line, filled shape nahi
                          />
                        );
                      })}
                    </svg>

                    {/* ── LESSON NODES (Circles) ───────────────────────────── */}
                    {/* Har node ka position absolute hai — SVG canvas ke andar */}
                    {nodes.map((node, i) => {
                      const { cx, cy } = positions[i]; // X, Y center position
                      return (
                        <PathNode
                          key={node.lessonId}
                          lessonId={node.lessonId}           // Kaunsa lesson open karna hai
                          skillName={node.skillName}         // Node ke neeche label
                          color={node.color}                 // Node ka color
                          isCompleted={node.isCompleted}     // Green ✓ node?
                          isLocked={node.isLocked}           // Grey locked node?
                          isNextAvailable={node.isNextAvailable} // Pulsing START node?
                          isSelected={selectedId === node.lessonId} // Tooltip visible?
                          cx={cx}                            // Horizontal center position
                          cy={cy}                            // Vertical center position
                          onSelect={() =>
                            // Toggle: Agar ye node pehle se selected hai toh deselect,
                            // warna select karo
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

        {/* Right Sidebar: Only on large screens (hidden lg:block)
            sticky top-14: TopBar (56px = 3.5rem = 14 in Tailwind) ke neeche start ho
            overflow-y-auto: Agar content zyada ho toh scroll karo */}
        <div className="hidden lg:block w-[368px] shrink-0">
          <div className="sticky top-14 overflow-y-auto max-h-[calc(100vh-3.5rem)] py-6 px-4">
            {/* user={user}: XP progress aur daily quest ke liye user data pass karo */}
            <RightSidebar user={user} />
          </div>
        </div>

      </div>
    </div>
  );
}
