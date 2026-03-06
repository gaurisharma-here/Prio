from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..services.ai_service import generate_schedule
from ..routes.deps import get_current_user
from ..db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

class ScheduleRequest(BaseModel):
    available_hours_per_day: float

@router.post("/generate")
async def generate_ai_schedule(
    request: ScheduleRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Generate an AI-powered schedule for pending tasks.
    """
    if request.available_hours_per_day <= 0:
        raise HTTPException(status_code=400, detail="Available hours per day must be greater than 0")
    
    # Fetch pending tasks for the current user
    tasks = await db["tasks"].find({
        "owner_id": ObjectId(current_user["id"]),
        "status": {"$ne": "completed"}
    }).to_list(1000)
    
    if not tasks:
        raise HTTPException(status_code=400, detail="No pending tasks to schedule")
    
    try:
        schedule = await generate_schedule(tasks, request.available_hours_per_day)
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating schedule: {str(e)}")
