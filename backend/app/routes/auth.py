from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..core.config import settings
from ..core.security import create_access_token, get_password_hash, verify_password
from ..db.mongodb import get_database
from ..schemas.user import UserCreate, Token, UserInDB
from ..models.user import User
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.post("/signup", response_model=UserInDB)
async def signup(user_in: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db["users"].find_one({"$or": [{"email": user_in.email}, {"username": user_in.username}]})
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email or username already exists.",
        )
    user_dict = user_in.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    new_user = await db["users"].insert_one(user_dict)
    created_user = await db["users"].find_one({"_id": new_user.inserted_id})
    created_user["id"] = str(created_user["_id"])
    return created_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db["users"].find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user["username"], expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
