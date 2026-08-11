from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[int] = 1
    project_id: int
    assigned_to: Optional[int] = None
    depends_on: Optional[int] = None
    start_date: Optional[datetime] = None  # 🆕
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    assigned_to: Optional[int] = None
    depends_on: Optional[int] = None
    start_date: Optional[datetime] = None  # 🆕
    due_date: Optional[datetime] = None

class TaskOut(TaskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True