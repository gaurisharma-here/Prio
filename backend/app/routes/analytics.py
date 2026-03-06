from fastapi import APIRouter, Depends
from typing import List, Dict
from ..routes.deps import get_current_user
from ..db.mongodb import get_database
from ..services.ai_service import prioritize_tasks
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
async def get_task_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"owner_id": ObjectId(current_user["id"])}
    tasks = await db["tasks"].find(query).to_list(1000)
    
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t["status"] == "completed"])
    pending_tasks = total_tasks - completed_tasks
    
    # Group by priority
    priority_stats = {}
    for t in tasks:
        p = t.get("priority", "medium")
        priority_stats[p] = priority_stats.get(p, 0) + 1
        
    return {
        "total": total_tasks,
        "completed": completed_tasks,
        "pending": pending_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "priority_distribution": priority_stats
    }

@router.get("/prioritized-tasks")
async def get_prioritized_tasks(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"owner_id": ObjectId(current_user["id"]), "status": {"$ne": "completed"}}
    tasks = await db["tasks"].find(query).to_list(1000)
    
    for task in tasks:
        task["id"] = str(task.pop("_id"))
        task["owner_id"] = str(task["owner_id"])
        
    prioritized = prioritize_tasks(tasks)
    return prioritized

@router.get("/productivity-trends")
async def get_productivity_trends(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Completion trends for last 7 days
    now = datetime.utcnow()
    last_7_days = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
    
    query = {
        "owner_id": ObjectId(current_user["id"]),
        "status": "completed",
        "updated_at": {"$gte": now - timedelta(days=7)}
    }
    tasks = await db["tasks"].find(query).to_list(1000)
    
    trends = {day: 0 for day in last_7_days}
    for t in tasks:
        day = t["updated_at"].strftime("%Y-%m-%d")
        if day in trends:
            trends[day] += 1
            
    return [{"day": day, "completed_count": count} for day, count in trends.items()]
