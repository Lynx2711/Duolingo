# Import BaseModel and ConfigDict for schemas
from pydantic import BaseModel, ConfigDict
# Import Optional, List, Union, Dict, Any for complex type hints
from typing import Optional, List, Union, Dict, Any

# Define base schema for Exercise
class ExerciseBase(BaseModel):
    # Type of exercise (e.g., 'multiple_choice')
    type: str
    # Question prompt shown to user
    prompt: str
    # JSON data with exercise-specific configuration (options, word banks)
    data: Dict[str, Any]
    # Correct answer, nullable for exercises where data encodes correctness
    correct_answer: Optional[str] = None

# Define response schema for Exercise
class ExerciseResponse(ExerciseBase):
    # Exercise ID
    id: int
    # Associated Lesson ID
    lesson_id: int
    # Display order within lesson
    order: int

    # Enable reading from ORM attributes
    model_config = ConfigDict(from_attributes=True)

# Define base schema for Lesson
class LessonBase(BaseModel):
    # Display order within skill
    order: int
    # Lesson type, defaults to 'lesson'
    type: str = 'lesson'

# Define response schema for Lesson
class LessonResponse(LessonBase):
    # Lesson ID
    id: int
    # Associated Skill ID
    skill_id: int

    # Enable reading from ORM attributes
    model_config = ConfigDict(from_attributes=True)

# Define schema for Lesson containing nested exercises
class LessonWithExercises(LessonResponse):
    # List of associated exercises
    exercises: List[ExerciseResponse]

# Define schema for validating user answers submitted to the API.
# SECURITY NOTE: attempt_id is required so the server can log XP/hearts
# directly against the server-side attempt record, rather than trusting
# the client to report these values at /complete time.
class AnswerCheck(BaseModel):
    # The exercise ID being answered
    exercise_id: int
    # The attempt ID returned by /start — used to log results server-side.
    # Without this, XP and hearts would need to come from the client at /complete,
    # which is a serious integrity vulnerability.
    attempt_id: int
    # User's answer — string for most exercise types (multiple_choice, type_answer,
    # fill_blank, translate_word_bank), or a list of strings for match_pairs.
    user_answer: Optional[Union[str, List[str]]] = None
    # Explicit pairs list for match_pairs exercises (preferred over user_answer for clarity).
    # Each element is [left_word, right_word].
    user_pairs: Optional[List[List[str]]] = None

# Define schema for returning the result of an answer check
class AnswerResult(BaseModel):
    # Whether the answer was correct
    correct: bool
    # The correct answer to show if user was wrong (str, list of pairs, or structured data)
    correct_answer: Optional[Any] = None
    # XP earned from this specific answer (10 if correct, 0 if wrong).
    # This value is informational only — the server has ALREADY incremented
    # attempt.xp_earned in the DB. The client should not use this to compute
    # its own running total and submit at /complete.
    xp_earned: int = 0

# Schema for the /complete request body.
# SECURITY: Only attempt_id is accepted. The client can NOT send xp_earned,
# hearts_lost, or passed — the server derives all of those from the attempt record
# that was built up incrementally during /check-answer calls.
class LessonCompleteRequest(BaseModel):
    # The attempt ID returned by /start. The server looks up this attempt,
    # reads its server-accumulated xp_earned and hearts_lost, and uses those
    # values exclusively — the client cannot influence the outcome.
    attempt_id: int

# Define schema for the payload returned when a lesson is finished
class LessonComplete(BaseModel):
    # Total XP earned during the lesson (computed server-side from attempt record)
    xp_earned: int
    # Number of hearts lost (computed server-side from attempt record)
    hearts_lost: int
    # Whether the lesson was successfully passed (server-computed: hearts_lost < 5)
    passed: bool
    # User's new total XP after lesson
    new_xp_total: int
    # User's new heart count after lesson
    new_hearts: int
    # Whether this lesson updated the user's daily streak
    streak_updated: bool = False
