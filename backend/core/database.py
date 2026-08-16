# ==============================================================================
# DATABASE CONNECTION & ORM BASE CONFIGURATION (core/database.py)
# ==============================================================================
# database.py humare Python backend aur SQLite Database (`duolingo.db`) ke beech 
# Connection Bridge banata hai.
# FastAPI me hum har HTTP request ke liye ek naya Database Session kholte hain, 
# kaam khatam hote hi us connection ko safe tariqe se close kar dete hain.
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. create_engine (SQLAlchemy Inbuilt): Database file se physical connection setup karta hai.
# 2. MetaData (SQLAlchemy Inbuilt): Database constraints aur naming rules hold karta hai.
# 3. declarative_base (SQLAlchemy Inbuilt ORM Base): Saare Database Models (User, Lesson) 
#    is Base class se inherit karte hain taaki Python class = Database Table ban sake.
# 4. sessionmaker (SQLAlchemy Inbuilt Factory): Har request ke liye naye Database Sessions (SessionLocal)
#    create karne wali factory.
# ------------------------------------------------------------------------------
from sqlalchemy import create_engine
from sqlalchemy import MetaData
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator

# Custom Settings Import:
from core.config import settings

# ==============================================================================
# DATABASE CONSTRAINT NAMING CONVENTIONS (SQLAlchemy Best Practice)
# ==============================================================================
# Alembic Database Migrations me Automatic Foreign Key / Primary Key naming issues 
# se bachane ke liye standard naming rule.
naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Inbuilt MetaData Instance:
metadata = MetaData(naming_convention=naming_convention)

# ==============================================================================
# SQLALCHEMY ENGINE CREATION (Built-in SQLAlchemy Engine)
# ==============================================================================
# Data Kahan Se Aata Hai: `settings.DATABASE_URL` (i.e. 'sqlite:///./duolingo.db')
# SQLite multithreading environment ke liye `check_same_thread: False` set karna zaroori hai.
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={'check_same_thread': False}
)

# ==============================================================================
# SESSION FACTORY (SessionLocal)
# ==============================================================================
# HINDI CONCEPT: "Session Generator Machine"
# Jab bhi hume database se padhna ya likhna ho, hum `SessionLocal()` se naya session maangte hain.
# - autocommit=False: Pure transaction ko manual `db.commit()` karne par hi save hone deta hai.
# - autoflush=False: Queries se pehle automatic unsaved changes flush hone se rokta hai.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ==============================================================================
# DECLARATIVE BASE CLASS (Base)
# ==============================================================================
# Subhi ORM Models (User, Course, Skill, Lesson, Exercise) is `Base` class se 
# inherit karenge (e.g. `class User(Base): ...`).
Base = declarative_base(metadata=metadata)

# ==============================================================================
# FASTAPI DEPENDENCY FUNCTION (`get_db`)
# ==============================================================================
# HINDI CONCEPT: "Automatic Water Tap (नल)"
# Har FastAPI route function (jaise check_answer, get_user) me hum `db: Session = Depends(get_db)`
# likhte hain. 
# 1. FastAPI request aate hi `get_db()` call karke ek fresh `db` session create karta hai.
# 2. `yield db` ke dwara session route function ko deta hai.
# 3. Route function ka kaam khatam hone par `finally:` block chalta hai aur `db.close()` 
#    se connection safely close ho jata hai.
# ==============================================================================
def get_db() -> Generator:
    db = SessionLocal()  # Naya session khola
    try:
        yield db         # Route handler ko session pass kiya
    finally:
        db.close()       # Connection safely band kar diya

