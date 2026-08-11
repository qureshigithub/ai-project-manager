from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.auth import get_current_user as auth_get_current_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # auth_get_current_user already raises HTTPException if invalid
    return auth_get_current_user(token, db)

def get_current_admin(user = Depends(get_current_user)):
    if not (user.is_admin or user.role == "admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user