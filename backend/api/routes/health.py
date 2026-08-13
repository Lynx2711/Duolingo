# Import APIRouter from fastapi to group related endpoints together
from fastapi import APIRouter
# Import Any for type hinting the response dictionary
from typing import Any
# Import settings from core.config to access application configuration
from core.config import settings

# Create an APIRouter instance for health check endpoints, with no prefix and a 'Health' tag for documentation
router = APIRouter(prefix="", tags=["Health"])

# Define a GET endpoint at /health to check if the API is running
@router.get("/health", response_model=dict[str, str])
def health_check() -> dict[str, str]:
    # Return a dictionary containing the status and the application name to confirm it's alive and correct
    return {
        "status": "ok", # Indicates that the service is running successfully
        "app_name": settings.APP_NAME # Returns the name of the app to verify the environment is loaded
    }
