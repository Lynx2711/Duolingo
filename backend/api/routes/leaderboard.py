# ==============================================================================
# GLOBAL LEADERBOARD ENDPOINT (api/routes/leaderboard.py)
# ==============================================================================
# HINDI CONCEPT (समझने के लिए):
# Global Ranking Table!
# Users ko unke Total XP (`xp_total`) ke descending order me sort karke top 20 users
# return karta hai.
# SQL equivalent: SELECT * FROM users ORDER BY xp_total DESC LIMIT 20;
# ==============================================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.user import User
from schemas.progress import LeaderboardEntry

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

@router.get("/", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)) -> List[LeaderboardEntry]:
    # SQLAlchemy Query: `order_by(User.xp_total.desc()).limit(20)`
    users = db.query(User).order_by(User.xp_total.desc()).limit(20).all()
    
    leaderboard = [
        LeaderboardEntry(
            id=user.id,
            name=user.name,
            avatar_url=user.avatar_url,
            xp_total=user.xp_total
        )
        for index, user in enumerate(users)
    ]
    
    return leaderboard

