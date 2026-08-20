// =============================================================================
// src/components/Sidebar.tsx — Left Navigation Sidebar (3 Responsive Modes)
// =============================================================================
//
// Ye component left side ka navigation panel hai. Ye TEEN alag-alag sizes me
// dikhta hai depending on screen width:
//
//   Mode 1 — Collapsed (80px wide): Medium/standard desktops
//     → Sirf icons dikhte hain, labels hidden
//   Mode 2 — Expanded (256px wide): Large desktops
//     → Icons + text labels dikhte hain
//   Mode 3 — Bottom Bar: Mobile screens
//     → Bottom pe fixed navigation bar (tabs style)
// =============================================================================

// "use client": usePathname() hook browser me hi kaam karta hai,
// isliye is component ko browser-side render karna zaroori hai.
"use client";

// React: UI library — component banane ke liye
import React from "react";

// Link: Next.js navigation component — page reload without full refresh.
// HTML <a href="/path"> reload karta hai, Link fast SPA navigation karta hai.
import Link from "next/link";

// usePathname: Next.js ka built-in hook jo current URL path return karta hai.
// e.g. agar user "/leaderboard" par hai toh usePathname() = "/leaderboard"
// Ye is sidebar ke liye zaroori hai taaki "active" item highlight ho sake.
import { usePathname } from "next/navigation";


// =============================================================================
// SidebarProps Interface
// =============================================================================
// Ye interface define karta hai ki Sidebar component kya accept karta hai.
//
// activeKey?: string
//   → "?" ka matlab: Optional property — parent page activeKey pass kare ya na kare dono theek hai.
//   → Agar pass ho, toh is key ke basis par active item highlight hoga
//     (path/page.tsx pass karta hai activeKey="learn")
//   → Agar pass na ho, toh current URL se automatically detect hoga
// =============================================================================
interface SidebarProps {
  activeKey?: string;
}


// =============================================================================
// NAV_ITEMS — Navigation Menu Items Array
// =============================================================================
// Ye ek constant ARRAY hai jo saare navigation items ka data store karta hai.
// Array me har item ek OBJECT hai ({key, label, href, iconUrl}).
//
// Kyun array me rakha?
//   Taaki baar-baar HTML copy paste na karna pade. Sirf ek .map() se
//   saare nav items render ho jayenge — DRY (Don't Repeat Yourself) principle.
//
// iconUrl: Duolingo ke official CDN (Content Delivery Network) se SVG icons.
//   CDN = fast globally distributed server jo static files serve karta hai.
// =============================================================================
const NAV_ITEMS = [
  {
    key: "learn",           // Unique identifier for this item
    label: "LEARN",         // Text shown in expanded mode
    href: "/path",          // URL to navigate to on click
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/59a90a2cedd48b751a8fd22014768fd7.svg",
  },
  {
    key: "leaderboards",
    label: "LEADERBOARDS",
    href: "/leaderboard",
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/ca9178510134b4b0893dbac30b6670aa.svg",
  },
  {
    key: "quests",
    label: "QUESTS",
    href: "/quests",
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/7ef36bae3f9d68fc763d3451b5167836.svg",
  },
  {
    key: "shop",
    label: "SHOP",
    href: "/shop",
    iconUrl: "https://d35aaqx5ub95lt.cloudfront.net/vendor/0e58a94dda219766d98c7796b910beee.svg",
  },
  {
    key: "profile",
    label: "PROFILE",
    href: "/profile",
    isProfile: true, // Special flag: Profile icon is user avatar, not an iconUrl image
  },
  {
    key: "more",
    label: "MORE",
    href: "/settings",
    isMore: true, // Special flag: "More" shows "•••" dots instead of an icon
  },
];


