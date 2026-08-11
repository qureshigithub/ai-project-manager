from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.project import Project
from app.models.task import Task

def check_and_update_inactive_projects(db: Session, days_threshold: int = 7):
    """
    Un projects ko detect karo jin ki last_activity 7 din se zyada purani hai.
    """
    now = datetime.utcnow()
    threshold = now - timedelta(days=days_threshold)
    
    inactive_projects = db.query(Project).filter(
        Project.last_activity < threshold,
        Project.is_active == True
    ).all()
    
    results = []
    for project in inactive_projects:
        project.is_active = False
        results.append({
            "project_id": project.id,
            "project_name": project.name,
            "last_activity": project.last_activity,
            "days_inactive": (now - project.last_activity).days,
            "status": "marked_inactive"
        })
    
    db.commit()
    return results

def get_inactive_projects(db: Session, days_threshold: int = 7):
    """Sirf inactive projects ki list return karo (update kiye bina)"""
    now = datetime.utcnow()
    threshold = now - timedelta(days=days_threshold)
    
    inactive_projects = db.query(Project).filter(
        Project.last_activity < threshold,
        Project.is_active == True
    ).all()
    
    return inactive_projects

def update_project_activity(db: Session, project_id: int):
    """Jab koi task update ho toh project ki last_activity update karo"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.last_activity = datetime.utcnow()
        project.is_active = True
        db.commit()
        return True
    return False