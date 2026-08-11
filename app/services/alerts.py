from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import alert_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_alerts(db: Session = Depends(get_db)):
    """Saari active alerts ki list return karo"""
    return alert_service.get_active_alerts(db)