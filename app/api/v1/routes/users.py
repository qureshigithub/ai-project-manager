from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import SessionLocal
from app.services import user_service
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.models.user import User
from app.models.task import Task
from app.api.v1.dependencies import get_current_admin  # 🆕 Admin permission

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================
# 1. PUBLIC / BASIC ENDPOINTS
# ============================================================

@router.get("/", response_model=List[UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user_service.get_users(db, skip, limit)

@router.post("/", response_model=UserOut, status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = user_service.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(db, user)

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user_service.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = user_service.update_user(db, user_id, user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    if not user_service.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return None

# ============================================================
# 2. 🆕 ADMIN-ONLY ENDPOINTS
# ============================================================

@router.get("/{user_id}/tasks")
def get_user_tasks(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # 🔒 Sirf Admin
):
    """
    🔒 ADMIN ONLY: Kisi specific user ke saare tasks dekhne ke liye.
    Is endpoint ko Admin Dashboard ke "Students" tab mein use karein.
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch all tasks assigned to this user
    tasks = db.query(Task).filter(Task.assigned_to == user_id).all()
    
    return {
        "user_id": user.id,
        "user_name": user.name,
        "user_email": user.email,
        "total_tasks": len(tasks),
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "status": t.status,
                "project_id": t.project_id,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tasks
        ]
    }