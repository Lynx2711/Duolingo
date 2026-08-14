# Import FastAPI and its lifecycle tools
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import contextlib for lifespan event handling
from contextlib import asynccontextmanager
import uvicorn

# Import core configurations and database setups
from core.config import settings
from core.database import engine, Base, SessionLocal

# Import routers for the API endpoints
from api.routes import health, users, courses, lessons, progress, leaderboard, profile

# Import the seed script to optionally populate the DB on startup
from seed import seed_database

# Define the lifespan manager to execute startup and shutdown tasks
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: Create all tables defined in SQLAlchemy models if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # STARTUP: Open a DB session to check if seeding is needed
    db = SessionLocal()
    try:
        # Import User locally to avoid circular imports if needed, though safe here
        from models.user import User
        # Check if the database is empty (no users exist)
        if not db.query(User).first():
            # If empty, run the seed script to populate default courses and users
            seed_database(db)
    finally:
        # Close the DB session to prevent memory leaks
        db.close()
        
    # Yield control back to FastAPI to serve requests
    yield
    # SHUTDOWN: (Nothing required here for now)
    pass

# Initialize the FastAPI application with metadata and lifespan
app = FastAPI(
    title=settings.APP_NAME, # Application title from settings
    description="Backend API for Duolingo Clone", # Short description
    version="1.0.0", # API version
    lifespan=lifespan # Attach the lifespan context manager for startup tasks
)

# Configure Cross-Origin Resource Sharing (CORS) so the frontend can interact with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS, # Allow specific origins from config
    allow_credentials=True, # Allow cookies/auth headers
    allow_methods=["*"], # Allow all HTTP methods (GET, POST, etc)
    allow_headers=["*"], # Allow all headers
)

# Include all the API routers to register their endpoints
app.include_router(health.router) # Health check
app.include_router(users.router) # User management
app.include_router(courses.router) # Course navigation and paths
app.include_router(lessons.router) # Lesson taking and checking
app.include_router(progress.router) # Skill progress tracking
app.include_router(leaderboard.router) # Global leaderboard
app.include_router(profile.router) # User profiles

# Root endpoint for browser checks
@app.get("/")
def root():
    return {"status": "ok", "app_name": settings.APP_NAME, "docs_url": "/docs"}

# Ensure the server runs when executed directly
if __name__ == "__main__":
    # Start the uvicorn ASGI server with hot reloading enabled
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
