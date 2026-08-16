# ==============================================================================
# DATABASE ORM MODELS FOR PROGRESS & SECURITY ATTEMPTS (models/progress.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Is file me user ke saare Progress Records store hote hain:
# 1. UserCourseEnrollment: User ne kaunsa course join kiya hai.
# 2. UserSkillProgress: User ka ek Skill me kitna level aur kitne lessons complete huye hain.
# 3. UserLessonAttempt: SECURITY SESSION! Server har lesson start hone par ek attempt ID
#    create karta hai aur XP/Hearts server-side count karta hai taaki client cheat na kar sake.
# 4. UserAchievement: User ke Badges (e.g. 7 day streak badge).
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. Column, Integer, String, ForeignKey, DateTime, Boolean (SQLAlchemy Inbuilt Data Types):
# 2. UniqueConstraint (SQLAlchemy Inbuilt Constraint):
#    Table level Rule jo guarantee karta hai ki (user_id, course_id) duplicate nahi hoga.
# 3. func (SQLAlchemy Inbuilt Helper): For `server_default=func.now()`.
# 4. Base (Custom Core Import): Inherited SQLAlchemy Base class.
# ------------------------------------------------------------------------------
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

# ==============================================================================
# USER COURSE ENROLLMENT MODEL (`user_course_enrollments` table in Database)
# ==============================================================================
class UserCourseEnrollment(Base):
    __tablename__ = 'user_course_enrollments'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    enrolled_at = Column(DateTime, server_default=func.now())
    
    # Inbuilt SQLAlchemy Unique Constraint: Ek user ek hi course me 2 baar enroll nahi ho sakta.
    __table_args__ = (UniqueConstraint('user_id', 'course_id'),)
    
    user = relationship('User', back_populates='enrollments')
    course = relationship('Course', back_populates='enrollments')

# ==============================================================================
# USER SKILL PROGRESS MODEL (`user_skill_progress` table in Database)
# ==============================================================================
class UserSkillProgress(Base):
    __tablename__ = 'user_skill_progress'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    skill_id = Column(Integer, ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    level = Column(Integer, default=0)              # Current Skill Level / Crown Level (0 = locked/not started)
    completed_lessons = Column(Integer, default=0) # Completed lessons count in this level
    total_lessons = Column(Integer, default=2)     # Total lessons required to level up
    completed_at = Column(DateTime, nullable=True)  # Timestamp when skill was 100% finished
    
    __table_args__ = (UniqueConstraint('user_id', 'skill_id'),)
    
    user = relationship('User', back_populates='skill_progress')
    skill = relationship('Skill', back_populates='user_progress')

# ==============================================================================
# USER LESSON ATTEMPT MODEL (`user_lesson_attempts` table in Database)
# ==============================================================================
# HINDI CONCEPT: "Security Ticket / Ledger Entry"
# Jab user lesson shuru karta hai, `/start` route ek `attempt_id` generates karta hai.
# Server is row me `xp_earned` (+10 per right answer) aur `hearts_lost` (+1 per wrong answer)
# khud increment karta hai. Client in numbers ko modify nahi kar sakta!
# ==============================================================================
class UserLessonAttempt(Base):
    __tablename__ = 'user_lesson_attempts'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    lesson_id = Column(Integer, ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    xp_earned = Column(Integer, default=0)    # Server-accumulated XP
    hearts_lost = Column(Integer, default=0)  # Server-accumulated hearts lost
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True) # Set when `/complete` endpoint is called
    passed = Column(Boolean, default=False)   # Set to True if hearts_lost < 5

    user = relationship('User', back_populates='lesson_attempts')
    lesson = relationship('Lesson', back_populates='attempts')

# ==============================================================================
# USER ACHIEVEMENT MODEL (`user_achievements` table in Database)
# ==============================================================================
class UserAchievement(Base):
    __tablename__ = 'user_achievements'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    achievement_type = Column(String(100), nullable=False)  # Badge identifier (e.g. 'wildfire_streak_7')
    achieved_at = Column(DateTime, server_default=func.now())
    
    user = relationship('User', back_populates='achievements')

