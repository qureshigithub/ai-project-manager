import sqlite3
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

def update_admin_password():
    try:
        conn = sqlite3.connect("ai_project.db")
        cursor = conn.cursor()
        
        email = "admin@ezitech.com"
        new_password = os.getenv("ADMIN_PASSWORD")
        if not new_password:
            raise ValueError("ADMIN_PASSWORD is not set in .env file")
        
        # Naya password hash karein
        hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Database mein update karein
        cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_pw, email))
        conn.commit()
        
        print(f"✅ Success! {email} ka password ab '{new_password}' ho gaya hai!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_admin_password()
