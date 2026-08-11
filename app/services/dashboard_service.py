from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.services import project_service, task_service, report_service

def get_dashboard_summary(db: Session):
    """
    Dashboard summary with REAL month-over-month trends
    """
    # Current month data
    now = datetime.utcnow()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Last month data
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = current_month_start - timedelta(microseconds=1)
    
    # --------------------------------
    # 1. TOTAL PROJECTS & TREND
    # --------------------------------
    all_projects = project_service.get_projects(db)
    total_projects = len(all_projects)
    
    # Projects created this month vs last month
    current_month_projects = sum(1 for p in all_projects if p.start_date >= current_month_start)
    last_month_projects = sum(1 for p in all_projects if last_month_start <= p.start_date < current_month_start)
    
    projects_trend = _calculate_trend(current_month_projects, last_month_projects)
    
    # --------------------------------
    # 2. TOTAL TASKS & TREND
    # --------------------------------
    all_tasks = []
    for p in all_projects:
        all_tasks.extend(task_service.get_tasks_by_project(db, p.id))
    total_tasks = len(all_tasks)
    
    # Tasks created this month vs last month
    current_month_tasks = sum(1 for t in all_tasks if t.created_at >= current_month_start)
    last_month_tasks = sum(1 for t in all_tasks if last_month_start <= t.created_at < current_month_start)
    
    tasks_trend = _calculate_trend(current_month_tasks, last_month_tasks)
    
    # --------------------------------
    # 3. COMPLETION RATE & TREND
    # --------------------------------
    done_tasks = sum(1 for t in all_tasks if t.status == "done")
    completion_rate = round((done_tasks / total_tasks) * 100, 2) if total_tasks > 0 else 0
    
    # Last month completion rate
    last_month_tasks_list = [t for t in all_tasks if last_month_start <= t.created_at < current_month_start]
    last_month_done = sum(1 for t in last_month_tasks_list if t.status == "done")
    last_month_total = len(last_month_tasks_list)
    last_month_completion = round((last_month_done / last_month_total) * 100, 2) if last_month_total > 0 else 0
    
    completion_trend = _calculate_trend(completion_rate, last_month_completion)
    
    # --------------------------------
    # 4. HIGH RISK & TREND
    # --------------------------------
    high_risk_count = 0
    high_risk_projects = []
    
    # Last month high risk count (tracking purpose)
    last_month_high_risk = 0
    
    for p in all_projects:
        risk = report_service.predict_risk(db, p.id)
        if risk.get("risk") == "High":
            high_risk_count += 1
            high_risk_projects.append({
                "id": p.id,
                "name": p.name,
                "risk_percentage": risk.get("risk_percentage", 0)
            })
            # Check if project was high risk last month (based on start_date)
            if last_month_start <= p.start_date < current_month_start:
                last_month_high_risk += 1
    
    risk_trend = _calculate_trend(high_risk_count, last_month_high_risk) if high_risk_count > 0 else "0%"
    
    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "overall_completion_rate": completion_rate,
        "high_risk_count": high_risk_count,
        "high_risk_projects": high_risk_projects,
        "trends": {
            "projects": projects_trend,
            "tasks": tasks_trend,
            "completion": completion_trend,
            "risk": risk_trend
        }
    }

def _calculate_trend(current: float, previous: float) -> str:
    """Calculate percentage change between two numbers"""
    if previous == 0:
        if current == 0:
            return "0%"
        return "🆕 New"   # ✅ +100% ki jagah "New" dikhega
    change = ((current - previous) / previous) * 100
    
    # Agar change bohat zyada hai toh emoji ke saath dikhao (optional)
    if change > 200:
        return f"🚀 +{change:.0f}%"
    
    return f"{'+' if change >= 0 else ''}{change:.1f}%"