// src/app/learn/[lessonId]/page.tsx — Alias route for /learn/[lessonId] -> /lesson/[lessonId]
//
// In Duolingo, lessons can be accessed via /learn/[lessonId] or /lesson/[lessonId].
// This route re-exports the LessonPage component so both URLs work seamlessly.

export { default } from "../../lesson/[lessonId]/page";
