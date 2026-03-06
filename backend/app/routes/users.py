from fastapi import APIRouter, Depends, HTTPException
from ..schemas.user import UserInDB, UserUpdate
from ..routes.deps import get_current_user
from ..db.mongodb import get_database
from ..core.security import get_password_hash
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=UserInDB)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserInDB)
async def update_user_me(
    user_in: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    if update_data:
        await db["users"].update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": update_data}
        )
        updated_user = await db["users"].find_one({"_id": ObjectId(current_user["id"])})
        updated_user["id"] = str(updated_user["_id"])
        return updated_user
    return current_user
