from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.inactive_service import update_project_activity

def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    """✅ Saare tasks ki list (Admin ke liye)"""
    return db.query(Task).offset(skip).limit(limit).all()

def get_tasks_by_project(db: Session, project_id: int, skip: int = 0, limit: int = 100):
    return db.query(Task).filter(Task.project_id == project_id).offset(skip).limit(limit).all()

def create_task(db: Session, task: TaskCreate):
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Project activity update karo
    update_project_activity(db, task.project_id)
    
    return db_task

def update_task(db: Session, task_id: int, task_update: TaskUpdate):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    # 🔥 Purani status store karo (Self-Healing ke liye)
    old_status = db_task.status
    old_project_id = db_task.project_id
    
    # Fields update karo
    for key, value in task_update.model_dump(exclude_unset=True).items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    
    # ============================================================
    # 🆕 SELF-HEALING WORKFLOW (Bonus Feature)
    # ============================================================
    # Agar task abhi 'done' hua hai aur pehle 'done' nahi tha
    if db_task.status == "done" and old_status != "done":
        # Saare child tasks dhoondho jo is task par depend karte hain aur 'blocked' hain
        child_tasks = db.query(Task).filter(
            Task.depends_on == task_id,
            Task.status == "blocked"
        ).all()
        
        if child_tasks:
            for child in child_tasks:
                child.status = "todo"  # 🎉 Khud-ba-khud unblock!
                db.add(child)
            
            db.commit()
            print(f"✅ Self-Healing: {len(child_tasks)} task(s) auto-unblocked (depends on Task {task_id})")
    
    # Project activity update karo
    update_project_activity(db, db_task.project_id)
    
    # Agar project_id change hui hai toh purani project ki bhi activity update karo
    if old_project_id != db_task.project_id:
        update_project_activity(db, old_project_id)
    
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if db_task:
        project_id = db_task.project_id
        db.delete(db_task)
        db.commit()
        
        # Project activity update karo
        update_project_activity(db, project_id)
        
        return True
    return False