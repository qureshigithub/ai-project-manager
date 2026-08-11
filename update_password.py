import sqlite3
import bcrypt

def update_admin_password():
    try:
        conn = sqlite3.connect("ai_project.db")
        cursor = conn.cursor()
        
        email = "admin@ezitech.com"
        new_password = "admin123"
        
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
