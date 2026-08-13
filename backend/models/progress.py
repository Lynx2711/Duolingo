# Import Column types, ForeignKey, UniqueConstraint, and Boolean
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, UniqueConstraint
# Import func for database-side timestamp generation
from sqlalchemy.sql import func
# Import relationship to link models
from sqlalchemy.orm import relationship
# Import Base from core.database
from core.database import Base

# Define UserCourseEnrollment model to track which users are taking which courses
class UserCourseEnrollment(Base):
    # Set the table name
    __tablename__ = 'user_course_enrollments'

    # Primary key
    id = Column(Integer, primary_key=True)
    # Foreign key to user, CASCADE delete
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # Foreign key to course, CASCADE delete
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    # Timestamp of enrollment, auto-set on creation
    enrolled_at = Column(DateTime, server_default=func.now())
    
    # Ensure a user can only enroll in a specific course once
    __table_args__ = (UniqueConstraint('user_id', 'course_id'),)
    
    # Relationship back to User
    user = relationship('User', back_populates='enrollments')
    # Relationship back to Course
    course = relationship('Course', back_populates='enrollments')

# Define UserSkillProgress model to track progress within specific skills
class UserSkillProgress(Base):
    # Set the table name
    __tablename__ = 'user_skill_progress'

    # Primary key
    id = Column(Integer, primary_key=True)
    # Foreign key to user, CASCADE delete
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # Foreign key to skill, CASCADE delete
    skill_id = Column(Integer, ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    # Current crown level (0 = not started), default 0
    level = Column(Integer, default=0)
    # Number of completed lessons in the current level, default 0
    completed_lessons = Column(Integer, default=0)
    # Total number of lessons in this skill level for calculating progress, default 2
    total_lessons = Column(Integer, default=2)
    # Timestamp when skill was fully completed, optional
    completed_at = Column(DateTime, nullable=True)
    
    # Ensure a user only has one progress record per skill
    __table_args__ = (UniqueConstraint('user_id', 'skill_id'),)
    
    # Relationship back to User
    user = relationship('User', back_populates='skill_progress')
    # Relationship back to Skill
    skill = relationship('Skill', back_populates='user_progress')

# Define UserLessonAttempt model to record individual lesson sessions
class UserLessonAttempt(Base):
    # Set the table name
    __tablename__ = 'user_lesson_attempts'

    # Primary key
    id = Column(Integer, primary_key=True)
    # Foreign key to user, CASCADE delete
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # Foreign key to lesson, CASCADE delete
    lesson_id = Column(Integer, ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    # XP earned during this attempt, default 0
    xp_earned = Column(Integer, default=0)
    # Number of hearts lost during this attempt, default 0
    hearts_lost = Column(Integer, default=0)
    # Timestamp when lesson started, auto-set
    started_at = Column(DateTime, server_default=func.now())
    # Timestamp when lesson finished, optional
    completed_at = Column(DateTime, nullable=True)
    # Boolean indicating if the user successfully passed the lesson
    passed = Column(Boolean, default=False)
    
    # Relationship back to User
    user = relationship('User', back_populates='lesson_attempts')
    # Relationship back to Lesson
    lesson = relationship('Lesson', back_populates='attempts')

# Define UserAchievement model to track badges/milestones earned by users
class UserAchievement(Base):
    # Set the table name
    __tablename__ = 'user_achievements'

    # Primary key
    id = Column(Integer, primary_key=True)
    # Foreign key to user, CASCADE delete
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    # String identifying the type of achievement (e.g., 'streak_3'), required
    achievement_type = Column(String(100), nullable=False)
    # Timestamp when achievement was earned, auto-set
    achieved_at = Column(DateTime, server_default=func.now())
    
    # Relationship back to User
    user = relationship('User', back_populates='achievements')
