# ==============================================================================
# LESSON PLAYBACK & ANSWER VERIFICATION ENDPOINTS (api/routes/lessons.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Ye backend ka "Brain & Engine" hai jahan Duolingo questions check hote hain!
# 3-Step Secure Lifecycle:
# Step 1: GET /api/lessons/{id} -> Frontend ko exercises milti hain (correct_answer REMOVED)
# Step 2: POST /api/lessons/{id}/start/{user_id} -> Naya Attempt ID banta hai
# Step 3: POST /api/lessons/{id}/check-answer -> Answer checking + Unicode Accent Normalization
# Step 4: POST /api/lessons/{id}/complete/{user_id} -> Lesson finish + XP & Streak update
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. APIRouter, Depends, HTTPException (FastAPI Built-in Tools): Framework route helpers.
# 2. Session, selectinload (SQLAlchemy Built-in ORM Tools): DB session & eager loader.
# 3. unicodedata, re (Python Standard Library Built-in Modules):
#    - `unicodedata`: Unicode characters (e.g., 'á', 'ñ', '¿') ko normalize karne ke liye.
#    - `re`: Regular expressions (Punctuation and whitespace removal ke liye).
# 4. datetime, timezone (Python Standard Library Built-in Modules): Timestamping ke liye.
# ------------------------------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import List, Any
from datetime import datetime, timezone

# Custom Project Imports:
from core.database import get_db
from models.lesson import Lesson, Exercise
from models.progress import UserLessonAttempt, UserSkillProgress
from models.user import User
from models.course import Skill
from schemas.lesson import (
    LessonWithExercises,
    AnswerCheck,
    AnswerResult,
    LessonComplete,
    LessonCompleteRequest,
)

# Router initialization
router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

# ==============================================================================
# GET /api/lessons/{lesson_id} - Fetch Exercises (Security: Strips Answers!)
# ==============================================================================
# HINDI CONCEPT: Cheating Prevention
# Browser DevTools se user answer na dekh sake, isliye server `correct_answer` field
# ko NULL karke hi frontend ko bhejta hai.
# ==============================================================================
@router.get("/{lesson_id}", response_model=LessonWithExercises)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> Any:
    # Query lesson with eager-loaded exercises
    lesson = db.query(Lesson).options(selectinload(Lesson.exercises)).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Construct clean dictionary with `correct_answer: None`
    lesson_dict = {
        "id": lesson.id,
        "skill_id": lesson.skill_id,
        "order": lesson.order,
        "type": lesson.type,
        "exercises": [
            {
                "id": ex.id,
                "lesson_id": ex.lesson_id,
                "order": ex.order,
                "type": ex.type,
                "prompt": ex.prompt,
                "data": ex.data,
                "correct_answer": None,  # Answer stripped for security!
            }
            for ex in sorted(lesson.exercises, key=lambda e: e.order)
        ],
    }
    return lesson_dict

# ==============================================================================
# POST /api/lessons/{lesson_id}/start/{user_id} - Start Lesson Session
# ==============================================================================
# HINDI CONCEPT: Session Creation
# Naya attempt row generate karke `attempt_id` integer return karta hai.
# Server is attempt row me client dwara score kiye gaye XP aur haraye gaye hearts ko track karega.
# ==============================================================================
@router.post("/{lesson_id}/start/{user_id}", response_model=int)
def start_lesson(lesson_id: int, user_id: int, db: Session = Depends(get_db)) -> int:
    if not db.query(Lesson).filter(Lesson.id == lesson_id).first():
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    # Create new attempt ledger entry
    attempt = UserLessonAttempt(
        user_id=user_id,
        lesson_id=lesson_id,
        started_at=datetime.now(timezone.utc),
        xp_earned=0,
        hearts_lost=0,
        passed=False,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt.id

# ==============================================================================
# POST /api/lessons/{lesson_id}/check-answer - Server-side Answer Evaluation
# ==============================================================================
# HINDI CONCEPT: Accent Mark Tolerance & Normalization Algorithm
# Spanish learning app me users keyboards se accent marks ('á', 'é', 'í', 'ó', 'ú', 'ñ')
# type karna bhool jate hain.
# Normalization logic:
# 1. Accent characters (NFD decomposition) ko normal ASCII characters me change karta hai.
# 2. Extra spaces aur punctuation (!, ?, .) remove karta hai.
# 3. Case-insensitive lowercasing करता hai.
# Isse "Adiós" aur "adios" bilkul SAME treat hote hain!
# ==============================================================================
@router.post("/{lesson_id}/check-answer", response_model=AnswerResult)
def check_answer(lesson_id: int, check: AnswerCheck, db: Session = Depends(get_db)) -> AnswerResult:
    # 1. Security Check: Validate attempt exists & is open
    attempt = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.id == check.attempt_id,
        UserLessonAttempt.lesson_id == lesson_id,
        UserLessonAttempt.completed_at == None,
    ).first()
    if not attempt:
        raise HTTPException(
            status_code=403,
            detail="Invalid or already-completed attempt. Call /start to begin a new session.",
        )

    # 2. Fetch target exercise
    exercise = db.query(Exercise).filter(
        Exercise.id == check.exercise_id,
        Exercise.lesson_id == lesson_id,
    ).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found in this lesson")

    is_correct = False
    revealed_correct_answer: Any = exercise.correct_answer

    # Accent Normalization Function (Custom Python Logic):
    def normalize_str(s: Any) -> str:
        import unicodedata, re
        if s is None:
            return ""
        if isinstance(s, list):
            s = " ".join([str(item).strip() for item in s])
        s_str = str(s).strip()
        # Inbuilt Python `unicodedata`: Strips accents (á -> a, é -> e)
        s_norm = unicodedata.normalize('NFD', s_str)
        s_clean = ''.join(c for c in s_norm if unicodedata.category(c) != 'Mn')
        s_clean = re.sub(r'[\xa0\u2000-\u200b]', ' ', s_clean)
        s_no_punct = re.sub(r'[^\w\s]', '', s_clean)
        return re.sub(r'\s+', ' ', s_no_punct).strip().lower()

    # 3. Check answer by exercise type
    if exercise.type == "match_pairs":
        submitted_pairs = check.user_pairs if check.user_pairs is not None else check.user_answer
        correct_pairs = exercise.data.get("pairs", []) if exercise.data else []
        revealed_correct_answer = correct_pairs

        if isinstance(submitted_pairs, list) and isinstance(correct_pairs, list):
            try:
                norm_user = sorted([
                    sorted([normalize_str(item) for item in pair])
                    for pair in submitted_pairs
                    if isinstance(pair, (list, tuple)) and len(pair) == 2
                ])
                norm_correct = sorted([
                    sorted([normalize_str(item) for item in pair])
                    for pair in correct_pairs
                    if isinstance(pair, (list, tuple)) and len(pair) == 2
                ])
                is_correct = (len(norm_user) == len(norm_correct)) and (norm_user == norm_correct)
            except Exception:
                is_correct = False
    else:
        user_ans = normalize_str(check.user_answer)
        correct_ans = normalize_str(exercise.correct_answer)
        is_correct = (user_ans == correct_ans)

    # 4. Update Server-side Attempt ledger (+10 XP or +1 Heart Lost)
    XP_PER_CORRECT = 10
    if is_correct:
        attempt.xp_earned += XP_PER_CORRECT
    else:
        attempt.hearts_lost += 1

    db.commit()

    # 5. Return evaluation result to client
    return AnswerResult(
        correct=is_correct,
        correct_answer=revealed_correct_answer,
        xp_earned=XP_PER_CORRECT if is_correct else 0,
    )

