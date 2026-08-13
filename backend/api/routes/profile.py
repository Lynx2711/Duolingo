# Import necessary FastAPI and DB utilities
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Import core DB getter
from core.database import get_db
# Import models required for profile aggregation
from models.user import User
from models.progress import UserSkillProgress, UserLessonAttempt, UserCourseEnrollment, UserAchievement
from models.course import Course
# Import schema for response
from schemas.progress import ProfileResponse

# Create router for profile endpoints
router = APIRouter(prefix="/api/profile", tags=["Profile"])

# Endpoint to fetch a comprehensive user profile with stats
@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)) -> ProfileResponse:
    # 1. Fetch the user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Raise 404 if user doesn't exist
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Count completed skills (where level is >= 1)
    completed_skills = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id,
        UserSkillProgress.level >= 1
    ).count()
    
    # 3. Count successfully completed lesson attempts (where passed is True)
    completed_lessons_count = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.user_id == user_id,
        UserLessonAttempt.passed == True
    ).count()
    
    # 4. Determine current course name
    # Find the most recent enrollment
    enrollment = db.query(UserCourseEnrollment).filter(
        UserCourseEnrollment.user_id == user_id
    ).order_by(UserCourseEnrollment.enrolled_at.desc()).first()
    
    current_course_name = None
    if enrollment:
        # If enrolled, fetch the course name
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            current_course_name = course.name
            
    # 5. Get list of achievements
    achievements_records = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id
    ).all()
    # Extract just the type strings for the response
    achievements = [a.achievement_type for a in achievements_records]
    
    # 6. Construct and return the comprehensive profile response
    return ProfileResponse(
        user=user, # Base user details (name, xp, streak, etc.)
        current_course=current_course_name, # Name of active course (matches schema field)
        total_skills_completed=completed_skills, # Stat: total skills at level >= 1
        total_lessons_completed=completed_lessons_count, # Stat: total lessons passed
        achievements=achievements # Stat: list of unlocked achievement codes
    )
