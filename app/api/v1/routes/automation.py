from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import inactive_service, meeting_service
from app.core.config import settings
from app.services import meeting_service  # 🆕 Yeh line add karo

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Check and Mark Inactive Projects
@router.post("/detect-inactive")
def detect_inactive_projects(days: int = 7, db: Session = Depends(get_db)):
    """
    7 din (ya custom days) se inactive projects ko detect aur mark karo
    """
    results = inactive_service.check_and_update_inactive_projects(db, days_threshold=days)
    return {
        "message": f"{len(results)} projects marked as inactive",
        "projects": results
    }

# 2. Get Inactive Projects List (without updating)
@router.get("/inactive-projects")
def get_inactive_projects(days: int = 7, db: Session = Depends(get_db)):
    """
    Inactive projects ki list return karo
    """
    projects = inactive_service.get_inactive_projects(db, days_threshold=days)
    return [
        {
            "id": p.id,
            "name": p.name,
            "last_activity": p.last_activity,
            "days_inactive": (datetime.utcnow() - p.last_activity).days
        }
        for p in projects
    ]

# 3. Update Project Activity (Manual trigger)
@router.post("/update-activity/{project_id}")
def update_activity(project_id: int, db: Session = Depends(get_db)):
    """
    Kisi specific project ki last_activity manually update karo
    """
    success = inactive_service.update_project_activity(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": f"Project {project_id} activity updated"}

# 4. Generate Meeting Summary
@router.post("/meeting-summary")
def create_meeting_summary(meeting_text: str, meeting_type: str = "general"):
    """
    Meeting notes ko Groq AI se summarize karo
    """
    if not meeting_text or len(meeting_text) < 10:
        raise HTTPException(status_code=400, detail="Meeting text is too short")
    
    try:
        summary = meeting_service.generate_meeting_summary(meeting_text, meeting_type)
        return {
            "summary": summary,
            "original_length": len(meeting_text),
            "summary_length": len(summary)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

# 5. Quick Meeting Summary (2-3 sentences)
@router.post("/quick-summary")
def create_quick_summary(meeting_text: str):
    """
    Short meeting summary (2-3 sentences)
    """
    if not meeting_text or len(meeting_text) < 10:
        raise HTTPException(status_code=400, detail="Meeting text is too short")
    
    try:
        summary = meeting_service.generate_quick_summary(meeting_text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")