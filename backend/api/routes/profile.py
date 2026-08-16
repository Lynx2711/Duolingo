# ==============================================================================
# USER PROFILE SUMMARY ENDPOINT (api/routes/profile.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Aggregated User Report Card!
# Profile Screen par multiple SQL queries ka aggregated summary payload banata hai:
# - Completed skills count (`level >= 1`)
# - Passed lesson attempts count (`passed == True`)
# - Currently active course name
# - Achievements badges list
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from models.user import User
from models.progress import UserSkillProgress, UserLessonAttempt, UserCourseEnrollment, UserAchievement
from models.course import Course
from schemas.progress import ProfileResponse

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)) -> ProfileResponse:
    # 1. Fetch User Record
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Count skills where level >= 1
    completed_skills = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id,
        UserSkillProgress.level >= 1
    ).count()
    
    # 3. Count passed lesson attempts
    completed_lessons_count = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.user_id == user_id,
        UserLessonAttempt.passed == True
    ).count()
    
    # 4. Find active course name
    enrollment = db.query(UserCourseEnrollment).filter(
        UserCourseEnrollment.user_id == user_id
    ).order_by(UserCourseEnrollment.enrolled_at.desc()).first()
    
    current_course_name = None
    if enrollment:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            current_course_name = course.name
            
    # 5. Fetch achievements badge strings
    achievements_records = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id
    ).all()
    achievements = [a.achievement_type for a in achievements_records]
    
    # 6. Return nested profile payload
    return ProfileResponse(
        user=user,
        current_course=current_course_name,
        total_skills_completed=completed_skills,
        total_lessons_completed=completed_lessons_count,
        achievements=achievements
    )

