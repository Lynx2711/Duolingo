# Import BaseModel and ConfigDict for defining schemas
from pydantic import BaseModel, ConfigDict
# Import Optional and List for type hints
from typing import Optional, List

# Define base schema for Course containing common fields
class CourseBase(BaseModel):
    # Course name (e.g., 'Spanish'), required
    name: str
    # Language code (e.g., 'es'), required
    language_code: str

# Define response schema for Course, adds DB fields
class CourseResponse(CourseBase):
    # Course ID
    id: int
    # Optional course icon URL
    icon_url: Optional[str] = None

    # Enable reading from ORM attributes
    model_config = ConfigDict(from_attributes=True)

# Define base schema for Unit
class UnitBase(BaseModel):
    # Unit title (e.g., 'Basics'), required
    title: str
    # Display order, required
    order: int
    # UI color hex code, required
    color: str

# Define response schema for Unit
class UnitResponse(UnitBase):
    # Unit ID
    id: int
    # Associated Course ID
    course_id: int
    # Optional description
    description: Optional[str] = None

    # Enable reading from ORM attributes
    model_config = ConfigDict(from_attributes=True)

# Define base schema for Skill
class SkillBase(BaseModel):
    # Skill name (e.g., 'Greetings'), required
    name: str
    # Display order, required
    order: int
    # UI color hex code, required
    color: str

# Define response schema for Skill
class SkillResponse(SkillBase):
    # Skill ID
    id: int
    # Associated Unit ID
    unit_id: int
    # Optional icon URL
    icon_url: Optional[str] = None

    # Enable reading from ORM attributes
    model_config = ConfigDict(from_attributes=True)

# Define schema for Skill that includes user progress data
class SkillWithProgress(SkillResponse):
    # Current crown level, defaults to 0
    level: int = 0
    # Lessons completed at current level, defaults to 0
    completed_lessons: int = 0
    # Total lessons in current level, defaults to 2
    total_lessons: int = 2
    # Boolean indicating if skill is locked based on prerequisites, defaults to True
    is_locked: bool = True
    # The ID of the next uncompleted lesson in this skill (or first lesson if completed) for starting lessons
    next_lesson_id: Optional[int] = None

# Define schema for Unit containing nested skills with progress
class UnitWithSkills(UnitResponse):
    # List of associated skills with progress data
    skills: List[SkillWithProgress]

# Define schema for Course containing nested units
class CourseWithUnits(CourseResponse):
    # List of associated units
    units: List[UnitWithSkills]
