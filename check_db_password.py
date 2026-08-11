import os
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(Path(__file__).parent))
from app.models.user import User

URL = "postgresql://neondb_owner:npg_X9eYRiDMol3F@ep-rough-block-axhy5of0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(URL)
SessionLocal = sessionmaker(bind=engine)

def check_db():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for u in users:
            print(f"Email: {u.email}")
            print(f"Password Length: {len(u.password) if u.password else 0}")
            print(f"Password starts with: {u.password[:10]}...")
            print("-" * 20)
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
