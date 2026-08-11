from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.services import task_service

def get_weekly_sprint_summary(db: Session, project_id: int):
    """
    Project ke pichle 7 din (week) ke tasks ka summary generate karo
    """
    # Saare tasks fetch karo
    tasks = task_service.get_tasks_by_project(db, project_id)
    
    # Pichle 7 din ke tasks filter karo
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_tasks = [t for t in tasks if t.created_at >= one_week_ago]
    
    total = len(weekly_tasks)
    done = sum(1 for t in weekly_tasks if t.status == "done")
    blocked = sum(1 for t in weekly_tasks if t.status == "blocked")
    in_progress = sum(1 for t in weekly_tasks if t.status == "in_progress")
    todo = sum(1 for t in weekly_tasks if t.status == "todo")
    
    completion_rate = round((done / total) * 100, 2) if total > 0 else 0
    
    # Sprint health status
    if completion_rate >= 70:
        status = "✅ On Track"
    elif completion_rate >= 40:
        status = "⚠️ Needs Attention"
    else:
        status = "🚨 Critical"
    
    return {
        "project_id": project_id,
        "week_start": one_week_ago.isoformat(),
        "week_end": datetime.utcnow().isoformat(),
        "total_tasks": total,
        "done": done,
        "blocked": blocked,
        "in_progress": in_progress,
        "todo": todo,
        "completion_rate": completion_rate,
        "status": status,
        "message": f"{total} tasks this week. {done} completed. {blocked} blocked." if total > 0 else "No tasks this week."
    }