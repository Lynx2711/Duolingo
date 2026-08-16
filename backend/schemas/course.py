# ==============================================================================
# PYDANTIC SCHEMAS FOR COURSES, UNITS & LEARNING PATH (schemas/course.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Pydantic Schemas humare API ka "Data Security Guard & Packing Box" hain.
# 1. Incoming Request Data ko validate karte hain (Type check: int, str, bool).
# 2. Outgoing JSON Data ko shape aur structure dete hain jo frontend expect karta hai.
# SQLAlchemy Models = DB Tables
# Pydantic Schemas = API JSON Payloads
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. BaseModel (Inbuilt Pydantic Class): Subhi Pydantic data schemas is class se inherit karte hain.
# 2. ConfigDict (Inbuilt Pydantic Setting): Schema behavior configuration.
#    `from_attributes=True`: Allow करता hai ki SQLAlchemy ORM objects (e.g. db_course) 
#    ko direct Pydantic JSON response me convert kiya ja sake.
# 3. Optional, List (Python typing standard library): Type annotations for nullable fields & arrays.
# ------------------------------------------------------------------------------
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

# ==============================================================================
# COURSE SCHEMAS
# ==============================================================================
class CourseBase(BaseModel):
    name: str           # e.g. "Spanish"
    language_code: str  # e.g. "es"

class CourseResponse(CourseBase):
    id: int
    icon_url: Optional[str] = None

    # Inbuilt Pydantic Config: Allows converting SQLAlchemy ORM model directly to JSON schema
    model_config = ConfigDict(from_attributes=True)

# ==============================================================================
# UNIT SCHEMAS
# ==============================================================================
class UnitBase(BaseModel):
    title: str          # e.g. "Basics"
    order: int          # Display order (1, 2...)
    color: str          # UI Color Hex string "#58CC02"

class UnitResponse(UnitBase):
    id: int
    course_id: int
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ==============================================================================
# SKILL SCHEMAS
# ==============================================================================
class SkillBase(BaseModel):
    name: str           # e.g. "Greetings"
    order: int
    color: str

class SkillResponse(SkillBase):
    id: int
    unit_id: int
    icon_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ==============================================================================
# COMPLEX NESTED SCHEMAS (For Duolingo Learning Path Screen)
# ==============================================================================
# HINDI CONCEPT: Learning Path Node Payload
# Next.js `/path` screen me har skill node ke sath uski locking status (is_locked)
# aur next lesson ID render honi hoti hai.
class SkillWithProgress(SkillResponse):
    level: int = 0
    completed_lessons: int = 0
    total_lessons: int = 2
    is_locked: bool = True
    next_lesson_id: Optional[int] = None
    lesson_ids: List[int] = []

class UnitWithSkills(UnitResponse):
    skills: List[SkillWithProgress]

class CourseWithUnits(CourseResponse):
    units: List[UnitWithSkills]

