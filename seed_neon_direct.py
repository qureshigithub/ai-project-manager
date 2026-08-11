import os
import sys
from pathlib import Path
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(str(Path(__file__).parent))
from app.models.user import User

URL = "postgresql://neondb_owner:npg_X9eYRiDMol3F@ep-rough-block-axhy5of0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
engine = create_engine(URL)
SessionLocal = sessionmaker(bind=engine)

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@ezitech.com"
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"⚠️ Admin '{email}' pehle se maujood hai!")
            # Update password just in case
            hashed_pw = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            existing_user.password = hashed_pw
            db.commit()
            print("Password reset to admin123")
            return

        password = "admin123"
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

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
