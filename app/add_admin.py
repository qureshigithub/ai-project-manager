import sqlite3
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# ✅ Terminal root par hai, isliye direct file ka naam likhna theek hai
DB_NAME = "ai_project.db"

def create_admin():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        name = "Admin"
        email = "admin@ezitech.com"
        role = "admin"

        # ✅ YAHAN APNA PASSWORD DAAL DEIN (Jo login karte waqt use karna hai)
        password = os.getenv("ADMIN_PASSWORD")
        if not password:
            raise ValueError("ADMIN_PASSWORD is not set in .env file")

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("""
            INSERT INTO users (name, email, password, role) 
            VALUES (?, ?, ?, ?)
        """, (name, email, hashed_pw, role))

        conn.commit()
        print(f"✅ Admin '{email}' successfully added with password: '{password}'!")

    except sqlite3.IntegrityError:
        print("⚠️ Error: Email already exists in the database!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin()