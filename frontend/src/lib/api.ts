// src/lib/api.ts — Centralized API Client (Updated for server-side security model)
//
// All lesson-related calls now follow the secure attempt_id pattern:
// /start -> attempt_id -> /check-answer (with attempt_id) -> /complete (with attempt_id only)

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Generic typed fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API Error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// ── User ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getUser: (userId: number) => fetchApi(`/api/users/${userId}`),
  updateUser: (userId: number, data: Record<string, unknown>) =>
    fetchApi(`/api/users/${userId}`, { method: "PATCH", body: JSON.stringify(data) }),
  refillHearts: (userId: number) =>
    fetchApi(`/api/users/${userId}/refill-hearts`, { method: "POST" }),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const courseApi = {
  getCourses: () => fetchApi("/api/courses"),
  getCourse: (courseId: number) => fetchApi(`/api/courses/${courseId}`),
  getLearningPath: (courseId: number, userId: number) =>
    fetchApi(`/api/courses/${courseId}/path/${userId}`),
  getGuidebook: (unitId: number) =>
    fetchApi(`/api/courses/units/${unitId}/guidebook`),
};

// ── Lessons (secure attempt_id model) ─────────────────────────────────────────
export const lessonApi = {
  // Step 0: Load the lesson exercises (correct_answer stripped server-side)
  getLesson: (lessonId: number) => fetchApi(`/api/lessons/${lessonId}`),

  // Step 1: Create a server-side attempt record, receive attempt_id
  startLesson: (lessonId: number, userId: number): Promise<number> =>
    fetchApi(`/api/lessons/${lessonId}/start/${userId}`, { method: "POST" }),

  // Step 2: Check each answer — server logs XP/hearts to attempt row
  checkAnswer: (
    lessonId: number,
    data: {
      exercise_id: number;
      attempt_id: number;       // required — server logs result against this attempt
      user_answer?: string | string[] | null;
      user_pairs?: string[][] | null;
    }
  ) =>
    fetchApi(`/api/lessons/${lessonId}/check-answer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Step 3: Finalize lesson — server reads accumulated XP/hearts from DB (client sends ONLY attempt_id)
  completeLesson: (lessonId: number, userId: number, attemptId: number) =>
    fetchApi(`/api/lessons/${lessonId}/complete/${userId}`, {
      method: "POST",
      body: JSON.stringify({ attempt_id: attemptId }),
    }),
};

// ── Progress ─────────────────────────────────────────────────────────────────
export const progressApi = {
  getUserProgress: (userId: number) => fetchApi(`/api/progress/users/${userId}`),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboardApi = {
  getLeaderboard: () => fetchApi("/api/leaderboard/"),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  getProfile: (userId: number) => fetchApi(`/api/profile/${userId}`),
};

// ── Health ────────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => fetchApi("/health"),
};
