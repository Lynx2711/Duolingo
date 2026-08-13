# Import APIRouter, Depends, and HTTPException from fastapi to build our endpoints
from fastapi import APIRouter, Depends, HTTPException
# Import Session for typing the database connection
from sqlalchemy.orm import Session
# Import selectinload for eager loading relationships efficiently
from sqlalchemy.orm import selectinload
# Import get_db to inject the database session
from core.database import get_db
# Import Models needed for querying courses and progress
from models.course import Course, Unit, Skill
from models.progress import UserSkillProgress
# Import Schemas to serialize responses correctly
from schemas.course import CourseResponse, CourseWithUnits, UnitWithSkills, SkillWithProgress
# Import List and Dict for type hinting
from typing import List, Dict, Any

# Create the router for course-related endpoints
router = APIRouter(prefix="/api/courses", tags=["Courses"])

# Define GET endpoint to list all available courses
@router.get("/", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)) -> List[CourseResponse]:
    # Query all courses from the database
    courses = db.query(Course).all()
    # Return the list of courses, Pydantic will format them as CourseResponse
    return courses

# Define GET endpoint to retrieve a specific course by its ID
@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)) -> CourseResponse:
    # Query the course filtering by the provided ID
    course = db.query(Course).filter(Course.id == course_id).first()
    # If no course is found with this ID
    if not course:
        # Raise a 404 Not Found exception
        raise HTTPException(status_code=404, detail="Course not found")
    # Return the found course
    return course

# Define GET endpoint to construct the full learning path (skill tree) for a user in a specific course
@router.get("/{course_id}/path/{user_id}", response_model=CourseWithUnits)
def get_course_path(course_id: int, user_id: int, db: Session = Depends(get_db)) -> Any:
    # Query the course and eagerly load its units and skills to prevent N+1 query problems
    course = db.query(Course).options(
        # Eager load units for the course
        selectinload(Course.units).selectinload(Unit.skills)
    ).filter(Course.id == course_id).first()
    
    # If the course doesn't exist, handle the error
    if not course:
        # Raise 404 to notify client of invalid course ID
        raise HTTPException(status_code=404, detail="Course not found")

    # Fetch all skill progress records for this user to calculate unlocks
    user_progress_records = db.query(UserSkillProgress).filter(
        # Filter by the requested user ID
        UserSkillProgress.user_id == user_id
    ).all()
    
    # Create a dictionary mapping skill_id to its progress record for O(1) lookups
    progress_dict: Dict[int, UserSkillProgress] = {
        # Key is skill_id, value is the progress object
        p.skill_id: p for p in user_progress_records
    }

    # Initialize a list to hold the structured units to return
    result_units = []
    # Initialize a flag to track if the previous skill in the tree was completed (level >= 1)
    # The very first skill is always unlocked, so we pretend the 'previous' was completed
    previous_skill_completed = True

    # Iterate over units in the course, sorted by their order attribute
    sorted_units = sorted(course.units, key=lambda u: u.order)
    for unit in sorted_units:
        # Initialize a list to hold the skills for this unit
        result_skills = []
        # Sort the skills within the unit by their order attribute
        sorted_skills = sorted(unit.skills, key=lambda s: s.order)
        
        # Iterate over each skill to compute its state
        for skill in sorted_skills:
            # Look up if the user has any progress for this specific skill
            prog = progress_dict.get(skill.id)
            
            # Default values if no progress exists
            level = 0
            completed_lessons = 0
            total_lessons = 0
            
            # If progress exists, extract the values
            if prog:
                # User's current level in this skill
                level = prog.level
                # Number of lessons completed in the current level
                completed_lessons = prog.completed_lessons
                # Total lessons required to pass this level
                total_lessons = prog.total_lessons
            else:
                # If no progress, we need to find total_lessons from DB (simplification: we count lessons)
                # In a real app we might cache this, but for now we just count them
                from models.lesson import Lesson
                total_lessons = db.query(Lesson).filter(Lesson.skill_id == skill.id).count()
                
            # Determine if this skill is locked. It is unlocked if the previous skill was completed.
            is_locked = not previous_skill_completed

            # Query lessons for this skill to find the next lesson ID to launch
            from models.lesson import Lesson
            skill_lessons = db.query(Lesson).filter(Lesson.skill_id == skill.id).order_by(Lesson.order).all()
            next_lesson_id = None
            if skill_lessons:
                # If there are uncompleted lessons, pick the lesson corresponding to completed_lessons count
                if completed_lessons < len(skill_lessons):
                    next_lesson_id = skill_lessons[completed_lessons].id
                else:
                    # If all lessons completed, pick the first lesson for practice/replay
                    next_lesson_id = skill_lessons[0].id

            # Append the structured skill data to our unit's skill list
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
                # Full ordered list of lesson IDs for this skill — the frontend
                # renders each lesson as a separate path node instead of one node per skill.
                "lesson_ids": [l.id for l in skill_lessons],
            })
            
            # Update previous_skill_completed for the NEXT skill in the iteration
            # A skill is considered completed if its level is >= 1
            previous_skill_completed = (level >= 1)
            
        # Append the unit containing its evaluated skills to our result units
        result_units.append({
            "id": unit.id, # Unit ID
            "course_id": unit.course_id, # Parent Course ID (required by UnitResponse schema)
            "order": unit.order, # Unit order
            "title": unit.title, # Unit title
            "description": unit.description, # Unit description
            "color": unit.color, # Unit color
            "skills": result_skills # Evaluated skills for this unit
        })
        
    # Return the fully structured learning path as a dictionary matching CourseWithUnits schema
    return {
        "id": course.id, # Course ID
        "name": course.name, # Course name
        "language_code": course.language_code, # Language
        "icon_url": course.icon_url, # Course Icon
        "units": result_units # Structured units with calculated progress
    }

# Define GET endpoint for unit guidebook (key phrases & grammar tips)
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

    # Return default guidebook if custom doesn't exist
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

