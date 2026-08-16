# ==============================================================================
# DATABASE ORM MODELS FOR LESSONS & EXERCISES (models/lesson.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# - Lesson: Ek Topic ke andar chhota chapter/lesson (e.g. Greetings Lesson 1).
# - Exercise: Iss lesson ke andar ka Har Single Question (e.g. Multiple Choice,
#   Translate Word Bank, Fill in the Blank, Type Answer, Match Pairs).
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. Column, Integer, String, ForeignKey, JSON (SQLAlchemy Inbuilt Types):
#    Notice `JSON`: SQLite database me pura Python Dictionary/List object as JSON 
#    string save karne ke liye SQLAlchemy built-in column type.
# 2. relationship (SQLAlchemy Inbuilt): ORM Relationship mapping.
# 3. Base (Custom Core Import): Inherited SQLAlchemy Base class.
# ------------------------------------------------------------------------------
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from core.database import Base

# ==============================================================================
# LESSON MODEL (`lessons` table in Database)
# ==============================================================================
class Lesson(Base):
    __tablename__ = 'lessons'

    id = Column(Integer, primary_key=True)
    # Physical Foreign Key linking to `skills.id`
    skill_id = Column(Integer, ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    # Sequence order within the skill (1, 2...)
    order = Column(Integer, nullable=False)
    # Lesson Type ('lesson', 'practice', 'legendary')
    type = Column(String(20), default='lesson', nullable=False)
    
    # ORM Relationships:
    skill = relationship('Skill', back_populates='lessons')
    exercises = relationship('Exercise', back_populates='lesson', cascade='all, delete-orphan', passive_deletes=True)
    attempts = relationship('UserLessonAttempt', back_populates='lesson', cascade='all, delete-orphan', passive_deletes=True)

# ==============================================================================
# EXERCISE MODEL (`exercises` table in Database)
# ==============================================================================
# HINDI CONCEPT: Question Data Structure
# Har question ka visual format aur options `data` (JSON column) me store hote hain:
# - multiple_choice: data = {"options": ["Hola", "Adiós", "Gracias"]}
# - translate_word_bank: data = {"word_bank": ["Good", "morning"], "sentence": "Buenos días"}
# - match_pairs: data = {"pairs": [["Hola", "Hello"], ["Adiós", "Goodbye"]]} (correct_answer = None)
# ==============================================================================
class Exercise(Base):
    __tablename__ = 'exercises'

    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    order = Column(Integer, nullable=False)
    # Exercise Type ('multiple_choice', 'translate_word_bank', 'type_answer', 'fill_blank', 'match_pairs')
    type = Column(String(30), nullable=False)
    # Question text shown to user (e.g. 'How do you say "Hello" in Spanish?')
    prompt = Column(String(500), nullable=False)
    # Flexible JSON Data (SQLAlchemy Inbuilt JSON Type) for word banks & options
    data = Column(JSON, nullable=False)
    # Target Answer string (Nullable for `match_pairs` where answer is in `data["pairs"]`)
    correct_answer = Column(String(500), nullable=True)
    
    # Relationship:
    lesson = relationship('Lesson', back_populates='exercises')

