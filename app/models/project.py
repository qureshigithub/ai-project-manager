from sqlalchemy import Column, Integer, String, DateTime, Boolean  # 🆕 Boolean yahan add karo
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="active")
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)

    # 🆕 YEH 2 LINES ADD KARO (Inactive Detection ke liye)
    last_activity = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationship (Tasks ke saath)
    tasks = relationship("Task", back_populates="project")