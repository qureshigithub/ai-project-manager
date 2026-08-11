import sqlite3

def check_db():
    conn = sqlite3.connect("ai_project.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, is_admin FROM users WHERE email = 'admin@ezitech.com'")
    user = cursor.fetchone()
    print(f"USER RECORD: {user}")
    conn.close()

if __name__ == "__main__":
    check_db()
