from sqlalchemy.orm import Session
from app.services import project_service, task_service, report_service

def get_active_alerts(db: Session):
    """
    Saari active alerts (High Risk, Blocked, Inactive) collect karo
    """
    alerts = []
    projects = project_service.get_projects(db)
    
    for p in projects:
        # 1. HIGH RISK ALERT
        risk = report_service.predict_risk(db, p.id)
        if risk.get("risk") == "High":
            alerts.append({
                "type": "risk",
                "project_id": p.id,
                "project_name": p.name,
                "message": f"🚨 Project '{p.name}' is HIGH RISK ({risk['risk_percentage']}% risky tasks).",
                "timestamp": risk.get("timestamp", "Now")
            })
        
        # 2. INACTIVE ALERT
        if not p.is_active:
            alerts.append({
                "type": "inactive",
                "project_id": p.id,
                "project_name": p.name,
                "message": f"⏳ Project '{p.name}' is INACTIVE (no activity for 7+ days).",
                "timestamp": "Now"
            })
        
        # 3. BLOCKED TASKS ALERT
        tasks = task_service.get_tasks_by_project(db, p.id)
        for t in tasks:
            if t.status == "blocked":
                alerts.append({
                    "type": "blocked",
                    "project_id": p.id,
                    "project_name": p.name,
                    "task_id": t.id,
                    "task_title": t.title,
                    "message": f"🚫 Task '{t.title}' in project '{p.name}' is BLOCKED.",
                    "timestamp": "Now"
                })
    
    return alerts