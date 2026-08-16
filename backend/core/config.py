# ==============================================================================
# APPLICATION CONFIGURATION SYSTEM (core/config.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# config.py humare project ka "Control Panel / Settings Manager" hai.
# Jab hum app ko local environment (localhost) ya production server (Render/Vercel)
# par chalate hain, toh Configuration Variables (jaise Database ka Path, Secret Keys)
# `.env` file se read hokar yahan load hote hain.
# ==============================================================================

# ------------------------------------------------------------------------------
# INBUILT VS CUSTOM IMPORTS EXPLANATION:
# ------------------------------------------------------------------------------
# BaseSettings (Inbuilt Pydantic Settings Class):
# Pydantic Settings library ka built-in class jo automatically system Environment 
# Variables (ya `.env` file) se values read karke Python data types (str, list) 
# me convert karta hai aur validation karta hai.
# ------------------------------------------------------------------------------
from pydantic_settings import BaseSettings

# ==============================================================================
# SETTINGS MODEL CLASS (Custom Configuration Definition inheriting from BaseSettings)
# ==============================================================================
class Settings(BaseSettings):
    # 1. DATABASE_URL (Default: local SQLite database file `duolingo.db`)
    # Data Kahan Se Aata Hai: `.env` file me `DATABASE_URL` variable se,
    # ya agar wo nahi mile toh default value `'sqlite:///./duolingo.db'` use hoti hai.
    DATABASE_URL: str = 'sqlite:///./duolingo.db'
    
    # 2. CORS_ORIGINS (List of Allowed Allowed Frontend Domains)
    CORS_ORIGINS: list[str] = ['http://localhost:3000']
    
    # 3. APP_NAME (Application Title for Swagger API Docs)
    APP_NAME: str = 'Duolingo Clone API'
    
    # Pydantic Model Configuration (Inbuilt Setting):
    # Pydantic ko batate hain ki agar root directory me `.env` file mile toh wahan se read kare.
    model_config = {'env_file': '.env'}

# ==============================================================================
# GLOBAL SINGLETON INSTANCE (Custom Instance Creation)
# ==============================================================================
# Instantiating `Settings()` class once.
# Ab pure backend me jahan bhi settings chahiye, hum `from core.config import settings`
# karke `settings.DATABASE_URL` ya `settings.APP_NAME` directly access kar sakte hain.
settings = Settings()

