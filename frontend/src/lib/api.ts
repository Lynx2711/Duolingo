// src/lib/api.ts — Centralized API Client (Updated for server-side security model)
//
// All lesson-related calls now follow the secure attempt_id pattern:
// /start -> attempt_id -> /check-answer (with attempt_id) -> /complete (with attempt_id only)

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:8000";
  }
  return "https://duolingo-backend-vrcj.onrender.com";
};

// Generic typed fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const text = await response.text();

  if (!response.ok) {
    let errorDetail = `API Error: ${response.status} ${response.statusText}`;
    if (text) {
      try {
        const errorData = JSON.parse(text);
        if (errorData?.detail) errorDetail = errorData.detail;
      } catch {}
    }
    throw new Error(errorDetail);
  }

  if (!text || !text.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response from endpoint ${cleanEndpoint}`);
  }
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
