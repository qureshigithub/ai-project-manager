from sqlalchemy.orm import Session
from datetime import datetime
from app.services import task_service
from app.services import project_service

def predict_risk(db: Session, project_id: int) -> dict:
    """
    Project ke tasks ko dekh kar risk calculate karo
    High: agar 30% se zyada tasks overdue ya blocked hain
    Medium: agar 10% se 30% tasks risky hain
    Low: agar 10% se kam risky hain
    """
    tasks = task_service.get_tasks_by_project(db, project_id)
    total = len(tasks)
    if total == 0:
        return {"risk": "Low", "reason": "No tasks assigned yet."}
    
    now = datetime.utcnow()
    risky_tasks_list = []  # Root cause ke liye risky tasks ki list
    
    for t in tasks:
        is_risky = False
        reason = ""
        
        # Check 1: Due date past hai aur task complete nahi?
        if t.due_date and t.due_date < now and t.status != "done":
            is_risky = True
            reason = f"Overdue (due: {t.due_date})"
        
        # Check 2: Task blocked hai?
        if t.status == "blocked":
            is_risky = True
            reason = "Blocked"
        
        if is_risky:
            risky_tasks_list.append({
                "id": t.id,
                "title": t.title,
                "status": t.status,
                "reason": reason
            })
    
    risky_count = len(risky_tasks_list)
    risk_percentage = (risky_count / total) * 100 if total > 0 else 0
    
    if risk_percentage > 30:
        level = "High"
    elif risk_percentage > 10:
        level = "Medium"
    else:
        level = "Low"
    
    return {
        "risk": level,
        "risk_percentage": round(risk_percentage, 2),
        "total_tasks": total,
        "risky_tasks": risky_count,
        "risky_tasks_list": risky_tasks_list  # Root cause list
    }

def generate_daily_summary(db: Session, project_id: int) -> dict:
    """
    Daily summary: total tasks, completed, blocked, progress percentage
    """
    project = project_service.get_project(db, project_id)
    if not project:
        return {"error": "Project not found"}
    
    tasks = task_service.get_tasks_by_project(db, project_id)
    total = len(tasks)
    if total == 0:
        return {
            "project_name": project.name,
            "total_tasks": 0,
            "completed": 0,
            "blocked": 0,
            "completion_percentage": 0,
            "status": "No tasks yet"
        }
    
    done = sum(1 for t in tasks if t.status == "done")
    blocked = sum(1 for t in tasks if t.status == "blocked")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    
    return {
        "project_name": project.name,
        "total_tasks": total,
        "completed": done,
        "blocked": blocked,
        "in_progress": in_progress,
        "completion_percentage": round((done / total) * 100, 2),
        "date": datetime.utcnow().isoformat()
    }