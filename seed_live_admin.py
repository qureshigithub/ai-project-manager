import sys
import os
from pathlib import Path
import bcrypt

# Set up paths so we can import app modules
sys.path.append(str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.user import User

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        email = "admin@ezitech.com"
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"⚠️ Admin '{email}' pehle se maujood hai!")
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
