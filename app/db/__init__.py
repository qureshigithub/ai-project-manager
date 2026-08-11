from sqlalchemy.orm import Session
from app.db.session import SessionLocal

# 🔥 Yeh 'get_db' function hai jo auth.py dhoondh raha tha
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()