import sqlite3

def make_everyone_admin():
    try:
        conn = sqlite3.connect("ai_project.db")
        cursor = conn.cursor()
        
        # Update ALL users to admin (Case-insensitive issue fix)
        cursor.execute("UPDATE users SET role = 'admin', is_admin = 1")
        conn.commit()
        
        print("✅ Success! Sab users ab Admin ban gaye hain!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    make_everyone_admin()
