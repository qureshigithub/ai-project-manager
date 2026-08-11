import sys
from pathlib import Path

# Project root ko path mein add karo
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.db.session import engine
from app.db.base import Base
import app.models  # models ko register karo

def init_db():
    print("🔄 Database tables create ho rahi hain...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables successfully create ho gayin!")

if __name__ == "__main__":
    init_db()