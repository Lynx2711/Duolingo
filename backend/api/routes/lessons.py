# Import standard API tools from FastAPI
from fastapi import APIRouter, Depends, HTTPException
# Import session for DB access
from sqlalchemy.orm import Session, selectinload
# Import typing for type hints
from typing import List, Any
# Import datetime for timestamping attempts and progress
from datetime import datetime, timezone

# Import DB dependency
from core.database import get_db
# Import relevant models for lessons, exercises, attempts, users, and progress
from models.lesson import Lesson, Exercise
from models.progress import UserLessonAttempt, UserSkillProgress
from models.user import User
from models.course import Skill
# Import schemas for request parsing and response formatting
from schemas.lesson import LessonWithExercises, AnswerCheck, AnswerResult, LessonComplete

# Create the router for lesson endpoints
router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

# Endpoint to fetch a lesson with its exercises
@router.get("/{lesson_id}", response_model=LessonWithExercises)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> Any:
    # Query lesson and eager-load exercises to avoid N+1 queries
    lesson = db.query(Lesson).options(selectinload(Lesson.exercises)).filter(Lesson.id == lesson_id).first()
    # Check if lesson exists
    if not lesson:
        # 404 if missing
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    # Security measure: Strip the correct answers so the client can't cheat!
    # We create a dictionary representation of the lesson to manipulate it
    lesson_dict = {
        "id": lesson.id, # ID
        "skill_id": lesson.skill_id, # Parent skill
        "order": lesson.order, # Ordering
        "type": lesson.type, # Lesson type
        "exercises": [] # Empty list to hold cleaned exercises
    }
    
    # Iterate through all exercises associated with the lesson
    for ex in lesson.exercises:
        # Create a cleaned version of the exercise dictionary
        ex_dict = {
            "id": ex.id, # Exercise ID
            "lesson_id": ex.lesson_id, # Parent lesson
            "order": ex.order, # Ordering
            "type": ex.type, # Exercise type
            "prompt": ex.prompt, # User prompt
            "data": ex.data, # Question data
            "correct_answer": None # STRIP THE ANSWER to prevent cheating
        }
        # Add to our list
        lesson_dict["exercises"].append(ex_dict)
        
    # Return the sanitized dictionary, which Pydantic will validate
    return lesson_dict

# Endpoint to start a lesson attempt
@router.post("/{lesson_id}/start/{user_id}", response_model=int)
def start_lesson(lesson_id: int, user_id: int, db: Session = Depends(get_db)) -> int:
    # Validate that the lesson exists
    if not db.query(Lesson).filter(Lesson.id == lesson_id).first():
        # Raise 404 if not found
        raise HTTPException(status_code=404, detail="Lesson not found")
    # Validate that the user exists
    if not db.query(User).filter(User.id == user_id).first():
        # Raise 404 if not found
        raise HTTPException(status_code=404, detail="User not found")
        
    # Create a new lesson attempt record to track this session
    attempt = UserLessonAttempt(
        user_id=user_id, # User making the attempt
        lesson_id=lesson_id, # Lesson being attempted
        started_at=datetime.now(timezone.utc), # Record the exact start time
        xp_earned=0, # Initial XP is 0
        hearts_lost=0, # No hearts lost yet
        passed=False # Not passed yet
    )
    # Add attempt to session
    db.add(attempt)
    # Commit to DB
    db.commit()
    # Refresh to get the generated ID
    db.refresh(attempt)
    
    # Return the ID of the new attempt
    return attempt.id

# Endpoint to check an answer during a lesson
@router.post("/{lesson_id}/check-answer", response_model=AnswerResult)
def check_answer(lesson_id: int, check: AnswerCheck, db: Session = Depends(get_db)) -> AnswerResult:
    # Query the specific exercise to check against
    exercise = db.query(Exercise).filter(Exercise.id == check.exercise_id, Exercise.lesson_id == lesson_id).first()
    # If exercise doesn't exist, raise 404
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    # Initialize the correctness flag
    is_correct = False
    
    # Handle 'match_pairs' type differently because it uses JSON arrays
    if exercise.type == "match_pairs":
        # The user answer should be a list of lists/tuples, e.g. [["word1", "trans1"], ...]
        user_pairs = check.user_answer
        # The correct pairs are stored in the data JSON field
        correct_pairs = exercise.data.get("pairs", [])
        
        # Check if lists are valid before comparing
        if isinstance(user_pairs, list) and isinstance(correct_pairs, list):
            # Sort both lists of pairs to ensure order doesn't matter for correctness
            try:
                sorted_user = sorted([sorted(pair) for pair in user_pairs])
                sorted_correct = sorted([sorted(pair) for pair in correct_pairs])
                # Compare the sorted lists
                is_correct = (sorted_user == sorted_correct)
            except Exception:
                # If sorting fails (e.g. malformed data), default to false
                is_correct = False
    else:
        # For text-based answers, compare strings case-insensitively and stripped of whitespace
        user_ans_str = str(check.user_answer).strip().lower()
        # The true answer from the DB
        correct_ans_str = str(exercise.correct_answer).strip().lower() if exercise.correct_answer else ""
        # Check if they match exactly
        is_correct = (user_ans_str == correct_ans_str)
        
    # Award XP if correct, else 0
    xp = 10 if is_correct else 0
    
    # Return the result with the correct answer revealed to the client for feedback
    return AnswerResult(
        correct=is_correct, # Boolean correctness
        correct_answer=exercise.correct_answer, # Send back the true answer to show the user
        xp_earned=xp # XP awarded for this question
    )

