# Import Column types, including JSON for flexible exercise data, and ForeignKey
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
# Import relationship to link models together
from sqlalchemy.orm import relationship
# Import Base from core.database
from core.database import Base

# Define the Lesson model representing a single lesson within a skill
class Lesson(Base):
    # Set the table name
    __tablename__ = 'lessons'

    # Primary key for the lesson
    id = Column(Integer, primary_key=True)
    # Foreign key linking to the skill, with CASCADE delete
    skill_id = Column(Integer, ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    # Display order of the lesson, required
    order = Column(Integer, nullable=False)
    # Type of lesson (e.g., 'lesson', 'practice', 'legendary'), default is 'lesson'
    type = Column(String(20), default='lesson', nullable=False)
    
    # Relationship back to the parent skill
    skill = relationship('Skill', back_populates='lessons')
    # Relationship to Exercise model, deletes exercises if lesson is deleted
    exercises = relationship('Exercise', back_populates='lesson', cascade='all, delete-orphan', passive_deletes=True)
    # Relationship to attempt records, deletes attempts if lesson is deleted
    attempts = relationship('UserLessonAttempt', back_populates='lesson', cascade='all, delete-orphan', passive_deletes=True)

# Define the Exercise model representing a single question/challenge in a lesson
class Exercise(Base):
    # Set the table name
    __tablename__ = 'exercises'

    # Primary key for the exercise
    id = Column(Integer, primary_key=True)
    # Foreign key linking to the lesson, with CASCADE delete
    lesson_id = Column(Integer, ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    # Display order of the exercise within the lesson, required
    order = Column(Integer, nullable=False)
    # Type of exercise (e.g., 'multiple_choice', 'translate_word_bank'), required
    type = Column(String(30), nullable=False)
    # The prompt/question shown to the user, required
    prompt = Column(String(500), nullable=False)
    # JSON field holding specific configuration for the exercise type, required
    data = Column(JSON, nullable=False)
    # The correct answer (nullable for types like match_pairs where it's in data)
    correct_answer = Column(String(500), nullable=True)
    
    # Relationship back to the parent lesson
    lesson = relationship('Lesson', back_populates='exercises')
