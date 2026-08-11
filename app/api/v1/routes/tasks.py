from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import SessionLocal
from app.services import task_service
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.models.user import User
from app.models.task import Task
from app.api.v1.dependencies import get_current_user, get_current_admin

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================
# 1. ADMIN ENDPOINTS (Sirf Admin)
# ============================================================

@router.get("/", response_model=List[TaskOut])
def list_tasks(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return task_service.get_tasks(db, skip, limit)

@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return task_service.create_task(db, task)

@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int, 
    task_update: TaskUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    db_task = task_service.update_task(db, task_id, task_update)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    if not task_service.delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return None

# ============================================================
# 2. USER ENDPOINTS
# ============================================================

@router.get("/my-tasks", response_model=List[TaskOut])
def get_my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.assigned_to == current_user.id).all()
    return tasks

@router.get("/project/{project_id}", response_model=List[TaskOut])
def list_tasks_by_project(
    project_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return task_service.get_tasks_by_project(db, project_id, skip, limit)

@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int, 
    db: Session = Depends(get_db)
):
    db_task = task_service.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

# ============================================================
# 3. TASK COMPLETE (Toggle: done <-> todo)
# ============================================================

@router.put("/{task_id}/complete")
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.assigned_to != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403, 
            detail="❌ You are not assigned to this task"
        )
    
    if task.status == "done":
        task.status = "todo"
        message = "🔄 Task uncompleted (moved back to todo)"
    else:
        task.status = "done"
        message = "✅ Task completed successfully!"
    
    db.commit()
    db.refresh(task)
    
    return {
        "message": message,
        "task": task,
        "task_id": task.id,
        "new_status": task.status
    }

# ============================================================
# 4. 🆕 TASK STATUS UPDATE (Any status)
# ============================================================

@router.put("/{task_id}/status")
def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_statuses = ["todo", "in_progress", "done", "blocked", "review"]
    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Allowed: {allowed_statuses}"
        )
    
    task = task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Sirf assignee ya admin hi status update kar sakta hai
    if task.assigned_to != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403, 
            detail="❌ You are not assigned to this task"
        )
    
    old_status = task.status
    task.status = status
    db.commit()
    db.refresh(task)
    
    return {
        "message": f"✅ Task status updated from '{old_status}' to '{status}'",
        "task": task
    }