# Endpoint to finalize a lesson
@router.post("/{lesson_id}/complete/{user_id}", response_model=LessonComplete)
def complete_lesson(lesson_id: int, user_id: int, request: dict, db: Session = Depends(get_db)) -> LessonComplete:
    # Extract completion data from request dictionary
    xp_earned = request.get("xp_earned", 0)
    hearts_lost = request.get("hearts_lost", 0)
    passed = request.get("passed", False)
    
    # Find the user
    user = db.query(User).filter(User.id == user_id).first()
    # Find the lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    
    # Validate user and lesson
    if not user or not lesson:
        raise HTTPException(status_code=404, detail="User or lesson not found")
        
    # Find the most recent active attempt to complete
    attempt = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.user_id == user_id,
        UserLessonAttempt.lesson_id == lesson_id,
        UserLessonAttempt.completed_at == None # Only find incomplete attempts
    ).order_by(UserLessonAttempt.started_at.desc()).first()
    
    # If an attempt exists, update it
    if attempt:
        # Mark completion time
        attempt.completed_at = datetime.now(timezone.utc)
        # Record XP
        attempt.xp_earned = xp_earned
        # Record hearts lost
        attempt.hearts_lost = hearts_lost
        # Record success status
        attempt.passed = passed
        
    # If the user passed the lesson, update their overall stats
    if passed:
        # Add XP to user's total
        user.xp_total += xp_earned
        # Deduct hearts, ensuring it doesn't drop below 0
        user.hearts = max(0, user.hearts - hearts_lost)
        
        # Check streak logic
        today = datetime.now(timezone.utc).date()
        # If user hasn't been active today
        if not user.last_active_date or user.last_active_date < today:
            # Calculate days since last active
            days_diff = (today - user.last_active_date).days if user.last_active_date else 999
            if days_diff == 1:
                # If active yesterday, increment streak
                user.streak += 1
            elif days_diff > 1:
                # If missed a day, reset streak to 1
                user.streak = 1
            # Update last active date to today
            user.last_active_date = today

        # Update Skill Progress
        # Get the current skill progress
        skill_prog = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == lesson.skill_id
        ).first()
        
        # If no progress exists, create it
        if not skill_prog:
            # Get total lessons in this skill to initialize correctly
            total = db.query(Lesson).filter(Lesson.skill_id == lesson.skill_id).count()
            skill_prog = UserSkillProgress(
                user_id=user_id, # User ID
                skill_id=lesson.skill_id, # Skill ID
                level=0, # Start at level 0
                completed_lessons=1, # Completed 1 lesson just now
                total_lessons=total # Total lessons required
            )
            db.add(skill_prog)
        else:
            # If progress exists, increment completed lessons
            skill_prog.completed_lessons += 1
            
        # Check if the user has finished all lessons in the current level for this skill
        if skill_prog.completed_lessons >= skill_prog.total_lessons:
            # Level up! (Simplified to max level 1 for this clone)
            skill_prog.level = 1
            # Mark completion time
            skill_prog.completed_at = datetime.now(timezone.utc)
            
    # Commit all changes (attempt, user stats, skill progress) in one transaction
    db.commit()
    # Refresh user to get updated values
    db.refresh(user)
    
    # Determine if the streak was just updated during this completion
    streak_was_updated = passed and (user.last_active_date == datetime.now(timezone.utc).date())

    # Return the new state to the client using the correct schema fields
    return LessonComplete(
        xp_earned=xp_earned, # XP earned during this specific lesson
        hearts_lost=hearts_lost, # Hearts lost during this lesson
        passed=passed, # Whether the user passed
        new_xp_total=user.xp_total, # User's updated total XP
        new_hearts=user.hearts, # User's updated heart count
        streak_updated=streak_was_updated # Whether the daily streak was incremented
    )
