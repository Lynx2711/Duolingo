# Import the User model so it is registered with SQLAlchemy's metadata
from models.user import User
# Import Course, Unit, and Skill models so they are registered with SQLAlchemy's metadata
from models.course import Course, Unit, Skill
# Import Lesson and Exercise models so they are registered with SQLAlchemy's metadata
from models.lesson import Lesson, Exercise
# Import progress-related models so they are registered with SQLAlchemy's metadata
from models.progress import UserCourseEnrollment, UserSkillProgress, UserLessonAttempt, UserAchievement
