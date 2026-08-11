from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import report_service
from app.services import project_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Risk Report
@router.get("/risk/{project_id}")
def get_risk_report(project_id: int, db: Session = Depends(get_db)):
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    risk_data = report_service.predict_risk(db, project_id)
    risk_data["project_id"] = project_id
    return risk_data

# 2. Daily Summary
@router.get("/daily/{project_id}")
def get_daily_summary(project_id: int, db: Session = Depends(get_db)):
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return report_service.generate_daily_summary(db, project_id)