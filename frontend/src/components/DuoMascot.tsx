// =============================================================================
// src/components/DuoMascot.tsx — Duolingo Owl Mascot Component
// =============================================================================
//
// Ye ek simple REUSABLE COMPONENT hai jo Duolingo ka official Owl mascot image
// dikhata hai with a smooth up-down bounce animation.
//
// Kahan use hota hai?
//   - PathNode.tsx: "Next available" lesson node ke side me bounce karta dikhta hai
//   - lesson/page.tsx: Lesson complete/fail modal me
//   - Loading states me
//
// Component itna chhota kyun hai?
//   Kyunki ek cheez ko baar baar use karte hain — isliye ek component bana diya.
//   "DRY Principle" — Don't Repeat Yourself.
//   <DuoMascot width={68} height={68} /> baar baar likhna batter hai ek hi
//   <img src="...long-url..." /> ko baar baar copy-paste karne se.
// =============================================================================

// "use client" NAHI hai is file me — kyunki:
//   Koi browser-specific hooks (useState, useEffect) nahi hain.
//   Ye sirf ek static image render karta hai with CSS animation.
//   SSR (Server Side Rendering) me bhi render ho sakta hai.

// React: JSX (HTML-like syntax in JavaScript) likhne ke liye import karna zaroori hai.
import React from "react";


// =============================================================================
// DuoMascotProps Interface
// =============================================================================
// Ye interface is component ki "API" define karta hai — yaani koi bhi is component
// ko use karte waqt kya kya pass kar sakta hai.
//
// Sab ? (optional) kyun hain?
//   Isliye ki caller ko kuch bhi pass karne ki zaroorat nahi — sab ke default
//   values hain. <DuoMascot /> sirf itna likhne se bhi kaam karta hai.
// =============================================================================
interface DuoMascotProps {
  width?: number;    // ? = Optional. Image ki width pixels me. Default: 80
  height?: number;   // ? = Optional. Image ki height pixels me. Default: 80
  className?: string; // ? = Optional. Extra CSS classes pass karne ke liye.
                      // Default: "" (khaali string = koi extra class nahi)
}


// =============================================================================
// DuoMascot Component
// =============================================================================
// Default parameter values: ({ width = 80, height = 80, className = "" })
//   Agar parent width pass nahi karta toh 80 use hoga automatically.
//   Agar PathNode pass karta hai width={68} toh 68 use hoga.
// =============================================================================
export const DuoMascot: React.FC<DuoMascotProps> = ({
  width = 80,       // Default: 80px wide
  height = 80,      // Default: 80px tall
  className = "",   // Default: no extra classes
}) => {
  return (
    // Container div:
    // className prop + template literal se extra classes merge karte hain
    // select-none: Text selection nahi hogi (click karne par text select na ho)
    // pointer-events-none: Mouse clicks is element ke through pass ho jayenge
    //   (taaki neeche wale elements clickable rahein — e.g., lesson node)
    // flex items-center justify-center: Image perfectly centered rahe
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      style={{
        // Inline CSS animation:
        // "owl-jump" = custom keyframe animation defined in globals.css
        // 1.2s: Animation duration (1.2 seconds per cycle)
        // ease-in-out: Slow start, fast middle, slow end (smooth bounce feel)
        // infinite: Kabhi ruko nahi — repeat karte raho
        animation: "owl-jump 1.2s ease-in-out infinite",
      }}
    >
      {/* Official Duolingo Owl SVG from their CDN */}
      {/* Ye URL Duolingo ke actual server se SVG file serve karta hai */}
      <img
        src="https://d35aaqx5ub95lt.cloudfront.net/vendor/70a4be81077a8037698067f583816ff9.svg"
        alt="Duo Owl Mascot" // Alt text: Accessibility ke liye + image load fail ho toh dikhta hai
        style={{
          width: `${width}px`,   // Template literal: 80 → "80px" string convert
          height: `${height}px`, // Same for height
          objectFit: "contain",  // Image ko distort kiye bina box me fit karo
                                 // (aspect ratio maintain karo)
        }}
      />
    </div>
  );
};
