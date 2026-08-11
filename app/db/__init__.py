from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Database URL (Usually from .env)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL  # Agar aap .env use kar rahe hain
# Ya direct SQLite path
# SQLALCHEMY_DATABASE_URL = "sqlite:///./ai_project.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 🔥 Yeh 'get_db' function hai jo auth.py dhoondh raha tha
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()