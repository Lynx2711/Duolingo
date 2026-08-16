# ==============================================================================
# COURSES & LEARNING PATH API ENDPOINTS (api/routes/courses.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Yahan Course navigation, Units, Skills aur Duolingo-style "Learning Path" (Skill Tree)
# calculate hota hai.
# Main Endpoint: `/api/courses/{course_id}/path/{user_id}`
# Ye check karta hai ki user ka kaunsa Skill Node Unlocked (Green) hai aur kaunsa Locked (Grey).
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. APIRouter (FastAPI Inbuilt Router): Route grouping ke liye built-in tool.
# 2. Depends (FastAPI Inbuilt Dependency Injection): `get_db` se automatic DB session lene ke liye.
# 3. HTTPException (FastAPI Inbuilt Exception): Standard HTTP 404 / 403 error responses bhejne ke liye.
# 4. Session, selectinload (SQLAlchemy Inbuilt Tools):
#    - `Session`: DB Session Type Annotation.
#    - `selectinload`: Eager Loading helper jo 1 Query me Course + Units + Skills sabhi 
#      nested DB relations fetch karta hai (Performance Optimization - Solves N+1 Problem).
# ------------------------------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any

# Custom Project Imports:
from core.database import get_db
from models.course import Course, Unit, Skill
from models.progress import UserSkillProgress
from schemas.course import CourseResponse, CourseWithUnits

# Create API Router with prefix `/api/courses`
router = APIRouter(prefix="/api/courses", tags=["Courses"])

# ==============================================================================
# GET /api/courses - List all available courses
# ==============================================================================
@router.get("", response_model=List[CourseResponse])
@router.get("/", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)) -> List[CourseResponse]:
    """
    Data Source: `courses` table in SQLite DB.
    Returns: List of available courses (e.g. Spanish).
    """
    courses = db.query(Course).all()
    return courses

# ==============================================================================
# GET /api/courses/{course_id} - Fetch single course details
# ==============================================================================
@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)) -> CourseResponse:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        # Inbuilt FastAPI Exception: Returns JSON `{"detail": "Course not found"}` with status 404
        raise HTTPException(status_code=404, detail="Course not found")
    return course

# ==============================================================================
# GET /api/courses/{course_id}/path/{user_id} - Duolingo Learning Path Generator
# ==============================================================================
# HINDI CONCEPT: Skill Tree Lock/Unlock Logic
# Rule: Pehla skill (Greetings) humesha UNLOCKED (is_locked = False) rehta hai.
# Agla skill tabhi unlock hota hai jab picchla skill kam se kam Level 1 complete kar le!
# ==============================================================================
@router.get("/{course_id}/path/{user_id}", response_model=CourseWithUnits)
def get_course_path(course_id: int, user_id: int, db: Session = Depends(get_db)) -> Any:
    # 1. Fetch Course with Eager Loading (SQLAlchemy Built-in `selectinload`):
    # Ek hi SQL Query me Course -> Units -> Skills sab fetch ho jate hain.
    course = db.query(Course).options(
        selectinload(Course.units).selectinload(Unit.skills)
    ).filter(Course.id == course_id).first()
 
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # 2. Fetch User's Skill Progress Records:
    # Data Source: `user_skill_progress` table for this user.
    user_progress_records = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id
    ).all()
    
    # Quick O(1) Dictionary Lookup by skill_id
    progress_dict: Dict[int, UserSkillProgress] = {
        p.skill_id: p for p in user_progress_records
    }

    result_units = []
    # Flag: Pehle skill ke liye True rakha hai taaki pehla skill unlocked rhe
    previous_skill_completed = True

    # 3. Process Units & Skills in order:
    sorted_units = sorted(course.units, key=lambda u: u.order)
    for unit in sorted_units:
        result_skills = []
        sorted_skills = sorted(unit.skills, key=lambda s: s.order)
        
        for skill in sorted_skills:
            prog = progress_dict.get(skill.id)
            
            level = 0
            completed_lessons = 0
            total_lessons = 0
            
            if prog:
                level = prog.level
                completed_lessons = prog.completed_lessons
                total_lessons = prog.total_lessons
            else:
                from models.lesson import Lesson
                total_lessons = db.query(Lesson).filter(Lesson.skill_id == skill.id).count()
                
            # Lock status calculation: Lock tabhi khulega agar pichhla skill completed tha
            is_locked = not previous_skill_completed

            # 4. Find Next Uncompleted Lesson ID for starting lessons:
            from models.lesson import Lesson
            skill_lessons = db.query(Lesson).filter(Lesson.skill_id == skill.id).order_by(Lesson.order).all()
            next_lesson_id = None
            if skill_lessons:
                if completed_lessons < len(skill_lessons):
                    next_lesson_id = skill_lessons[completed_lessons].id
                else:
                    next_lesson_id = skill_lessons[0].id

            result_skills.append({
                "id": skill.id,
                "unit_id": skill.unit_id,
                "name": skill.name,
                "icon_url": skill.icon_url,
                "color": skill.color,
                "order": skill.order,
                "level": level,
                "completed_lessons": completed_lessons,
                "total_lessons": total_lessons,
                "is_locked": is_locked,
                "next_lesson_id": next_lesson_id,
                "lesson_ids": [l.id for l in skill_lessons],
            })
            
            # Agle skill ke liye check: Agar iss skill ka level >= 1 ho gaya, toh agla unlock hoga!
            previous_skill_completed = (level >= 1)
            
        result_units.append({
            "id": unit.id,
            "course_id": unit.course_id,
            "order": unit.order,
            "title": unit.title,
            "description": unit.description,
            "color": unit.color,
            "skills": result_skills
        })
        
    return {
        "id": course.id,
        "name": course.name,
        "language_code": course.language_code,
        "icon_url": course.icon_url,
        "units": result_units
    }

