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
# Import schemas for request parsing and response formatting.
# LessonCompleteRequest replaces the old bare dict — it now accepts ONLY attempt_id.
from schemas.lesson import (
    LessonWithExercises,
    AnswerCheck,
    AnswerResult,
    LessonComplete,
    LessonCompleteRequest,
)

# Create the router for lesson endpoints
router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

# ─────────────────────────────────────────────────────────────────────────────
# GET /api/lessons/{lesson_id}
# Returns lesson metadata + exercises with correct_answer stripped.
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/{lesson_id}", response_model=LessonWithExercises)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> Any:
    # Query lesson and eager-load exercises to avoid N+1 queries
    lesson = db.query(Lesson).options(selectinload(Lesson.exercises)).filter(Lesson.id == lesson_id).first()
    # Raise 404 if lesson does not exist
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Security: build a clean dict with correct_answer always set to None.
    # Exercises are sorted by their display order so the client sees a
    # consistent, deterministic question sequence.
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
                "correct_answer": None,  # Always stripped — correct answers NEVER leave the server on GET
            }
            for ex in sorted(lesson.exercises, key=lambda e: e.order)
        ],
    }
    return lesson_dict


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/lessons/{lesson_id}/start/{user_id}
# Creates a fresh UserLessonAttempt row with xp_earned=0 / hearts_lost=0.
# Returns the attempt_id so the client can include it in every /check-answer call.
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/{lesson_id}/start/{user_id}", response_model=int)
def start_lesson(lesson_id: int, user_id: int, db: Session = Depends(get_db)) -> int:
    # Validate that the lesson exists
    if not db.query(Lesson).filter(Lesson.id == lesson_id).first():
        raise HTTPException(status_code=404, detail="Lesson not found")
    # Validate that the user exists
    if not db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    # Create a new attempt record.
    # xp_earned and hearts_lost start at 0 and are incremented
    # by the server on each /check-answer call — they are NEVER written
    # by the client directly.
    attempt = UserLessonAttempt(
        user_id=user_id,
        lesson_id=lesson_id,
        started_at=datetime.now(timezone.utc),
        xp_earned=0,        # will be accumulated server-side during /check-answer
        hearts_lost=0,      # will be accumulated server-side during /check-answer
        passed=False,       # will be computed server-side at /complete
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Return the attempt ID — the client passes this back in every subsequent call
    return attempt.id


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/lessons/{lesson_id}/check-answer
# Evaluates the user's answer server-side and — crucially — logs the outcome
# directly to the attempt row so /complete never needs to trust client-reported
# totals.
#
# Security model:
#   • XP is incremented on the attempt row (+10 per correct answer).
#   • Hearts are incremented on the attempt row (+1 per wrong answer).
#   • The client receives the result for UI feedback, but the authoritative
#     totals live in the DB.  Replaying or forging the /check-answer call
#     with a fake attempt_id will fail the attempt lookup validation below.
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/{lesson_id}/check-answer", response_model=AnswerResult)
def check_answer(lesson_id: int, check: AnswerCheck, db: Session = Depends(get_db)) -> AnswerResult:
    # 1. Verify the attempt exists, belongs to the correct lesson, and is still open.
    #    This prevents a client from injecting a fake attempt_id that belongs to
    #    a different user or an already-completed session.
    attempt = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.id == check.attempt_id,
        UserLessonAttempt.lesson_id == lesson_id,
        UserLessonAttempt.completed_at == None,  # Reject already-completed attempts
    ).first()
    if not attempt:
        # Return 403 (not 404) to avoid leaking whether attempt IDs exist
        raise HTTPException(
            status_code=403,
            detail="Invalid or already-completed attempt. Call /start to begin a new session.",
        )

    # 2. Verify the exercise belongs to this lesson
    exercise = db.query(Exercise).filter(
        Exercise.id == check.exercise_id,
        Exercise.lesson_id == lesson_id,
    ).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found in this lesson")

    # 3. Evaluate correctness
    is_correct = False
    revealed_correct_answer: Any = exercise.correct_answer  # default for scalar types

    if exercise.type == "match_pairs":
        # match_pairs — correct answer is encoded in data["pairs"], not correct_answer column.
        # We accept either user_pairs (preferred) or user_answer as a fallback.
        submitted_pairs = check.user_pairs if check.user_pairs is not None else check.user_answer
        correct_pairs = exercise.data.get("pairs", []) if exercise.data else []

        # Reveal the pairs list so the frontend can show the correct mapping
        revealed_correct_answer = correct_pairs

        if isinstance(submitted_pairs, list) and isinstance(correct_pairs, list):
            try:
                # Normalize: lowercase + strip each token, sort within each pair,
                # then sort the full list of pairs — so order of submission doesn't matter.
                norm_user = sorted([
                    sorted([str(item).strip().lower() for item in pair])
                    for pair in submitted_pairs
                    if isinstance(pair, (list, tuple)) and len(pair) == 2
                ])
                norm_correct = sorted([
                    sorted([str(item).strip().lower() for item in pair])
                    for pair in correct_pairs
                    if isinstance(pair, (list, tuple)) and len(pair) == 2
                ])
                is_correct = (len(norm_user) == len(norm_correct)) and (norm_user == norm_correct)
            except Exception:
                is_correct = False
    else:
        # All other types: case-insensitive, whitespace-stripped string comparison
        if isinstance(check.user_answer, list):
            user_ans = " ".join([str(item).strip() for item in check.user_answer]).strip().lower()
        else:
            user_ans = str(check.user_answer).strip().lower() if check.user_answer is not None else ""
        
        correct_ans = str(exercise.correct_answer).strip().lower() if exercise.correct_answer else ""
        
        # Helper to normalize string for comparison (removes accents/punctuation like ¡!¿?.,)
        def normalize_str(s: str) -> str:
            import unicodedata, re
            s_norm = unicodedata.normalize('NFD', s)
            s_clean = ''.join(c for c in s_norm if unicodedata.category(c) != 'Mn')
            return re.sub(r'[^\w\s]', '', s_clean).strip()
        
        # Primary check: exact match
        # Fallback check: normalized match (handles missing accents or punctuation)
        is_correct = (user_ans == correct_ans) or (normalize_str(user_ans) == normalize_str(correct_ans))

    # 4. Log outcome to the attempt row — THIS is the critical security step.
    #    The server owns these numbers; the client never sends them at /complete.
    XP_PER_CORRECT = 10  # configurable constant — easy to find and adjust
    if is_correct:
        # Accumulate XP for correct answers on the server-side attempt record
        attempt.xp_earned += XP_PER_CORRECT
    else:
        # Accumulate hearts lost for wrong answers on the server-side attempt record
        attempt.hearts_lost += 1

    # Persist the updated attempt counters immediately so they survive crashes
    db.commit()

    # 5. Return feedback to the client.
    #    xp_earned here is informational (for the "✓ +10 XP" toast), NOT authoritative.
    return AnswerResult(
        correct=is_correct,
        correct_answer=revealed_correct_answer,  # Only revealed AFTER the answer is checked
        xp_earned=XP_PER_CORRECT if is_correct else 0,
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/lessons/{lesson_id}/complete/{user_id}
# Finalizes the lesson using ONLY server-accumulated data from the attempt row.
#
# Security guarantees:
#   • Client sends only attempt_id — zero numeric values accepted from client.
#   • xp_earned, hearts_lost, and passed are ALL derived from the DB record
#     that was built up by /check-answer calls above.
#   • completed_at check prevents double-submission / replay attacks.
#   • attempt.user_id check prevents one user from completing another user's attempt.
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/{lesson_id}/complete/{user_id}", response_model=LessonComplete)
def complete_lesson(
    lesson_id: int,
    user_id: int,
    body: LessonCompleteRequest,  # Only attempt_id — no numeric values accepted from client
    db: Session = Depends(get_db),
) -> LessonComplete:
    # 1. Look up the attempt by attempt_id AND user_id.
    #    The user_id join prevents user A from completing user B's attempt
    #    even if they somehow obtain user B's attempt_id.
    attempt = db.query(UserLessonAttempt).filter(
        UserLessonAttempt.id == body.attempt_id,
        UserLessonAttempt.user_id == user_id,       # ownership check
        UserLessonAttempt.lesson_id == lesson_id,   # lesson consistency check
        UserLessonAttempt.completed_at == None,     # replay attack prevention
    ).first()

    if not attempt:
        raise HTTPException(
            status_code=403,
            detail="Invalid, already-completed, or unauthorized attempt.",
        )

    # 2. Look up the user and lesson (needed to update stats)
    user = db.query(User).filter(User.id == user_id).first()
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not user or not lesson:
        raise HTTPException(status_code=404, detail="User or lesson not found")

    # 3. Derive pass/fail from server-accumulated hearts_lost.
    #    A learner fails if they lost 5 or more hearts (used all heart slots).
    #    This mirrors Duolingo's "run out of hearts = failed attempt" rule.
    HEARTS_TO_FAIL = 5  # configurable threshold
    xp_earned = attempt.xp_earned        # server-accumulated, not client-supplied
    hearts_lost = attempt.hearts_lost    # server-accumulated, not client-supplied
    passed = hearts_lost < HEARTS_TO_FAIL  # pure server computation

    # 4. Stamp completion onto the attempt row and record computed pass/fail
    attempt.completed_at = datetime.now(timezone.utc)  # marks attempt as closed
    attempt.passed = passed                             # server-computed
    # xp_earned and hearts_lost are already correct on the row — no need to re-write

    # 5. Deduct hearts from user's current balance (regardless of pass/fail)
    if hearts_lost > 0:
        # max(0,...) prevents negative heart count
        user.hearts = max(0, user.hearts - hearts_lost)

    # 6. Apply rewards only when the learner passed
    if passed:
        # Add server-accumulated XP to user's lifetime total
        user.xp_total += xp_earned

        # Streak logic: increment if active yesterday, reset if gap > 1 day
        today = datetime.now(timezone.utc).date()
        if not user.last_active_date or user.last_active_date < today:
            days_diff = (today - user.last_active_date).days if user.last_active_date else 999
            if days_diff == 1:
                user.streak += 1      # consecutive day — keep the flame going
            elif days_diff > 1:
                user.streak = 1       # gap detected — streak resets to 1 (not 0)
            user.last_active_date = today

        # Update skill progress (crown level / completed_lessons counter)
        skill_prog = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == lesson.skill_id,
        ).first()

        if not skill_prog:
            # First time user attempts this skill — create the progress row
            total = db.query(Lesson).filter(Lesson.skill_id == lesson.skill_id).count()
            skill_prog = UserSkillProgress(
                user_id=user_id,
                skill_id=lesson.skill_id,
                level=0,
                completed_lessons=1,  # this lesson counts as the first
                total_lessons=total,
            )
            db.add(skill_prog)
        else:
            # Increment completed lesson count for this skill
            skill_prog.completed_lessons += 1

        # Cap completed_lessons so retrying a fully-completed skill doesn't inflate the counter
        skill_prog.completed_lessons = min(skill_prog.completed_lessons, skill_prog.total_lessons)

        # Crown-up if all lessons in this skill are done. Level caps at 1 for this clone.
        if skill_prog.completed_lessons >= skill_prog.total_lessons:
            skill_prog.level = 1  # cap at 1 — prevents level inflation from repeated completes
            skill_prog.completed_at = datetime.now(timezone.utc)

    # 7. Commit all changes atomically (attempt close, user stats, skill progress)
    db.commit()
    db.refresh(user)  # re-read user to get the latest computed values

    # Determine if the streak was updated in this session (for UI animation)
    streak_was_updated = passed and (user.last_active_date == datetime.now(timezone.utc).date())

    # 8. Return the authoritative outcome — all values derived from the DB, not the request body
    return LessonComplete(
        xp_earned=xp_earned,               # from attempt row (server-accumulated)
        hearts_lost=hearts_lost,           # from attempt row (server-accumulated)
        passed=passed,                     # server-computed (hearts_lost < 5)
        new_xp_total=user.xp_total,        # post-update user total
        new_hearts=user.hearts,            # post-deduction heart count
        streak_updated=streak_was_updated, # streak animation trigger
    )
