# Import BaseModel and ConfigDict from pydantic to define schemas
from pydantic import BaseModel, ConfigDict
# Import datetime, date, and Optional from typing for type hints
from typing import Optional
from datetime import datetime, date

# Define the base user schema containing common fields
class UserBase(BaseModel):
    # User's name, required string
    name: str
    # User's email, required string
    email: str

# Define schema for creating a new user, inherits name and email from UserBase
class UserCreate(UserBase):
    # No additional fields needed for creation currently, using pass
    pass

# Define schema for updating a user, all fields are optional
class UserUpdate(BaseModel):
    # Optional name update
    name: Optional[str] = None
    # Optional email update
    email: Optional[str] = None
    # Optional avatar URL update
    avatar_url: Optional[str] = None
    # Optional total XP update
    xp_total: Optional[int] = None
    # Optional streak update
    streak: Optional[int] = None
    # Optional hearts update
    hearts: Optional[int] = None
    # Optional gems update
    gems: Optional[int] = None
    # Optional last active date update
    last_active_date: Optional[date] = None
    # Optional daily goal XP update
    daily_goal_xp: Optional[int] = None

# Define response schema representing a user returned from the API
class UserResponse(UserBase):
    # User ID, integer
    id: int
    # Avatar URL, optional string
    avatar_url: Optional[str] = None
    # Total lifetime XP
    xp_total: int
    # Current consecutive day streak
    streak: int
    # Current health/hearts
    hearts: int
    # Maximum health capacity
    max_hearts: int
    # Current virtual currency
    gems: int
    # Date of last activity
    last_active_date: Optional[date] = None
    # User's daily XP target
    daily_goal_xp: int
    # Account creation timestamp
    created_at: datetime

    # Configure Pydantic to read data from SQLAlchemy ORM models
    model_config = ConfigDict(from_attributes=True)