// =============================================================================
// Sidebar Component
// =============================================================================
// React.FC<SidebarProps>:
//   React.FC = React Function Component
//   <SidebarProps> = TypeScript generic: ye component SidebarProps ke hisaab se typed hai
//
// ({ activeKey }): SidebarProps object se sirf activeKey destructure karo
// =============================================================================
export const Sidebar: React.FC<SidebarProps> = ({ activeKey }) => {

  // usePathname(): Current browser URL path retrieve karo.
  // e.g., pathname = "/path", "/leaderboard", "/shop"
  // Ye automatically update hota hai jab user navigate karta hai.
  const pathname = usePathname();


  // ── isItemActive(): Decide karo ki kaunsa nav item "active" (highlighted) hai ──
  // Parameters:
  //   key: string   → Item ka unique key (e.g., "learn")
  //   href: string  → Item ka URL (e.g., "/path")
  // Returns: boolean → true = is item ko highlight karo
  const isItemActive = (key: string, href: string) => {
    // Priority 1: Agar parent ne activeKey explicitly pass kiya hai
    //   (e.g., path/page.tsx → <Sidebar activeKey="learn" />)
    if (activeKey) return activeKey === key;

    // Priority 2: "Learn" item ke liye special case —
    //   "/", "/learn", "/path" teeno pe "Learn" active hona chahiye
    if (key === "learn" && (pathname === "/" || pathname === "/learn" || pathname === "/path")) {
      return true;
    }

    // Priority 3: URL se automatically detect karo
    // startsWith: Agar current URL href se start hota hai (e.g., "/leaderboard/xyz")
    return pathname.startsWith(href);
  };


  // ── JSX RETURN — Ye function teen alag sidebars render karta hai ──────────
  // Teeno ek saath render hote hain lekin CSS se sirf ek visible hota hai:
  //   Mode 1: "hidden md:flex lg:hidden" → Sirf medium screens par visible
  //   Mode 2: "hidden lg:flex"           → Sirf large screens par visible
  //   Mode 3: "md:hidden"                → Sirf mobile par visible
  //
  // <> ... </> = React Fragment: Multiple elements return karna bina extra div ke
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          MODE 1: COLLAPSED ICON-STRIP SIDEBAR (Medium screens: 768px–1024px)
          ════════════════════════════════════════════════════════════════════ */}
      {/* w-20 = 80px width | fixed = screen ke left corner pe fixed rehta hai */}
      {/* border-r-2 = right side par 2px border | z-40 = page content ke upar */}
      {/* select-none = text select nahi hoga | hidden md:flex lg:hidden = tablet only */}
      <aside className="w-20 fixed left-0 top-0 bottom-0 bg-[#131F24] border-r-2 border-[#37464F] py-5 flex flex-col items-center justify-between z-40 select-none hidden md:flex lg:hidden">
        <div className="flex flex-col items-center gap-6 w-full">

          {/* Duo Owl logo at top (icon only, no text) */}
          <Link
            href="/path"
            className="w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
            title="Duolingo Home" // HTML tooltip on hover
          >
            <img
              src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg"
              alt="Duo Owl"
              className="w-10 h-10 object-contain"
            />
          </Link>

          {/* Navigation Item Icons — Loop through all NAV_ITEMS */}
          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {/* .map(): Array ke har item ke liye ek JSX element banao */}
            {NAV_ITEMS.map((item) => {
              // Kya ye current item active hai?
              const active = isItemActive(item.key, item.href);

              return (
                // key={item.key}: React ko batao ki har item unique hai (performance)
                <div key={item.key} className="relative group flex items-center justify-center w-full">
                  {/* aria-label: Screen reader ke liye label (accessibility) */}
                  <Link href={item.href} aria-label={item.label} className="focus:outline-none">
                    <div
                      // Template literal: active hone par blue border, otherwise transparent
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border-2 ${active
                        ? "bg-[#1CB0F6]/10 border-[#1CB0F6]"     // Active: Blue highlight
                        : "border-transparent hover:bg-[#1A2C32]" // Inactive: Hover effect
                        }`}
                    >
                      {/* Conditional rendering based on item type:
                          isProfile → Avatar circle with "A"
                          isMore    → "•••" dots circle
                          default   → Icon image from CDN */}
                      {item.isProfile ? (
                        <div className="w-8 h-8 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-black text-xs">
                          A {/* Hardcoded user initial — in real app, would be dynamic */}
                        </div>
                      ) : item.isMore ? (
                        <div className="w-8 h-8 rounded-full bg-[#CE82FF]/20 flex items-center justify-center text-[#CE82FF] font-black text-xs">
                          •••
                        </div>
                      ) : (
                        <img
                          src={item.iconUrl}
                          alt={item.label}
                          className="w-7 h-7 object-contain"
                        />
                      )}
                    </div>
                  </Link>

                  {/* Tooltip: "group-hover:opacity-100" = visible when parent div hovered
                      "opacity-0" = hidden by default, appears on group hover
                      "pointer-events-none" = tooltip itself is not hoverable */}
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1A2C32] border border-[#37464F] text-white text-xs font-black uppercase px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>


      {/* ══════════════════════════════════════════════════════════════════════
          MODE 2: EXPANDED SIDEBAR (Large screens: 1024px+, 256px wide)
          ════════════════════════════════════════════════════════════════════ */}
      {/* hidden lg:flex: Sirf lg+ (1024px+) screens par visible */}
      <aside className="w-[256px] fixed left-0 top-0 bottom-0 bg-[#131F24] border-r-2 border-[#37464F] flex flex-col z-40 select-none hidden lg:flex">

        {/* Logo header: Owl face + "duolingo" text */}
        {/* h-[72px]: Topbar (56px) se thoda bada — visually aligns */}
        {/* border-b-2: Bottom border separates logo from nav items */}
        <Link
          href="/path"
          className="h-[72px] px-5 flex items-center gap-3 border-b-2 border-[#37464F] shrink-0 hover:opacity-80 transition-opacity"
        >
          <img
            src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg"
            alt="Duo Owl"
            className="w-10 h-10 object-contain"
          />
          {/* "lowercase" class: CSS text-transform: lowercase */}
          <span className="font-black text-2xl tracking-tight text-[#58CC02] lowercase">
            duolingo
          </span>
        </Link>

        {/* Scrollable content area: Nav items + Bottom promo card */}
        {/* flex-1: Remaining height fill karo */}
        {/* justify-between: Items top par, promo bottom par */}
        <div className="flex flex-col flex-1 justify-between px-4 py-6 overflow-y-auto">

          {/* Navigation items with ICON + LABEL */}
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.key, item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 ${active
                    ? "bg-[#1CB0F6]/10 border-[#1CB0F6] text-[#1CB0F6]" // Active: Blue
                    : "border-transparent text-[#8A9BA3] hover:bg-[#1A2C32] hover:text-white" // Inactive
                    }`}
                >
                  {/* Same icon/avatar logic as Mode 1 */}
                  {item.isProfile ? (
                    <div className="w-8 h-8 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-black text-xs shrink-0">
                      A
                    </div>
                  ) : item.isMore ? (
                    <div className="w-8 h-8 rounded-full bg-[#CE82FF]/20 flex items-center justify-center text-[#CE82FF] shrink-0 font-black">
                      •••
                    </div>
                  ) : (
                    <img
                      src={item.iconUrl}
                      alt={item.label}
                      className="w-8 h-8 object-contain shrink-0"
                    />
                  )}
                  {/* Label text — only shown in expanded mode */}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Promo Card — Chess upsell */}
          <div className="bg-[#1A2C32] border-2 border-[#37464F] rounded-2xl p-4 text-center space-y-2">
            <div className="text-3xl">♟️</div>
            <h4 className="text-sm font-black text-white leading-tight">
              Want to learn chess?
            </h4>
            <p className="text-xs font-bold text-[#8A9BA3]">
              Duolingo makes it easy!
            </p>
            <button className="text-xs font-black text-[#1CB0F6] uppercase hover:underline pt-1">
              TRY CHESS
            </button>
          </div>

        </div>
      </aside>


      {/* ══════════════════════════════════════════════════════════════════════
          MODE 3: MOBILE BOTTOM NAVIGATION BAR (< 768px screens)
          ════════════════════════════════════════════════════════════════════ */}
      {/* fixed bottom-0: Screen ke bilkul bottom par chipka hua */}
      {/* h-16 = 64px height | md:hidden = tablet/desktop par hide ho jao */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#131F24] border-t-2 border-[#37464F] flex items-center justify-around z-40 select-none md:hidden px-2">
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item.key, item.href);
          return (
            <Link key={item.key} href={item.href} aria-label={item.label} className="focus:outline-none">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                  active ? "bg-[#1CB0F6]/10 border-[#1CB0F6]" : "border-transparent"
                }`}
              >
                {/* Same icon logic as Mode 1 & 2 */}
                {item.isProfile ? (
                  <div className="w-7 h-7 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-black text-xs">
                    A
                  </div>
                ) : item.isMore ? (
                  <div className="w-7 h-7 rounded-full bg-[#CE82FF]/20 flex items-center justify-center text-[#CE82FF] font-black text-xs">
                    •••
                  </div>
                ) : (
                  <img src={item.iconUrl} alt={item.label} className="w-6 h-6 object-contain" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
