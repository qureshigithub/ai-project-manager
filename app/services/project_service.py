from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Project).offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate):
    # 1. Data ko dict mein badlo
    project_data = project.model_dump()
    
    # 2. Agar end_date hai toh usko SQLite-friendly (Naive) DateTime mein badlo
    if 'end_date' in project_data and project_data['end_date'] is not None:
        dt = project_data['end_date']
        # Agar is mein timezone info hai (jaise +00:00 ya Z) toh hata do
        if dt.tzinfo is not None:
            project_data['end_date'] = dt.replace(tzinfo=None)
    
    # 3. Model create karo aur database mein daalo
    db_project = Project(**project_data)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project_update: ProjectUpdate):
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    # Sirf wohi fields update karo jo user ne bheji hain
    for key, value in project_update.model_dump(exclude_unset=True).items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False