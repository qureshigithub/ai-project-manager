from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import analytics_service, project_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Workload Distribution
@router.get("/workload")
def get_workload(project_id: int = None, db: Session = Depends(get_db)):
    return analytics_service.get_workload_distribution(db, project_id)

# 2. Dependency Status
@router.get("/dependencies/{project_id}")
def get_dependencies(project_id: int, db: Session = Depends(get_db)):
    project = project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return analytics_service.get_dependency_status(db, project_id)

# 3. Resource Utilization
@router.get("/utilization")
def get_utilization(project_id: int = None, db: Session = Depends(get_db)):
    return analytics_service.get_resource_utilization(db, project_id)