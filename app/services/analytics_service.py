from sqlalchemy.orm import Session
from app.services import task_service, user_service, project_service

def get_workload_distribution(db: Session, project_id: int = None):
    """
    Har user ke tasks count aur percentage nikalna
    """
    try:
        users = user_service.get_users(db)
        tasks = []
        
        if project_id:
            tasks = task_service.get_tasks_by_project(db, project_id)
        else:
            projects = project_service.get_projects(db)
            for p in projects:
                tasks.extend(task_service.get_tasks_by_project(db, p.id))
        
        workload = []
        total_tasks = len(tasks)
        
        for user in users:
            user_tasks = [t for t in tasks if t.assigned_to == user.id]
            count = len(user_tasks)
            percentage = (count / total_tasks * 100) if total_tasks > 0 else 0
            
            # Status breakdown
            status_counts = {}
            for t in user_tasks:
                status_counts[t.status] = status_counts.get(t.status, 0) + 1
            
            # Task list with title and status
            task_list = [{"title": t.title, "status": t.status} for t in user_tasks]
            
            workload.append({
                "user_id": user.id,
                "user_name": user.name,
                "role": user.role,
                "task_count": count,
                "percentage": round(percentage, 2),
                "status_breakdown": status_counts,
                "tasks": task_list
            })
        
        return {
            "total_tasks": total_tasks,
            "workload": workload
        }
    except Exception as e:
        # 🔥 Agar koi error aata hai toh woh frontend par dikhe
        return {"error": str(e)}

def get_dependency_status(db: Session, project_id: int):
    """
    Tasks ki dependencies check karna
    """
    try:
        tasks = task_service.get_tasks_by_project(db, project_id)
        dependency_report = []
        
        for task in tasks:
            if task.depends_on is not None:
                parent = task_service.get_task(db, task.depends_on)
                if parent:
                    is_blocked = parent.status != "done"
                    dependency_report.append({
                        "task_id": task.id,
                        "task_title": task.title,
                        "depends_on_task_id": parent.id,
                        "depends_on_title": parent.title,
                        "parent_status": parent.status,
                        "is_blocked_by_dependency": is_blocked,
                        "current_status": task.status
                    })
        return dependency_report
    except Exception as e:
        return {"error": str(e)}

def get_resource_utilization(db: Session, project_id: int = None):
    """
    Resource Utilization: Total tasks per user, average priority, etc.
    """
    try:
        users = user_service.get_users(db)
        tasks = []
        
        if project_id:
            tasks = task_service.get_tasks_by_project(db, project_id)
        else:
            projects = project_service.get_projects(db)
            for p in projects:
                tasks.extend(task_service.get_tasks_by_project(db, p.id))
        
        utilization = []
        for user in users:
            user_tasks = [t for t in tasks if t.assigned_to == user.id]
            if user_tasks:
                done = sum(1 for t in user_tasks if t.status == "done")
                in_progress = sum(1 for t in user_tasks if t.status == "in_progress")
                blocked = sum(1 for t in user_tasks if t.status == "blocked")
                avg_priority = sum(t.priority for t in user_tasks) / len(user_tasks) if user_tasks else 0
                
                utilization.append({
                    "user_id": user.id,
                    "user_name": user.name,
                    "total": len(user_tasks),
                    "done": done,
                    "in_progress": in_progress,
                    "blocked": blocked,
                    "avg_priority": round(avg_priority, 2)
                })
        return utilization
    except Exception as e:
        return {"error": str(e)}