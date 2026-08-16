# ==============================================================================
# MAIN APPLICATION ENTRY POINT (main.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# main.py humare poore backend application ki "Main Building / Reception Desk" hai.
# Jab bhi frontend (Next.js) ya user koi request bhejta hai, sabse pehle vo request
# yahan main.py me aati hai. Yahan se security check (CORS) hota hai aur phir request
# right department (Router) ke paas bhej di jaati hai.
# ==============================================================================

import sys
import os

# Python Path Setup (Custom Code):
# System ko batate hain ki backend folder humari root directory hai, 
# taaki `import core...` ya `import models...` karte waqt "ModuleNotFound" error na aaye.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# 1. FastAPI (Inbuilt Class): FastAPI framework ki main application class.
# 2. CORSMiddleware (Inbuilt Middleware): Cross-Origin Resource Sharing security ke liye built-in tool.
# 3. asynccontextmanager (Python Standard Library): Asynchronous lifecycle events manage karne ke liye decorator.
# 4. uvicorn (Inbuilt/External Server): ASGI Web Server jo Python backend ko live HTTP port par chalata hai.
# ------------------------------------------------------------------------------
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# Custom App Imports (Humare dwara banaye gaye modules):
from core.config import settings           # Settings & environment variables
from core.database import engine, Base, SessionLocal  # Database connection tools
from api.routes import health, users, courses, lessons, progress, leaderboard, profile  # API Route Modules
from seed import seed_database             # Initial fake/default data fill karne ka script

# ==============================================================================
# LIFESPAN CONTEXT MANAGER (Inbuilt FastAPI Lifecycle Pattern)
# ==============================================================================
# HINDI CONCEPT: "Dukaan kholne aur band karne ki ceremony"
# `lifespan` function server start hone par (Startup) aur band hone par (Shutdown)
# automatically chalta hai.
# ==============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --------------------------------------------------------------------------
    # STARTUP LOGIC (Server shuru hote hi chalega):
    # --------------------------------------------------------------------------
    # 1. Database Tables Creation (SQLAlchemy Inbuilt Method):
    # Base.metadata.create_all DB me check karta hai, agar tables (users, lessons etc.)
    # nahi bani hain toh SQLite database file (`duolingo.db`) me create kar deta hai.
    Base.metadata.create_all(bind=engine)
    
    # 2. Database Connection Check & Initial Seeding (Custom Logic):
    # Data Kahan Se Aata Hai: Database (`duolingo.db`) se query karke check karte hain
    # ki data exist karta hai ya nahi.
    db = SessionLocal()
    try:
        from models.user import User
        # Agar Database me koi User nahi hai (Empty DB), toh default course & lessons add karo (Seed).
        if not db.query(User).first():
            seed_database(db)
    finally:
        # DB Session close karna zaroori hai memory leaks bachane ke liye.
        db.close()
        
    # `yield` tak ka code STARTUP par chalta hai.
    # Server chal raha hota hai tab control FastAPI ko handover ho jata hai.
    yield
    
    # --------------------------------------------------------------------------
    # SHUTDOWN LOGIC (Server stop hone par chalega):
    # --------------------------------------------------------------------------
    # Agar server band hote waqt koi cleanup karna ho (jaise Redis connection close), 
    # toh wo yahan likha jata hai.
    pass

# ==============================================================================
# FASTAPI APPLICATION INSTANTIATION (Built-in FastAPI Initialization)
# ==============================================================================
# FastAPI object create kar rahe hain jisme saari configurations pass kar rahe hain.
# FastAPI automatically `/docs` route par interactive Swagger UI documentation banata hai.
app = FastAPI(
    title=settings.APP_NAME,                   # Application Name from config
    description="Backend API for Duolingo Clone", # API description
    version="1.0.0",                           # Version number
    lifespan=lifespan,                         # Startup/Shutdown lifecycle link
    docs_url="/docs",                         # Automatic Swagger API Docs URL
    redoc_url="/redoc"                        # Alternative ReDoc Documentation URL
)

# ==============================================================================
# CORS MIDDLEWARE CONFIGURATION (Built-in FastAPI Security Tool)
# ==============================================================================
# HINDI CONCEPT: "Security Guard / Gatekeeper"
# Browsers dusri domain (jaise localhost:3000 ya Vercel) se API request ko block karte hain.
# CORSMiddleware in domains ko white-list karta hai taaki frontend safely data fetch kar sake.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://duolingo-dun.vercel.app",  # Production Vercel Frontend
        "http://localhost:3000",             # Local Next.js Frontend
        "http://localhost:8000",             # Local Backend Docs/Self
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Flexible matching for all Vercel previews
    allow_credentials=True,                         # Allow cookies & authorization headers
    allow_methods=["*"],                             # Allow all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],                             # Allow all request headers
)

# ==============================================================================
# ROUTER REGISTRATION (FastAPI Inbuilt Modular Routing)
# ==============================================================================
# HINDI CONCEPT: "Departments in an Office"
# Humne pure API ko alag-alag modules (routes) me divide kiya hai:
# - health: Server Status check (/health)
# - users: User details & hearts refill (/api/users)
# - courses: Courses, Units & Learning Paths (/api/courses)
# - lessons: Exercise checking & XP calculations (/api/lessons)
# - progress: User skill progress tracking (/api/progress)
# - leaderboard: Top users ranking (/api/leaderboard)
# - profile: User profile stats (/api/profile)
# ==============================================================================
app.include_router(health.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(progress.router)
app.include_router(leaderboard.router)
app.include_router(profile.router)

# ==============================================================================
# ROOT ENDPOINT (FastAPI Path Operation Decorator `@app.get`)
# ==============================================================================
# Simple test endpoint backend online check karne ke liye.
@app.get("/")
def root():
    return {"status": "ok", "app_name": settings.APP_NAME, "docs_url": "/docs"}

# ==============================================================================
# SERVER EXECUTION BLOCK (Uvicorn Runner)
# ==============================================================================
# Jab is file ko directly terminal se chalaya jaye (`python main.py`), 
# tab Uvicorn server port 8000 par launch hota hai with auto-reloading enabled.
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
