// lib/api.ts — Centralized API Client Configuration
//
// This module provides a single source of truth for all API calls to the
// FastAPI backend. By centralizing the base URL and fetch configuration,
// we avoid duplicating API URLs across components and make it easy to
// switch between development (localhost:8000) and production (deployed URL).

// ===================================================================
// BASE URL CONFIGURATION
// ===================================================================

// Read the API base URL from environment variables.
// NEXT_PUBLIC_ prefix makes this variable available in the browser (client-side).
// In development: defaults to http://localhost:8000
// In production: set this to your deployed backend URL (e.g., Render)
const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ===================================================================
// GENERIC FETCH WRAPPER
// ===================================================================

// A typed fetch wrapper that handles JSON parsing, error handling, and
// common headers. This reduces boilerplate in every API call.
async function fetchApi<T>(
  // The API endpoint path (e.g., '/api/users/1')
  endpoint: string,
  // Optional fetch configuration (method, body, headers, etc.)
  options: RequestInit = {}
): Promise<T> {
  // Construct the full URL by combining base URL with the endpoint path
  const url = `${API_BASE_URL}${endpoint}`;

  // Make the fetch request with default headers merged with any custom options
  const response = await fetch(url, {
    // Spread any custom options (method, body, etc.) provided by the caller
    ...options,
    // Set default headers, allowing callers to override if needed
    headers: {
      // Default to JSON content type for all requests
      "Content-Type": "application/json",
      // Merge in any additional headers from the caller
      ...options.headers,
    },
  });

  // Check if the response indicates an error (status code >= 400)
  if (!response.ok) {
    // Try to extract error details from the response body
    const errorData = await response.json().catch(() => null);
    // Throw a descriptive error with the status code and any error detail
    throw new Error(
      errorData?.detail || `API Error: ${response.status} ${response.statusText}`
    );
  }

  // Parse and return the JSON response body, cast to the expected type T
  return response.json() as Promise<T>;
}

// ===================================================================
// USER API ENDPOINTS
// ===================================================================

// Provides methods for interacting with user-related API endpoints
export const userApi = {
  // Fetch a single user by their ID
  // Used by: top bar (hearts, gems, streak), profile page, lesson player
  getUser: (userId: number) => fetchApi(`/api/users/${userId}`),

  // Update user fields (partial update using PATCH)
  // Used by: settings page, after lesson completion (XP, hearts updates)
  updateUser: (userId: number, data: Record<string, unknown>) =>
    fetchApi(`/api/users/${userId}`, {
      method: "PATCH", // PATCH for partial updates (only send changed fields)
      body: JSON.stringify(data), // Serialize the update payload to JSON
    }),

  // Refill hearts to max by spending gems (costs 350 gems)
  // Used by: "out of hearts" modal, practice button
  refillHearts: (userId: number) =>
    fetchApi(`/api/users/${userId}/refill-hearts`, {
      method: "POST", // POST because this is a state-changing action
    }),
};

// ===================================================================
// COURSE API ENDPOINTS
// ===================================================================

// Provides methods for interacting with course/skill-tree endpoints
export const courseApi = {
  // Fetch all available courses
  // Used by: course selection page (future multi-course support)
  getCourses: () => fetchApi("/api/courses"),

  // Fetch a single course by ID
  // Used by: course detail/info page
  getCourse: (courseId: number) => fetchApi(`/api/courses/${courseId}`),

  // Fetch the learning path/skill tree for a specific user and course
  // This is the CORE endpoint for the home/path screen — returns units,
  // skills with progress, and lock/unlock status
  getLearningPath: (courseId: number, userId: number) =>
    fetchApi(`/api/courses/${courseId}/path/${userId}`),
};

// ===================================================================
// LESSON API ENDPOINTS
// ===================================================================

// Provides methods for the lesson player flow
export const lessonApi = {
  // Fetch a lesson with all its exercises
  // Note: correct_answer is stripped server-side to prevent cheating
  // Used by: lesson player to load exercise sequence
  getLesson: (lessonId: number) => fetchApi(`/api/lessons/${lessonId}`),

  // Start a new lesson attempt (creates a UserLessonAttempt record)
  // Returns the attempt ID for tracking this session
  startLesson: (lessonId: number, userId: number) =>
    fetchApi(`/api/lessons/${lessonId}/start/${userId}`, {
      method: "POST",
    }),

  // Check a user's answer for a specific exercise
  // Returns whether it was correct, the right answer, and XP earned
  checkAnswer: (
    lessonId: number,
    data: { exercise_id: number; user_answer: string | string[] }
  ) =>
    fetchApi(`/api/lessons/${lessonId}/check-answer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Complete a lesson attempt — finalizes XP, hearts, and progress
  // Triggers streak updates and skill progress calculations
  completeLesson: (
    lessonId: number,
    userId: number,
    data: { xp_earned: number; hearts_lost: number; passed: boolean }
  ) =>
    fetchApi(`/api/lessons/${lessonId}/complete/${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ===================================================================
// PROGRESS API ENDPOINTS
// ===================================================================

// Provides methods for accessing user progress data
export const progressApi = {
  // Get all skill progress records for a user
  // Used by: skill tree to show crown levels and progress rings
  getUserProgress: (userId: number) =>
    fetchApi(`/api/progress/users/${userId}`),

  // Get progress for a specific skill
  // Used by: skill detail modal
  getSkillProgress: (userId: number, skillId: number) =>
    fetchApi(`/api/progress/users/${userId}/skills/${skillId}`),

  // Get all lesson attempts for a user
  // Used by: history/stats page
  getUserAttempts: (userId: number) =>
    fetchApi(`/api/progress/users/${userId}/attempts`),
};

// ===================================================================
// LEADERBOARD API ENDPOINTS
// ===================================================================

// Provides methods for the leaderboard feature
export const leaderboardApi = {
  // Fetch the top users ranked by XP
  // Used by: leaderboard page/tab
  getLeaderboard: () => fetchApi("/api/leaderboard"),
};

// ===================================================================
// PROFILE API ENDPOINTS
// ===================================================================

// Provides methods for the user profile page
export const profileApi = {
  // Fetch comprehensive profile data including stats and achievements
  // Used by: profile page
  getProfile: (userId: number) => fetchApi(`/api/profile/${userId}`),
};

// ===================================================================
// HEALTH CHECK
// ===================================================================

// Simple health check to verify the backend is reachable
// Used by: connection status indicator, deployment verification
export const healthApi = {
  check: () => fetchApi("/health"),
};
