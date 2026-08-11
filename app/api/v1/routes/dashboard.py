from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    """Return dashboard summary with real-time trends"""
    return get_dashboard_summary(db)