# ==============================================================================
# POST /api/lessons/{lesson_id}/complete/{user_id} - Complete & Finalize Lesson
# ==============================================================================
# HINDI CONCEPT: Complete Lesson Transaction
# 1. DB se Attempt row check karta hai (Zero trusting of client scores).
# 2. If hearts_lost >= 5, then passed = False (Lesson Over).
# 3. If passed = True, user.xp_total me XP add karta hai, streak calculate karta hai.
# ==============================================================================
@router.post("/{lesson_id}/complete/{user_id}", response_model=LessonComplete)
def complete_lesson(
    lesson_id: int,
    user_id: int,
    body: LessonCompleteRequest,
    db: Session = Depends(get_db),
) -> LessonComplete:
    attempt = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.id == body.attempt_id,
        UserLessonAttempt.user_id == user_id,
        UserLessonAttempt.lesson_id == lesson_id,
        UserLessonAttempt.completed_at == None,
    ).first()

    if not attempt:
        raise HTTPException(
            status_code=403,
            detail="Invalid, already-completed, or unauthorized attempt.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not user or not lesson:
        raise HTTPException(status_code=404, detail="User or lesson not found")

    HEARTS_TO_FAIL = 5
    xp_earned = attempt.xp_earned
    hearts_lost = attempt.hearts_lost
    passed = hearts_lost < HEARTS_TO_FAIL

    attempt.completed_at = datetime.now(timezone.utc)
    attempt.passed = passed

    # Deduct hearts lost from user's balance
    if hearts_lost > 0:
        user.hearts = max(0, user.hearts - hearts_lost)

    if passed:
        user.xp_total += xp_earned

        # Streak calculation (Inbuilt datetime arithmetic)
        today = datetime.now(timezone.utc).date()
        if not user.last_active_date or user.last_active_date < today:
            days_diff = (today - user.last_active_date).days if user.last_active_date else 999
            if days_diff == 1:
                user.streak += 1
            elif days_diff > 1:
                user.streak = 1
            user.last_active_date = today

        # Update Skill progress level
        skill_prog = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == lesson.skill_id,
        ).first()

        if not skill_prog:
            total = db.query(Lesson).filter(Lesson.skill_id == lesson.skill_id).count()
            skill_prog = UserSkillProgress(
                user_id=user_id,
                skill_id=lesson.skill_id,
                level=0,
                completed_lessons=1,
                total_lessons=total,
            )
            db.add(skill_prog)
        else:
            skill_prog.completed_lessons += 1

        skill_prog.completed_lessons = min(skill_prog.completed_lessons, skill_prog.total_lessons)

        if skill_prog.completed_lessons >= skill_prog.total_lessons:
            skill_prog.level = 1
            skill_prog.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user)

    streak_was_updated = passed and (user.last_active_date == datetime.now(timezone.utc).date())

    return LessonComplete(
        xp_earned=xp_earned,
        hearts_lost=hearts_lost,
        passed=passed,
        new_xp_total=user.xp_total,
        new_hearts=user.hearts,
        streak_updated=streak_was_updated,
    )

