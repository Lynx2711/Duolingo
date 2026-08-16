# ==============================================================================
# PYDANTIC SCHEMAS FOR USER MANAGEMENT (schemas/user.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# User Data Validation:
# - UserCreate: Naya user sign up karne ka JSON format.
# - UserUpdate: User profile edit (PATCH) karte waqt format (Subhi fields optional hain).
# - UserResponse: API se frontend ko user stats (XP, Hearts, Gems, Streak) bhejne ka JSON format.
# ==============================================================================

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class UserBase(BaseModel):
    name: str              # User Name
    email: str             # User Email

class UserCreate(UserBase):
    pass                   # Inherits name & email from UserBase

# ==============================================================================
# USER UPDATE SCHEMA (For PATCH Requests)
# ==============================================================================
# HINDI CONCEPT: Partial Updates
# Sabhi fields `Optional[...]=None` rakhe gaye hain taaki user chahe toh sirf
# avatar update kare ya sirf name, bina bakiyon ko distrub kiye.
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    xp_total: Optional[int] = None
    streak: Optional[int] = None
    hearts: Optional[int] = None
    gems: Optional[int] = None
    last_active_date: Optional[date] = None
    daily_goal_xp: Optional[int] = None

# ==============================================================================
# USER RESPONSE SCHEMA (Server -> Client Response)
# ==============================================================================
class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    xp_total: int
    streak: int
    hearts: int
    max_hearts: int
    gems: int
    last_active_date: Optional[date] = None
    daily_goal_xp: int
    created_at: datetime

    # Inbuilt Pydantic Config: Allows converting SQLAlchemy User ORM object to JSON
    model_config = ConfigDict(from_attributes=True)