# ==============================================================================
# GET /api/courses/units/{unit_id}/guidebook - Fetch Unit Grammar Tips
# ==============================================================================
@router.get("/units/{unit_id}/guidebook")
def get_unit_guidebook(unit_id: int, db: Session = Depends(get_db)) -> Any:
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    guidebooks = {
        1: {
            "unit_id": 1,
            "unit_number": 1,
            "title": "Basics",
            "description": "Explore grammar tips and key phrases for this unit",
            "color": "#58CC02",
            "key_phrases": [
                {"phrase": "¡Hola! ¿Cómo estás?", "translation": "Hello! How are you?"},
                {"phrase": "Buenos días, mucho gusto.", "translation": "Good morning, nice to meet you."},
                {"phrase": "Yo soy estudiante.", "translation": "I am a student."},
                {"phrase": "Muchas gracias, adiós.", "translation": "Thank you very much, goodbye."}
            ],
            "grammar_tips": [
                {
                    "title": "Gender of Nouns",
                    "content": "In Spanish, all nouns are either masculine or feminine. Masculine nouns usually end in -o (el chico, el libro) and use 'el'. Feminine nouns usually end in -a (la chica, la casa) and use 'la'."
                },
                {
                    "title": "Basic Subject Pronouns",
                    "content": "Yo = I, Tú = You (informal), Él = He, Ella = She, Nosotros = We, Ellos = They."
                }
            ]
        },
        2: {
            "unit_id": 2,
            "unit_number": 2,
            "title": "Travel",
            "description": "Navigate your way through Spanish-speaking countries",
            "color": "#CE82FF",
            "key_phrases": [
                {"phrase": "¿Dónde está el baño?", "translation": "Where is the bathroom?"},
                {"phrase": "Gira a la derecha.", "translation": "Turn to the right."},
                {"phrase": "Necesito un taxi, por favor.", "translation": "I need a taxi, please."},
                {"phrase": "El tren llega a las tres.", "translation": "The train arrives at three."}
            ],
            "grammar_tips": [
                {
                    "title": "Using 'Estar' for Location",
                    "content": "Use the verb 'estar' to express where people or things are located: 'La tienda está cerca' (The store is nearby)."
                }
            ]
        },
        3: {
            "unit_id": 3,
            "unit_number": 3,
            "title": "Food",
            "description": "Order food and cook in Spanish",
            "color": "#1CB0F6",
            "key_phrases": [
                {"phrase": "Una mesa para dos, por favor.", "translation": "A table for two, please."},
                {"phrase": "Quiero un vaso de agua.", "translation": "I want a glass of water."},
                {"phrase": "La cuenta, por favor.", "translation": "The bill, please."},
                {"phrase": "Me gusta la comida mexicana.", "translation": "I like Mexican food."}
            ],
            "grammar_tips": [
                {
                    "title": "Polite Ordering",
                    "content": "To order food politely in Spanish, use 'Quisiera' or 'Quiero... por favor'."
                }
            ]
        }
    }

    return guidebooks.get(unit_id, {
        "unit_id": unit.id,
        "unit_number": unit.order,
        "title": unit.title,
        "description": "Explore grammar tips and key phrases for this unit",
        "color": unit.color,
        "key_phrases": [
            {"phrase": f"Frase clave en {unit.title}", "translation": f"Key phrase in {unit.title}"}
        ],
        "grammar_tips": [
            {
                "title": f"Tips for {unit.title}",
                "content": f"Grammar tips and guidance for {unit.title}."
            }
        ]
    })


