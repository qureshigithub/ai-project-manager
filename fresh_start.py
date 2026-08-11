import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

sys.path.append(str(Path(__file__).parent))
from app.models.user import User

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
        new_email = "superadmin@ezitech.com"
        new_password = "SuperPassword123"
        hashed_pw = pwd_context.hash(new_password)
        
        new_admin = User(
            name="Super Admin",
            email=new_email,
            password=hashed_pw,
            role="admin",
            is_admin=True
        )
        
        db.add(new_admin)
        db.commit()
        print(f"✅ Naya Admin '{new_email}' (Password: {new_password}) successfully ban gaya!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fresh_start()
