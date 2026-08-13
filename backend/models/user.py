# Import Column, Integer, String, Date, DateTime from sqlalchemy to define model fields
from sqlalchemy import Column, Integer, String, Date, DateTime
# Import func from sqlalchemy.sql to use SQL functions like now()
from sqlalchemy.sql import func
# Import relationship from sqlalchemy.orm to define relationships between tables
from sqlalchemy.orm import relationship
# Import Base from core.database to inherit from the declarative base
from core.database import Base

# Define the User model which represents application users
class User(Base):
    # Set the table name in the database
    __tablename__ = 'users'

    # Define the primary key column (id), auto-incremented integer, indexed for fast lookups
    id = Column(Integer, primary_key=True, index=True)
    # Define the name column, string up to 100 chars, required
    name = Column(String(100), nullable=False)
    # Define the email column, string up to 255 chars, must be unique, required
    email = Column(String(255), unique=True, nullable=False)
    # Define the avatar_url column for profile pictures, string up to 500 chars, optional
    avatar_url = Column(String(500), nullable=True)
    # Define xp_total to track lifetime XP, default is 0
    xp_total = Column(Integer, default=0)
    # Define streak to track consecutive days of activity, default is 0
    streak = Column(Integer, default=0)
    # Define hearts to track current health in the game, default is 5
    hearts = Column(Integer, default=5)
    # Define max_hearts to cap the maximum health, default is 5
    max_hearts = Column(Integer, default=5)
    # Define gems to track virtual currency, default is 500
    gems = Column(Integer, default=500)
    # Define last_active_date to calculate daily streaks, optional
    last_active_date = Column(Date, nullable=True)
    # Define daily_goal_xp to set user's XP target, default is 20
    daily_goal_xp = Column(Integer, default=20)
    # Define created_at to track account creation time, defaults to current server time
    created_at = Column(DateTime, server_default=func.now())

    # Define relationship to UserCourseEnrollment, enabling cascading deletes
    enrollments = relationship('UserCourseEnrollment', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)
    # Define relationship to UserSkillProgress, enabling cascading deletes
    skill_progress = relationship('UserSkillProgress', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)
    # Define relationship to UserLessonAttempt, enabling cascading deletes
    lesson_attempts = relationship('UserLessonAttempt', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)
    # Define relationship to UserAchievement, enabling cascading deletes
    achievements = relationship('UserAchievement', back_populates='user', cascade='all, delete-orphan', passive_deletes=True)
