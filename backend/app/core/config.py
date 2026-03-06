from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Task & Productivity Management Platform"
    MONGODB_URL: str = "mongodb://mongodb:27017"
    DATABASE_NAME: str = "productivity_platform"
    SECRET_KEY: str = "your-secret-key-here"  # In production, use a real secret key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    AI_PROVIDER: str = "gemini"
    AI_INSIGHTS_MODE: str = "rule_based"
    GEMINI_API_KEY: str = ""  # Set via .env file
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GROQ_API_KEY: str = ""  # Set via .env file
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    class Config:
        env_file = ".env"

settings = Settings()
