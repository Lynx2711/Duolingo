# ==============================================================================
# SKILL PROGRESS & ATTEMPTS HISTORY ENDPOINTS (api/routes/progress.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# User Progress & History endpoints:
# 1. GET /api/progress/users/{user_id} -> User ke sabhi skills ka progress list
# 2. GET /api/progress/users/{user_id}/skills/{skill_id} -> Single skill progress record
# 3. GET /api/progress/users/{user_id}/attempts -> Attempt History (most recent first)
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from schemas.progress import UserSkillProgressResponse, UserLessonAttemptResponse
from models.progress import UserSkillProgress, UserLessonAttempt

router = APIRouter(prefix="/api/progress", tags=["Progress"])

@router.get("/users/{user_id}", response_model=List[UserSkillProgressResponse])
def get_all_skill_progress(user_id: int, db: Session = Depends(get_db)) -> List[UserSkillProgressResponse]:
    progress = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user_id).all()
    return progress

@router.get("/users/{user_id}/skills/{skill_id}", response_model=UserSkillProgressResponse)
def get_skill_progress(user_id: int, skill_id: int, db: Session = Depends(get_db)) -> UserSkillProgressResponse:
    progress = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id, 
        UserSkillProgress.skill_id == skill_id
    ).first()
    if not progress:
        raise HTTPException(status_code=404, detail="Skill progress not found")
    return progress

@router.get("/users/{user_id}/attempts", response_model=List[UserLessonAttemptResponse])
def get_lesson_attempts(user_id: int, db: Session = Depends(get_db)) -> List[UserLessonAttemptResponse]:
    # Most recent first using `order_by(UserLessonAttempt.started_at.desc())`
    attempts = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.user_id == user_id
    ).order_by(UserLessonAttempt.started_at.desc()).all()
    return attempts

