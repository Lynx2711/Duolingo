# Import datetime utilities for timestamping seeded records
from datetime import datetime, timezone, timedelta
# Import SQLAlchemy Session for DB operations
from sqlalchemy.orm import Session

# Import core database setup
from core.database import SessionLocal
# Import all required models to create seed data
from models.course import Course, Unit, Skill
from models.lesson import Lesson, Exercise
from models.user import User
from models.progress import UserCourseEnrollment, UserSkillProgress, UserLessonAttempt, UserAchievement

def seed_database(db: Session) -> None:
    """
    Idempotent function to seed the database with initial data.
    Checks if data exists before inserting to prevent duplicates.
    """
    
    # 1. SEED COURSE
    # Check if the Spanish course already exists
    spanish_course = db.query(Course).filter(Course.language_code == "es").first()
    if not spanish_course:
        # If not, create the Spanish course
        spanish_course = Course(
            name="Spanish", # Course name
            language_code="es", # Language identifier
            icon_url=None # No icon yet
        )
        # Add to session
        db.add(spanish_course)
        # Commit and refresh to get the generated ID
        db.commit()
        db.refresh(spanish_course)
        
    # 2. SEED UNITS
    # Check if unit 1 exists for this course
    if db.query(Unit).filter(Unit.course_id == spanish_course.id).count() == 0:
        # Create 3 units as specified
        unit1 = Unit(course_id=spanish_course.id, order=1, title="Basics", color="#58CC02", description="Learn the fundamentals of Spanish")
        unit2 = Unit(course_id=spanish_course.id, order=2, title="Travel", color="#CE82FF", description="Navigate your way through Spanish-speaking countries")
        unit3 = Unit(course_id=spanish_course.id, order=3, title="Food", color="#1CB0F6", description="Order food and cook in Spanish")
        
        # Add units to session
        db.add_all([unit1, unit2, unit3])
        # Commit and refresh
        db.commit()
        db.refresh(unit1)
        db.refresh(unit2)
        db.refresh(unit3)
        
        # 3. SEED SKILLS
        # Unit 1 Skills
        skill_u1_1 = Skill(unit_id=unit1.id, order=1, name="Greetings", color=unit1.color)
        skill_u1_2 = Skill(unit_id=unit1.id, order=2, name="Introductions", color=unit1.color)
        
        # Unit 2 Skills
        skill_u2_1 = Skill(unit_id=unit2.id, order=1, name="Directions", color=unit2.color)
        skill_u2_2 = Skill(unit_id=unit2.id, order=2, name="Transportation", color=unit2.color)
        
        # Unit 3 Skills
        skill_u3_1 = Skill(unit_id=unit3.id, order=1, name="Restaurants", color=unit3.color)
        skill_u3_2 = Skill(unit_id=unit3.id, order=2, name="Cooking", color=unit3.color)
        
        # Group skills to add them easily
        all_skills = [skill_u1_1, skill_u1_2, skill_u2_1, skill_u2_2, skill_u3_1, skill_u3_2]
        db.add_all(all_skills)
        db.commit()
        
        # Refresh skills to get their IDs
        for skill in all_skills:
            db.refresh(skill)
            
        # 4. SEED LESSONS & EXERCISES
        # Define skill-specific exercise content for realistic language learning
        # Each skill has a list of exercise sets (one per lesson) with varied types
        # This makes the app feel like a real Duolingo course rather than placeholder data
        skill_exercises = {
            "Greetings": [
                # Lesson 1 exercises for Greetings
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='How do you say "Hello" in Spanish?',
                             data={"options": ["Hola", "Adiós", "Gracias", "Por favor"]},
                             correct_answer="Hola"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Buenos días",
                             data={"word_bank": ["Good", "morning", "night", "bye", "the"], "sentence": "Buenos días"},
                             correct_answer="Good morning"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: Goodbye",
                             data={"sentence": "Goodbye", "hint": "A____"},
                             correct_answer="Adiós"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete the sentence",
                             data={"sentence": "_____ noches (Good night)", "options": ["Buenos", "Buenas", "Bien"]},
                             correct_answer="Buenas"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match the pairs",
                             data={"pairs": [["Hola", "Hello"], ["Adiós", "Goodbye"], ["Gracias", "Thank you"], ["Por favor", "Please"]]},
                             correct_answer=None),
                ],
                # Lesson 2 exercises for Greetings
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='What does "Buenas tardes" mean?',
                             data={"options": ["Good morning", "Good afternoon", "Good night", "Goodbye"]},
                             correct_answer="Good afternoon"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Mucho gusto",
                             data={"word_bank": ["Nice", "to", "meet", "you", "how", "bye"], "sentence": "Mucho gusto"},
                             correct_answer="Nice to meet you"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: Good morning",
                             data={"sentence": "Good morning", "hint": "B_____ d____"},
                             correct_answer="Buenos días"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: ¿Cómo _____? (How are you?)",
                             data={"sentence": "¿Cómo _____?", "options": ["estás", "eres", "haces"]},
                             correct_answer="estás"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match the greetings",
                             data={"pairs": [["Buenos días", "Good morning"], ["Buenas tardes", "Good afternoon"], ["Buenas noches", "Good night"], ["¿Cómo estás?", "How are you?"]]},
                             correct_answer=None),
                ],
            ],
            "Introductions": [
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='How do you say "My name is..." in Spanish?',
                             data={"options": ["Me llamo...", "Te llamo...", "Se llama...", "Nos llamamos..."]},
                             correct_answer="Me llamo..."),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Yo soy estudiante",
                             data={"word_bank": ["I", "am", "a", "student", "teacher", "you"], "sentence": "Yo soy estudiante"},
                             correct_answer="I am a student"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: I am from Mexico",
                             data={"sentence": "I am from Mexico", "hint": "Yo soy de ______"},
                             correct_answer="Yo soy de México"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: Ella _____ María (She is María)",
                             data={"sentence": "Ella _____ María", "options": ["es", "soy", "eres"]},
                             correct_answer="es"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match the introductions",
                             data={"pairs": [["Me llamo", "My name is"], ["Soy de", "I am from"], ["Tengo", "I have"], ["Hablo", "I speak"]]},
                             correct_answer=None),
                ],
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='What does "¿De dónde eres?" mean?',
                             data={"options": ["Where are you from?", "How old are you?", "What is your name?", "Where do you live?"]},
                             correct_answer="Where are you from?"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Tengo veinte años",
                             data={"word_bank": ["I", "am", "have", "twenty", "years", "old"], "sentence": "Tengo veinte años"},
                             correct_answer="I am twenty years old"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: What is your name?",
                             data={"sentence": "What is your name?", "hint": "¿Cómo te ______?"},
                             correct_answer="¿Cómo te llamas?"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: Nosotros _____ amigos (We are friends)",
                             data={"sentence": "Nosotros _____ amigos", "options": ["somos", "son", "soy"]},
                             correct_answer="somos"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match the pronouns",
                             data={"pairs": [["Yo", "I"], ["Tú", "You"], ["Él", "He"], ["Ella", "She"]]},
                             correct_answer=None),
                ],
            ],
            "Directions": [
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='How do you say "left" in Spanish?',
                             data={"options": ["Izquierda", "Derecha", "Recto", "Atrás"]},
                             correct_answer="Izquierda"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Gira a la derecha",
                             data={"word_bank": ["Turn", "to", "the", "right", "left", "go"], "sentence": "Gira a la derecha"},
                             correct_answer="Turn to the right"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: Go straight",
                             data={"sentence": "Go straight", "hint": "Sigue ______"},
                             correct_answer="Sigue recto"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: La tienda está _____ la esquina (around the corner)",
                             data={"sentence": "La tienda está _____ la esquina", "options": ["en", "a", "de"]},
                             correct_answer="en"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match the directions",
                             data={"pairs": [["Izquierda", "Left"], ["Derecha", "Right"], ["Recto", "Straight"], ["Atrás", "Back"]]},
                             correct_answer=None),
                ],
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='What does "¿Dónde está el banco?" mean?',
                             data={"options": ["Where is the bank?", "Where is the park?", "Where is the store?", "Where is the house?"]},
                             correct_answer="Where is the bank?"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Está al lado del parque",
                             data={"word_bank": ["It", "is", "next", "to", "the", "park", "behind"], "sentence": "Está al lado del parque"},
                             correct_answer="It is next to the park"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: The hospital is far",
                             data={"sentence": "The hospital is far", "hint": "El hospital está ______"},
                             correct_answer="El hospital está lejos"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: El museo está _____ del hotel (in front of)",
                             data={"sentence": "El museo está _____ del hotel", "options": ["enfrente", "detrás", "lejos"]},
                             correct_answer="enfrente"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match locations",
                             data={"pairs": [["Cerca", "Near"], ["Lejos", "Far"], ["Enfrente", "In front"], ["Detrás", "Behind"]]},
                             correct_answer=None),
                ],
            ],
            "Transportation": [
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='How do you say "bus" in Spanish?',
                             data={"options": ["Autobús", "Coche", "Tren", "Avión"]},
                             correct_answer="Autobús"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Necesito un taxi",
                             data={"word_bank": ["I", "need", "want", "a", "taxi", "bus"], "sentence": "Necesito un taxi"},
                             correct_answer="I need a taxi"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: The train arrives at 3",
                             data={"sentence": "The train arrives at 3", "hint": "El tren ______ a las 3"},
                             correct_answer="El tren llega a las 3"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: Voy en _____ al trabajo (I go by car to work)",
                             data={"sentence": "Voy en _____ al trabajo", "options": ["coche", "pie", "bici"]},
                             correct_answer="coche"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match the transportation",
                             data={"pairs": [["Coche", "Car"], ["Tren", "Train"], ["Avión", "Airplane"], ["Barco", "Boat"]]},
                             correct_answer=None),
                ],
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='What does "billete de ida y vuelta" mean?',
                             data={"options": ["Round trip ticket", "One way ticket", "Bus pass", "Train schedule"]},
                             correct_answer="Round trip ticket"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: ¿A qué hora sale el tren?",
                             data={"word_bank": ["What", "time", "does", "the", "train", "leave", "bus", "at"], "sentence": "¿A qué hora sale el tren?"},
                             correct_answer="What time does the train leave"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: Where is the station?",
                             data={"sentence": "Where is the station?", "hint": "¿Dónde está la ________?"},
                             correct_answer="¿Dónde está la estación?"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: El vuelo _____ a las ocho (The flight departs at eight)",
                             data={"sentence": "El vuelo _____ a las ocho", "options": ["sale", "llega", "viene"]},
                             correct_answer="sale"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match travel words",
                             data={"pairs": [["Billete", "Ticket"], ["Estación", "Station"], ["Aeropuerto", "Airport"], ["Parada", "Stop"]]},
                             correct_answer=None),
                ],
            ],
            "Restaurants": [
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='How do you say "the menu" in Spanish?',
                             data={"options": ["El menú", "La mesa", "La cuenta", "El plato"]},
                             correct_answer="El menú"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Quiero un vaso de agua",
                             data={"word_bank": ["I", "want", "a", "glass", "of", "water", "wine", "need"], "sentence": "Quiero un vaso de agua"},
                             correct_answer="I want a glass of water"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: The bill, please",
                             data={"sentence": "The bill, please", "hint": "La ______, por favor"},
                             correct_answer="La cuenta, por favor"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: Una mesa para _____, por favor (A table for two)",
                             data={"sentence": "Una mesa para _____, por favor", "options": ["dos", "tres", "uno"]},
                             correct_answer="dos"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match restaurant words",
                             data={"pairs": [["Menú", "Menu"], ["Cuenta", "Bill"], ["Propina", "Tip"], ["Camarero", "Waiter"]]},
                             correct_answer=None),
                ],
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='What does "Estoy lleno" mean?',
                             data={"options": ["I am full", "I am hungry", "I am thirsty", "I am tired"]},
                             correct_answer="I am full"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Me gustaría el pollo",
                             data={"word_bank": ["I", "would", "like", "the", "chicken", "fish", "a"], "sentence": "Me gustaría el pollo"},
                             correct_answer="I would like the chicken"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: I am hungry",
                             data={"sentence": "I am hungry", "hint": "Tengo ______"},
                             correct_answer="Tengo hambre"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: La comida está muy _____ (The food is very delicious)",
                             data={"sentence": "La comida está muy _____", "options": ["deliciosa", "fría", "cara"]},
                             correct_answer="deliciosa"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match food items",
                             data={"pairs": [["Pollo", "Chicken"], ["Pescado", "Fish"], ["Arroz", "Rice"], ["Ensalada", "Salad"]]},
                             correct_answer=None),
                ],
            ],
            "Cooking": [
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='How do you say "to cook" in Spanish?',
                             data={"options": ["Cocinar", "Comer", "Cortar", "Calentar"]},
                             correct_answer="Cocinar"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Corta las verduras",
                             data={"word_bank": ["Cut", "the", "vegetables", "fruit", "cook", "a"], "sentence": "Corta las verduras"},
                             correct_answer="Cut the vegetables"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: Mix the ingredients",
                             data={"sentence": "Mix the ingredients", "hint": "Mezcla los ______"},
                             correct_answer="Mezcla los ingredientes"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: _____ el agua antes de añadir la pasta (Boil the water)",
                             data={"sentence": "_____ el agua antes de añadir la pasta", "options": ["Hierve", "Corta", "Mezcla"]},
                             correct_answer="Hierve"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match cooking actions",
                             data={"pairs": [["Cocinar", "To cook"], ["Cortar", "To cut"], ["Mezclar", "To mix"], ["Hervir", "To boil"]]},
                             correct_answer=None),
                ],
                [
                    Exercise(lesson_id=0, order=1, type="multiple_choice",
                             prompt='What does "sartén" mean?',
                             data={"options": ["Frying pan", "Oven", "Knife", "Spoon"]},
                             correct_answer="Frying pan"),
                    Exercise(lesson_id=0, order=2, type="translate_word_bank",
                             prompt="Translate: Necesito sal y pimienta",
                             data={"word_bank": ["I", "need", "salt", "and", "pepper", "sugar", "want"], "sentence": "Necesito sal y pimienta"},
                             correct_answer="I need salt and pepper"),
                    Exercise(lesson_id=0, order=3, type="type_answer",
                             prompt="Translate to Spanish: The oven is hot",
                             data={"sentence": "The oven is hot", "hint": "El horno está ______"},
                             correct_answer="El horno está caliente"),
                    Exercise(lesson_id=0, order=4, type="fill_blank",
                             prompt="Complete: Pon la comida en el _____ (Put the food in the oven)",
                             data={"sentence": "Pon la comida en el _____", "options": ["horno", "plato", "vaso"]},
                             correct_answer="horno"),
                    Exercise(lesson_id=0, order=5, type="match_pairs",
                             prompt="Match kitchen items",
                             data={"pairs": [["Cuchillo", "Knife"], ["Cuchara", "Spoon"], ["Tenedor", "Fork"], ["Sartén", "Frying pan"]]},
                             correct_answer=None),
                ],
            ],
        }
        
        # Create lessons and exercises for each skill
        for skill in all_skills:
            # Get the exercise sets for this skill, or use a default fallback
            exercise_sets = skill_exercises.get(skill.name, skill_exercises["Greetings"])
            # Create 2 lessons per skill (matching our total_lessons default)
            for lesson_order in [1, 2]:
                # Create the lesson record
                lesson = Lesson(skill_id=skill.id, order=lesson_order, type="lesson")
                db.add(lesson)
                db.commit()
                db.refresh(lesson)
                
                # Get the exercise set for this lesson (0-indexed, lesson_order is 1-indexed)
                lesson_exercises_data = exercise_sets[lesson_order - 1]
                # Assign the correct lesson_id to each exercise (they were created with placeholder 0)
                for ex in lesson_exercises_data:
                    ex.lesson_id = lesson.id
                # Add all exercises for this lesson
                db.add_all(lesson_exercises_data)
                db.commit()

    # 5. SEED USERS & PROGRESS
    # Check if default user exists
    main_user = db.query(User).filter(User.email == "alex@example.com").first()
    if not main_user:
        # Define 'today' to calculate last_active_date for streaks
        now = datetime.now(timezone.utc)
        yesterday = (now - timedelta(days=1)).date()
        three_days_ago = now - timedelta(days=3)
        
        # Create Main User 'Alex'
        alex = User(
            name="Alex",
            email="alex@example.com",
            xp_total=450,
            streak=3,
            hearts=4,
            max_hearts=5,
            gems=500,
            daily_goal_xp=20,
            last_active_date=yesterday # Active yesterday to maintain streak
        )
        
        # Create Leaderboard Users
        maria = User(name="Maria", email="maria@example.com", xp_total=1200, streak=15)
        carlos = User(name="Carlos", email="carlos@example.com", xp_total=800, streak=7)
        sofia = User(name="Sofia", email="sofia@example.com", xp_total=350, streak=1)
        diego = User(name="Diego", email="diego@example.com", xp_total=600, streak=5)
        
        # Save users
        db.add_all([alex, maria, carlos, sofia, diego])
        db.commit()
        db.refresh(alex)
        
        # Enroll Alex in the Spanish course
        enrollment = UserCourseEnrollment(user_id=alex.id, course_id=spanish_course.id, enrolled_at=three_days_ago)
        db.add(enrollment)
        db.commit()
        
        # Add Skill Progress for Alex
        # Fetch the skills we created to link them
        u1_skills = db.query(Skill).join(Unit).filter(Unit.course_id == spanish_course.id, Unit.order == 1).order_by(Skill.order).all()
        if len(u1_skills) >= 2:
            greetings = u1_skills[0]
            introductions = u1_skills[1]
            
            # Greetings is fully completed (Level 1)
            prog_greet = UserSkillProgress(
                user_id=alex.id,
                skill_id=greetings.id,
                level=1,
                completed_lessons=2,
                total_lessons=2,
                completed_at=three_days_ago
            )
            # Introductions is half completed (Level 0)
            prog_intro = UserSkillProgress(
                user_id=alex.id,
                skill_id=introductions.id,
                level=0,
                completed_lessons=1,
                total_lessons=2,
                completed_at=None
            )
            db.add_all([prog_greet, prog_intro])
            db.commit()
            
            # Add Lesson Attempts for realism
            # Fetch lessons for Greetings
            greet_lessons = db.query(Lesson).filter(Lesson.skill_id == greetings.id).all()
            if greet_lessons:
                att1 = UserLessonAttempt(user_id=alex.id, lesson_id=greet_lessons[0].id, xp_earned=15, hearts_lost=0, started_at=three_days_ago, completed_at=three_days_ago, passed=True)
                db.add(att1)
            
        # Add Achievements
        ach1 = UserAchievement(user_id=alex.id, achievement_type="first_lesson", achieved_at=three_days_ago)
        ach2 = UserAchievement(user_id=alex.id, achievement_type="streak_3", achieved_at=now)
        db.add_all([ach1, ach2])
        db.commit()
        
    print("Database seeding completed.")

# Execution block for running the script standalone
if __name__ == "__main__":
    # Create a fresh DB session
    db = SessionLocal()
    try:
        # Run the seed logic
        seed_database(db)
    finally:
        # Always close the session to avoid leaks
        db.close()
