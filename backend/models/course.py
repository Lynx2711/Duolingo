# Import necessary Column types and ForeignKey for relational mapping
from sqlalchemy import Column, Integer, String, ForeignKey
# Import relationship to establish links between models
from sqlalchemy.orm import relationship
# Import Base to inherit standard metadata and table naming config
from core.database import Base

# Define the Course model representing a language course (e.g., Spanish)
class Course(Base):
    # Set the table name
    __tablename__ = 'courses'

    # Primary key for the course
    id = Column(Integer, primary_key=True)
    # Name of the course, required
    name = Column(String(100), nullable=False)
    # Language code (e.g., 'es' for Spanish), required
    language_code = Column(String(10), nullable=False)
    # URL for the course icon/flag, optional
    icon_url = Column(String(500), nullable=True)
    
    # Relationship to Unit model, deletes units if course is deleted
    units = relationship('Unit', back_populates='course', cascade='all, delete-orphan', passive_deletes=True)
    # Relationship to user enrollments, deletes enrollments if course is deleted
    enrollments = relationship('UserCourseEnrollment', back_populates='course', cascade='all, delete-orphan', passive_deletes=True)

# Define the Unit model representing a section within a course
class Unit(Base):
    # Set the table name
    __tablename__ = 'units'

    # Primary key for the unit
    id = Column(Integer, primary_key=True)
    # Foreign key linking to the course, uses CASCADE on delete at DB level
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    # Display order within the course, required
    order = Column(Integer, nullable=False)
    # Title of the unit (e.g., 'Basics'), required
    title = Column(String(100), nullable=False)
    # Description of the unit, optional
    description = Column(String(500), nullable=True)
    # Hex color for UI theming, required with a default green color
    color = Column(String(7), nullable=False, default='#58CC02')
    
    # Relationship back to the parent course
    course = relationship('Course', back_populates='units')
    # Relationship to Skill model, deletes skills if unit is deleted
    skills = relationship('Skill', back_populates='unit', cascade='all, delete-orphan', passive_deletes=True)

# Define the Skill model representing a topic/skill within a unit
class Skill(Base):
    # Set the table name
    __tablename__ = 'skills'

    # Primary key for the skill
    id = Column(Integer, primary_key=True)
    # Foreign key linking to the unit, uses CASCADE on delete
    unit_id = Column(Integer, ForeignKey('units.id', ondelete='CASCADE'), nullable=False)
    # Display order within the unit, required
    order = Column(Integer, nullable=False)
    # Name of the skill (e.g., 'Greetings'), required
    name = Column(String(100), nullable=False)
    # URL for the skill icon, optional
    icon_url = Column(String(500), nullable=True)
    # Hex color for UI theming, required
    color = Column(String(7), nullable=False)
    
    # Relationship back to the parent unit
    unit = relationship('Unit', back_populates='skills')
    # Relationship to Lesson model, deletes lessons if skill is deleted
    lessons = relationship('Lesson', back_populates='skill', cascade='all, delete-orphan', passive_deletes=True)
    # Relationship to user progress, deletes progress if skill is deleted
    user_progress = relationship('UserSkillProgress', back_populates='skill', cascade='all, delete-orphan', passive_deletes=True)
