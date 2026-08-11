from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import SessionLocal
from app.services import project_service
from app.schemas.project import ProjectCreate, ProjectOut

# 🟢 یہاں "router" define ہوا ہے - یہی وہ چیز تھی جو error دے رہی تھی
router = APIRouter()

# Database session har request ke liye
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Saare projects list karo (GET)
@router.get("/", response_model=List[ProjectOut])
def list_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = project_service.get_projects(db, skip, limit)
    return projects

@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    try:
        return project_service.create_project(db, project)
    except Exception as e:
        # Yeh error terminal par bhi dikhega aur Swagger par bhi
        import traceback
        traceback.print_exc()
        # Ab error ka exact reason Swagger UI ke Response body mein dikhega
        raise HTTPException(status_code=400, detail=f"Database Error: {str(e)}")

# 3. Ek specific project ki details lo (GET by ID)
@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    db_project = project_service.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project