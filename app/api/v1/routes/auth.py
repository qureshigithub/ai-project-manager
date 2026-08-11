from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, Token
from app.auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    get_current_user as auth_get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.api.v1.dependencies import get_current_user
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ============================================================
# 🔥 REGISTER LOGIC (First user = Admin)
# ============================================================
@router.post("/register", response_model=dict)
def register(user_data: UserCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # Check email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # ✅ LOGIC 1: Check if this is the FIRST user in the database
    first_user_check = db.query(User).first()
    
    # ✅ LOGIC 2: Assign Role
    final_role = "engineer" # Default role
    
    if first_user_check is None:
        # 🟢 PEHLA USER: Admin bana do
        final_role = "admin"
    else:
        # 🟡 DOSRA YA BAQI USERS: Check karo kya request Admin dashboard se aa rahi hai
        try:
            # Agar token valid hai aur usme admin ka role hai
            current_user = auth_get_current_user(token, db)
            if current_user.role == "admin":
                # Agar Admin register kar raha hai, toh usay wo role dedo jo usne form mein select kiya
                final_role = user_data.role
            else:
                # Agar normal user try kar raha hai, toh usay engineer banao
                final_role = "engineer"
        except:
            # Agar token invalid hai (public register), toh usay engineer banao
            final_role = "engineer"

    # Hash password aur user create karo
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=final_role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id, "role": new_user.role}


# ============================================================
# 🔑 LOGIN LOGIC (Same rahega)
# ============================================================
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        try:
            is_valid = verify_password(form_data.password, user.password)
        except Exception as ve:
            raise HTTPException(
                status_code=400, 
                detail=f"BCRYPT CRASH: {str(ve)} | Plain len: {len(form_data.password)} | Hash len: {len(user.password) if user.password else 0} | Plain[:10]: {form_data.password[:10]}"
            )
            
        if not is_valid:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role, "user_id": user.id},
            expires_delta=access_token_expires
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user_id": user.id, 
            "name": user.name, 
            "role": user.role, 
            "is_admin": (user.role == "admin")
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"BACKEND CRASH: {str(e)} | Type: {type(e).__name__}")


# ============================================================
# 👤 GET CURRENT USER (Dashboard ke liye)
# ============================================================
@router.get("/me", response_model=None)
async def read_users_me(current_user: User = Depends(get_current_user)):
    # ✅ FIX: 'db' parameter hata diya hai, qk get_current_user khud db use kar leta hai!
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_admin": (current_user.role == "admin")
    }