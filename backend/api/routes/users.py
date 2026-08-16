# ==============================================================================
# USER MANAGEMENT & HEARTS REFILL ENDPOINTS (api/routes/users.py)
# ==============================================================================
# Yahan User profile management aur Shop feature (Hearts Refill using Gems) chalta hai.
# Endpoints:
# 1. GET /api/users/{user_id} -> User stats (XP, Hearts, Gems, Streak)
# 2. PATCH /api/users/{user_id} -> Profile Edit (Partial Update)
# 3. POST /api/users/{user_id}/refill-hearts -> 100 Gems kat ke 5 Hearts restore!

# 1. APIRouter, Depends, HTTPException (FastAPI Built-in Tools): Framework helpers.
# 2. Session (SQLAlchemy Built-in): Database session type.
# 3. get_db (Custom Core Dependency): DB session provider.
# ------------------------------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from core.database import get_db
from models.user import User
from schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])

#==============================================================================
# GET /api/users/{user_id} - Fetch User Stats
#==============================================================================
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ==============================================================================
# PATCH /api/users/{user_id} - Dynamic Profile Update
# ==============================================================================
# Partial Update using Pydantic `model_dump(exclude_unset=True)`
# Jab frontend se sirf name change ho, toh `exclude_unset=True` ensures karta hai ki 
# baaki fields (gems, xp) touch na hon.
# ==============================================================================
@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Inbuilt Pydantic V2 Method: `model_dump(exclude_unset=True)`
    # Sirf wahi dictionary keys filter karta hai jo JSON body me submit ki gayi hain.
    update_data = user_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        # Inbuilt Python Function: `setattr` object field update karta hai
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user

# ==============================================================================
# POST /api/users/{user_id}/refill-hearts - Shop Hearts Refill
# ==============================================================================
# HINDI CONCEPT: Gems to Hearts Exchange Transaction
# Cost: 100 Gems
# Action: Deducts 100 gems & resets hearts = max_hearts (5).
# Validation: Returns 400 Bad Request if gems < 100 or hearts are already full.
# ==============================================================================
@router.post("/{user_id}/refill-hearts", response_model=UserResponse)
def refill_hearts(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    refill_cost: int = 100
    
    if user.gems < refill_cost:
        raise HTTPException(status_code=400, detail="Not enough gems")
        
    if user.hearts >= user.max_hearts:
        raise HTTPException(status_code=400, detail="Hearts are already full")
        
    user.gems -= refill_cost
    user.hearts = user.max_hearts
    
    db.commit()
    db.refresh(user)
    return user

