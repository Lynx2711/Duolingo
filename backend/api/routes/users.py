# Import APIRouter, Depends, and HTTPException from fastapi for routing, DI, and error handling
from fastapi import APIRouter, Depends, HTTPException
# Import Session from sqlalchemy.orm for database session type hinting
from sqlalchemy.orm import Session
# Import get_db to inject database sessions into our routes
from core.database import get_db
# Import User model to interact with the users table in the database
from models.user import User
# Import Pydantic schemas for data validation and serialization
from schemas.user import UserResponse, UserUpdate
# Import Any for generic type hinting where needed
from typing import Any

# Create a router instance with a prefix and tags for Swagger UI grouping
router = APIRouter(prefix="/api/users", tags=["Users"])

# Define a GET endpoint to fetch a user by ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    # Query the database for a user matching the provided ID
    user = db.query(User).filter(User.id == user_id).first()
    # Check if the user exists in the database
    if not user:
        # If no user is found, raise a 404 HTTP exception to inform the client
        raise HTTPException(status_code=404, detail="User not found")
    # Return the user object, which FastAPI will serialize using UserResponse
    return user

# Define a PATCH endpoint to update user details partially
@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)) -> UserResponse:
    # Query the database for the specified user
    user = db.query(User).filter(User.id == user_id).first()
    # If the user does not exist, raise a 404 error
    if not user:
        # Raise HTTP 404 to indicate the requested resource is missing
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert the Pydantic update model to a dictionary, ignoring unset fields to allow partial updates
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Iterate over the provided fields in the update data
    for key, value in update_data.items():
        # Use setattr to dynamically update the user object's attributes
        setattr(user, key, value)
        
    # Commit the transaction to save changes to the database
    db.commit()
    # Refresh the user instance to get the latest state from the database
    db.refresh(user)
    # Return the updated user
    return user

# Define a POST endpoint for users to refill their hearts using gems
@router.post("/{user_id}/refill-hearts", response_model=UserResponse)
def refill_hearts(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    # Query the database to find the user
    user = db.query(User).filter(User.id == user_id).first()
    # If the user doesn't exist, raise 404
    if not user:
        # HTTP 404 since the user ID is invalid
        raise HTTPException(status_code=404, detail="User not found")
        
    # Define the cost to refill hearts to prevent hardcoding magic numbers
    refill_cost: int = 350
    
    # Check if the user has enough gems to pay for the refill
    if user.gems < refill_cost:
        # If not enough gems, raise a 400 Bad Request exception
        raise HTTPException(status_code=400, detail="Not enough gems")
        
    # Check if hearts are already full, so we don't waste the user's gems
    if user.hearts >= user.max_hearts:
        # Raise 400 because the action is unnecessary
        raise HTTPException(status_code=400, detail="Hearts are already full")
        
    # Deduct the cost from the user's gems
    user.gems -= refill_cost
    # Set the user's hearts to their maximum capacity
    user.hearts = user.max_hearts
    
    # Commit the transaction to persist the changes
    db.commit()
    # Refresh the user object from the DB
    db.refresh(user)
    # Return the updated user object
    return user
