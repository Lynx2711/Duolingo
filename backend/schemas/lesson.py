# ==============================================================================
# PYDANTIC SCHEMAS FOR LESSONS & EXERCISES (schemas/lesson.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Is file me Lesson Playback aur Security Verification ke Payloads hain:
# 1. ExerciseResponse: Front-end ko Exercise (Question) bhejte waqt data format.
# 2. AnswerCheck: Jab User answer `CHECK` button click karta hai, tab frontend
#    se server par aane wala JSON format.
# 3. AnswerResult: Server se user ko `Correct / Incorrect` result dene ka format.
# 4. LessonComplete: Lesson khatam hone par final XP & Heart summary.
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. BaseModel, ConfigDict (Inbuilt Pydantic Classes): Data validation & ORM conversion.
# 2. Optional, List, Union, Dict, Any (Python Inbuilt Typing Tools):
#    Notice `Union[str, List[str]]`: Pydantic ko batata hai ki `user_answer` single string 
#    (e.g. "Good morning") bhi ho sakta hai ya array of strings (e.g. ["Good", "morning"]).
# ------------------------------------------------------------------------------
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Union, Dict, Any

# ==============================================================================
# EXERCISE & LESSON FETCH SCHEMAS
# ==============================================================================
class ExerciseBase(BaseModel):
    type: str                # Question type ('multiple_choice', 'translate_word_bank'...)
    prompt: str              # Question text (e.g. 'Translate: Buenos días')
    data: Dict[str, Any]     # JSON dictionary with options/word_bank
    correct_answer: Optional[str] = None # Answer string (Optional)

class ExerciseResponse(ExerciseBase):
    id: int
    lesson_id: int
    order: int

    model_config = ConfigDict(from_attributes=True)

class LessonBase(BaseModel):
    order: int
    type: str = 'lesson'

class LessonResponse(LessonBase):
    id: int
    skill_id: int

    model_config = ConfigDict(from_attributes=True)

class LessonWithExercises(LessonResponse):
    exercises: List[ExerciseResponse]

# ==============================================================================
# ANSWER CHECKING REQUEST SCHEMAS (Client -> Server Payload)
# ==============================================================================
# HINDI CONCEPT: Security Verification Request Payload
# User answer bhejte waqt client `attempt_id` bhejta hai taaki server track kar sake.
class AnswerCheck(BaseModel):
    exercise_id: int                            # ID of exercise being answered
    attempt_id: int                             # Server-assigned attempt ID from `/start`
    user_answer: Optional[Union[str, List[str]]] = None # Answer submitted by user (str or list of chips)
    user_pairs: Optional[List[List[str]]] = None # Answer submitted for `match_pairs` (list of [left, right] pairs)

# ==============================================================================
# ANSWER RESULT SCHEMAS (Server -> Client Response Payload)
# ==============================================================================
class AnswerResult(BaseModel):
    correct: bool                               # True if user's answer matched target
    correct_answer: Optional[Any] = None        # True answer revealed for feedback UI
    xp_earned: int = 0                          # Informational XP earned for this question (10 if correct)

# ==============================================================================
# LESSON COMPLETION SCHEMAS (Server-driven Complete Payload)
# ==============================================================================
# HINDI CONCEPT: Fraud Prevention
# Client `/complete` endpoint par sirf `attempt_id` bhej sakta hai!
# XP kitna hua aur hearts kitni bachi hain, ye server DB se read karke return karta hai.
class LessonCompleteRequest(BaseModel):
    attempt_id: int                             # Attempt ID to finalize

class LessonComplete(BaseModel):
    xp_earned: int                              # Total XP earned during lesson
    hearts_lost: int                            # Total hearts lost during lesson
    passed: bool                                # True if hearts_lost < 5
    new_xp_total: int                           # User's new overall XP sum
    new_hearts: int                             # User's new remaining hearts balance
    streak_updated: bool = False                # True if daily streak was incremented

