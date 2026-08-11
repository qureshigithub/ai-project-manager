import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

sys.path.append(str(Path(__file__).parent))
from app.models.user import User
from app.db.base import Base

# Neon Database URL
URL = "postgresql://neondb_owner:npg_X9eYRiDMol3F@ep-rough-block-axhy5of0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(URL)
SessionLocal = sessionmaker(bind=engine)

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def fresh_start():
    db = SessionLocal()
    try:
        print("🗑️ Purane users delete kiye ja rahe hain...")
        db.query(User).delete()
        db.commit()
        print("✅ Database bilkul saaf (Fresh) ho gayi hai!")

        print("👤 Naya Admin banaya ja raha hai...")
        hashed_pw = pwd_context.hash("admin123")
        
        new_admin = User(
            name="Admin",
            email="admin@ezitech.com",
            password=hashed_pw,
            role="admin",
            is_admin=True
        )
        
        db.add(new_admin)
        db.commit()
        print("✅ Naya Admin 'admin@ezitech.com' (Password: admin123) successfully ban gaya!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fresh_start()
