# ==============================================================================
# DATABASE ORM MODELS FOR COURSES, UNITS & SKILLS (models/course.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# SQLAlchemy Models Python Classes hain jo SQLite Database Tables ka "Blueprint / Khaka" hain.
# Multi-level Structure:
# Course (e.g. Spanish) -> Units (e.g. Basics, Travel) -> Skills (e.g. Greetings, Food)
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. Column, Integer, String, ForeignKey (SQLAlchemy Inbuilt Data Types):
#    SQL Database ke Datatypes ko specify karte hain.
# 2. relationship (SQLAlchemy Inbuilt ORM Link):
#    Database ke Tables ke beech parent-child rishta (One-to-Many / Many-to-One) banata hai.
# 3. Base (Custom Core Import):
#    `core.database` me bani Base class jisse har ORM model inherit karta hai.
# ------------------------------------------------------------------------------
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

# ==============================================================================
# COURSE MODEL (`courses` table in Database)
# ==============================================================================
class Course(Base):
    __tablename__ = 'courses'

    # Primary Key Column (Inbuilt SQLAlchemy Column):
    id = Column(Integer, primary_key=True)
    # Course Name (e.g., 'Spanish')
    name = Column(String(100), nullable=False)
    # Language Code (e.g., 'es')
    language_code = Column(String(10), nullable=False)
    # Icon Image URL
    icon_url = Column(String(500), nullable=True)
    
    # --------------------------------------------------------------------------
    # ORM RELATIONSHIPS (Python-level links, NOT physical DB columns):
    # --------------------------------------------------------------------------
    # - `units`: Iss Course ke saare Units ki list (e.g. course.units).
    # - `cascade='all, delete-orphan'`: Agar course delete hoga toh saare units bhi automatically delete ho jayenge.
    units = relationship('Unit', back_populates='course', cascade='all, delete-orphan', passive_deletes=True)
    enrollments = relationship('UserCourseEnrollment', back_populates='course', cascade='all, delete-orphan', passive_deletes=True)

# ==============================================================================
# UNIT MODEL (`units` table in Database)
# ==============================================================================
class Unit(Base):
    __tablename__ = 'units'

    id = Column(Integer, primary_key=True)
    # Foreign Key (Physical DB Column linking to courses.id):
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    # Unit Sequence Order (1, 2, 3...)
    order = Column(Integer, nullable=False)
    # Unit Title (e.g., 'Basics')
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    # UI Color Theme Hex Code
    color = Column(String(7), nullable=False, default='#58CC02')
    
    # Relationships:
    course = relationship('Course', back_populates='units')
    skills = relationship('Skill', back_populates='unit', cascade='all, delete-orphan', passive_deletes=True)

# ==============================================================================
# SKILL MODEL (`skills` table in Database)
# ==============================================================================
class Skill(Base):
    __tablename__ = 'skills'

    id = Column(Integer, primary_key=True)
    unit_id = Column(Integer, ForeignKey('units.id', ondelete='CASCADE'), nullable=False)
    order = Column(Integer, nullable=False)
    # Skill Name (e.g., 'Greetings')
    name = Column(String(100), nullable=False)
    icon_url = Column(String(500), nullable=True)
    color = Column(String(7), nullable=False)
    
    # Relationships:
    unit = relationship('Unit', back_populates='skills')
    lessons = relationship('Lesson', back_populates='skill', cascade='all, delete-orphan', passive_deletes=True)
    user_progress = relationship('UserSkillProgress', back_populates='skill', cascade='all, delete-orphan', passive_deletes=True)

