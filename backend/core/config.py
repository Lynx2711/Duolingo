# Import BaseSettings to create a configuration class that reads from environment variables
from pydantic_settings import BaseSettings

# Define a Settings class to hold application configuration, inheriting from BaseSettings
class Settings(BaseSettings):
    # Set the default database connection string to a local SQLite database
    DATABASE_URL: str = 'sqlite:///./duolingo.db'
    # Define a list of allowed CORS origins, defaulting to the local React dev server
    CORS_ORIGINS: list[str] = ['http://localhost:3000']
    # Define the application name for use in API docs and logs
    APP_NAME: str = 'Duolingo Clone API'
    
    # Configure the model to load these settings from a .env file if it exists
    model_config = {'env_file': '.env'}

# Create a global settings instance to be imported and used throughout the application
settings = Settings()
