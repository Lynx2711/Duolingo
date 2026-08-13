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

# Define schema for validating user answers submitted to the API
class AnswerCheck(BaseModel):
    # The exercise ID being answered
    exercise_id: int
    # User's answer, can be string or list of strings depending on exercise type
    user_answer: Union[str, List[str]]

# Define schema for returning the result of an answer check
class AnswerResult(BaseModel):
    # Whether the answer was correct
    correct: bool
    # The correct answer to show if user was wrong
    correct_answer: Optional[str] = None
    # XP earned from this specific answer
    xp_earned: int = 0

# Define schema for the payload returned when a lesson is finished
class LessonComplete(BaseModel):
    # Total XP earned during the lesson
    xp_earned: int
    # Number of hearts lost
    hearts_lost: int
    # Whether the lesson was successfully passed
    passed: bool
    # User's new total XP after lesson
    new_xp_total: int
    # User's new heart count after lesson
    new_hearts: int
    # Whether this lesson updated the user's daily streak
    streak_updated: bool = False
