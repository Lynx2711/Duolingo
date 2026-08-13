# Import FastAPI components
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

# Import DB dependency
from core.database import get_db
# Import User model to query XP
from models.user import User
# Import Leaderboard schema
from schemas.progress import LeaderboardEntry

# Create the router for leaderboard endpoints
router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

# Endpoint to get the top users by XP
@router.get("/", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)) -> List[LeaderboardEntry]:
    # Query users, order by xp_total descending, and limit to top 20
    users = db.query(User).order_by(User.xp_total.desc()).limit(20).all()
    
    # Construct the leaderboard entries by mapping the user objects to our schema format
    # We use enumerate to calculate the rank (1-indexed) based on their sorted position
    leaderboard = [
        LeaderboardEntry(
            id=user.id, # User's ID
            name=user.name, # User's display name
            avatar_url=user.avatar_url, # User's avatar
            xp_total=user.xp_total # User's total XP which determines the rank
        )
        for index, user in enumerate(users) # Iterate through the fetched top users
    ]
    
    # Return the calculated leaderboard
    return leaderboard
