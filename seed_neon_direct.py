import os
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

sys.path.append(str(Path(__file__).parent))
from app.models.user import User

URL = "postgresql://neondb_owner:npg_X9eYRiDMol3F@ep-rough-block-axhy5of0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(URL)
SessionLocal = sessionmaker(bind=engine)

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@ezitech.com"
        existing_user = db.query(User).filter(User.email == email).first()
        hashed_pw = pwd_context.hash("admin123")
        
        if existing_user:
            existing_user.password = hashed_pw
            db.commit()
            print("✅ Password reset to pbkdf2_sha256 hash for admin123")
            return

        new_admin = User(
            name="Admin",
            email=email,
            password=hashed_pw,
            role="admin",
            is_admin=True
        )
        
        db.add(new_admin)
        db.commit()
        print(f"✅ Admin '{email}' successfully Live Database mein add ho gaya!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
