# ==============================================================================
# DATABASE ORM MODEL FOR APPLICATION USERS (models/user.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# User Model Duolingo app ke Gamification stats ko track karta hai:
# - XP (Experience Points)
# - Streak (Lagatar kitne din se app use kar raha hai)
# - Hearts (Zindagi/Lives - Max 5)
# - Gems (Virtual currency)
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. Column, Integer, String, Date, DateTime (SQLAlchemy Inbuilt Data Types):
#    SQL Data Types represent karta hai.
# 2. func (SQLAlchemy Inbuilt SQL Function Helper):
#    `func.now()` SQLite database engine se current timestamp get karta hai.
# 3. relationship (SQLAlchemy Inbuilt): ORM Relationship mapping.
# 4. Base (Custom Core Import): Inherited SQLAlchemy Base class.
# ------------------------------------------------------------------------------
from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

# ==============================================================================
# USER MODEL (`users` table in Database)
# ==============================================================================
class User(Base):
    __tablename__ = 'users'

    # Primary Key Column with Indexing for fast SQL queries
    id = Column(Integer, primary_key=True, index=True)
    # User Profile Info
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    
    # Gamification Counters:
    xp_total = Column(Integer, default=0)         # Lifetime total XP earned
    streak = Column(Integer, default=0)           # Consecutive active days count
    hearts = Column(Integer, default=5)           # Current remaining hearts (0-5)
    max_hearts = Column(Integer, default=5)       # Max hearts cap (5)
    gems = Column(Integer, default=500)           # Virtual currency balance
    last_active_date = Column(Date, nullable=True)# Date of last completed lesson (for streak calculation)
    daily_goal_xp = Column(Integer, default=20)   # User's daily target XP
    
    # Inbuilt SQL Function (`func.now()`): Automatic timestamp when row is created
    created_at = Column(DateTime, server_default=func.now())

    # --------------------------------------------------------------------------
    # ORM RELATIONSHIPS:
    # --------------------------------------------------------------------------
    # Links to user's enrollments, progress, lesson attempts, and achievements.
    enrollments = relationship('UserCourseEnrollment', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)
    skill_progress = relationship('UserSkillProgress', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)
    lesson_attempts = relationship('UserLessonAttempt', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)
    achievements = relationship('UserAchievement', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)

