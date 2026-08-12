from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Project Manager"
    DATABASE_URL: str = "sqlite:///./ai_project.db"
    GROQ_API_KEY: str = ""
    HF_TOKEN: str = ""
    ADMIN_PASSWORD: str = ""

    class Config:
        env_file = ".env"

settings = Settings()