# Import necessary FastAPI and SQLAlchemy dependencies
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Import DB session getter
from core.database import get_db
# Import progress-related schemas
from schemas.progress import UserSkillProgressResponse, UserLessonAttemptResponse
# Import progress models
from models.progress import UserSkillProgress, UserLessonAttempt

# Create the router for progress-related endpoints
router = APIRouter(prefix="/api/progress", tags=["Progress"])

# Endpoint to get all skill progress for a specific user
@router.get("/users/{user_id}", response_model=List[UserSkillProgressResponse])
def get_all_skill_progress(user_id: int, db: Session = Depends(get_db)) -> List[UserSkillProgressResponse]:
    # Query all progress records filtering by user_id
    progress = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user_id).all()
    # Return the list of records
    return progress

# Endpoint to get progress for a specific user and specific skill
@router.get("/users/{user_id}/skills/{skill_id}", response_model=UserSkillProgressResponse)
def get_skill_progress(user_id: int, skill_id: int, db: Session = Depends(get_db)) -> UserSkillProgressResponse:
    # Query for the single record matching both user and skill
    progress = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id, 
        UserSkillProgress.skill_id == skill_id
    ).first()
    # If not found, raise 404
    if not progress:
        raise HTTPException(status_code=404, detail="Skill progress not found")
    # Return the found record
    return progress

# Endpoint to get all lesson attempts history for a user
@router.get("/users/{user_id}/attempts", response_model=List[UserLessonAttemptResponse])
def get_lesson_attempts(user_id: int, db: Session = Depends(get_db)) -> List[UserLessonAttemptResponse]:
    # Query all attempts for the user, ordered by most recent first
    attempts = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.user_id == user_id
    ).order_by(UserLessonAttempt.started_at.desc()).all()
    # Return the list of attempt records
    return attempts
