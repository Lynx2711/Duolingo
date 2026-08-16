# ==============================================================================
# PYDANTIC SCHEMAS FOR PROGRESS, LEADERBOARD & PROFILE (schemas/progress.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# - UserSkillProgressResponse: Skill level summary.
# - LeaderboardEntry: Leaderboard screen par har user ki rank, avatar aur XP.
# - ProfileResponse: Profile tab screen ke liye aggregated user stats summary payload.
# ==============================================================================

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from schemas.user import UserResponse  # Importing UserResponse for nesting inside Profile

# ==============================================================================
# USER SKILL PROGRESS RESPONSE SCHEMA
# ==============================================================================
class UserSkillProgressResponse(BaseModel):
    id: int
    user_id: int
    skill_id: int
    level: int
    completed_lessons: int
    total_lessons: int
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ==============================================================================
# LESSON ATTEMPT RESPONSE SCHEMA
# ==============================================================================
class UserLessonAttemptResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    xp_earned: int
    hearts_lost: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    passed: bool

    model_config = ConfigDict(from_attributes=True)

# ==============================================================================
# LEADERBOARD ENTRY SCHEMA (For `/api/leaderboard`)
# ==============================================================================
class LeaderboardEntry(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    xp_total: int

# ==============================================================================
# PROFILE RESPONSE SCHEMA (For `/api/profile/{user_id}`)
# ==============================================================================
# HINDI CONCEPT: Nested Schemas
# Notice `user: UserResponse` -> Ek Pydantic Schema ke andar dusra Pydantic Schema embed kiya gaya hai.
class ProfileResponse(BaseModel):
    user: UserResponse                  # Nested User Details (name, xp, streak, hearts...)
    total_skills_completed: int         # Count of skills with level >= 1
    total_lessons_completed: int        # Count of successfully passed attempts
    current_course: Optional[str] = None# Active course name e.g. "Spanish"
    achievements: List[str]             # List of earned badge names

