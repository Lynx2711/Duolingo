# Import BaseModel and ConfigDict for schemas
from pydantic import BaseModel, ConfigDict
# Import datetime, Optional, List for type hints
from typing import Optional, List
from datetime import datetime
# Import UserResponse to embed in ProfileResponse
from schemas.user import UserResponse

# Define response schema for UserSkillProgress
class UserSkillProgressResponse(BaseModel):
    # Record ID
    id: int
    # User ID
    user_id: int
    # Skill ID
    skill_id: int
    # Current crown level
    level: int
    # Completed lessons in current level
    completed_lessons: int
    # Total lessons in current level
    total_lessons: int
    # Timestamp of completion, optional
    completed_at: Optional[datetime] = None

    # Enable reading from ORM attributes
    model_config = ConfigDict(from_attributes=True)

# Define response schema for UserLessonAttempt
class UserLessonAttemptResponse(BaseModel):
    # Record ID
    id: int
    # User ID
    user_id: int
    # Lesson ID
    lesson_id: int
    # XP earned in attempt
    xp_earned: int
    # Hearts lost in attempt
    hearts_lost: int
    # Timestamp when started
    started_at: datetime
    # Timestamp when finished, optional
    completed_at: Optional[datetime] = None
    # Boolean indicating if passed
    passed: bool

    # Enable reading from ORM attributes
    model_config = ConfigDict(from_attributes=True)

# Define schema for a single entry on the leaderboard
class LeaderboardEntry(BaseModel):
    # User ID
    id: int
    # User name
    name: str
    # User avatar URL, optional
    avatar_url: Optional[str] = None
    # User total XP (score)
    xp_total: int

# Define schema for a user's full profile page data
class ProfileResponse(BaseModel):
    # Nested user information
    user: UserResponse
    # Total number of skills fully completed
    total_skills_completed: int
    # Total number of lessons successfully passed
    total_lessons_completed: int
    # Name of the currently active course, optional
    current_course: Optional[str] = None
    # List of achievement strings earned by user
    achievements: List[str]
