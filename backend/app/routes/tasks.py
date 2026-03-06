from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..schemas.task import TaskCreate, TaskUpdate, TaskInDB
from ..routes.deps import get_current_user
from ..db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=TaskInDB)
async def create_task(
    task_in: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    task_dict = task_in.model_dump()
    task_dict["owner_id"] = ObjectId(current_user["id"])
    task_dict["created_at"] = datetime.utcnow()
    task_dict["updated_at"] = datetime.utcnow()
    
    new_task = await db["tasks"].insert_one(task_dict)
    created_task = await db["tasks"].find_one({"_id": new_task.inserted_id})
    created_task["id"] = str(created_task["_id"])
    created_task["owner_id"] = str(created_task["owner_id"])
    return created_task

@router.get("/", response_model=List[TaskInDB])
async def read_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    project: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"owner_id": ObjectId(current_user["id"])}
    if status:
        query["status"] = {"$regex": f"^{status}$", "$options": "i"}
    if priority:
        query["priority"] = priority
    if project:
        query["project"] = project
        
    tasks = await db["tasks"].find(query).to_list(1000)
    for task in tasks:
        task["id"] = str(task["_id"])
        task["owner_id"] = str(task["owner_id"])
    return tasks

@router.get("/{task_id}", response_model=TaskInDB)
async def read_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    task = await db["tasks"].find_one({"_id": ObjectId(task_id), "owner_id": ObjectId(current_user["id"])})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task["id"] = str(task["_id"])
    task["owner_id"] = str(task["owner_id"])
    return task

@router.put("/{task_id}", response_model=TaskInDB)
async def update_task(
    task_id: str,
    task_in: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    update_data = task_in.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db["tasks"].update_one(
        {"_id": ObjectId(task_id), "owner_id": ObjectId(current_user["id"])},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
        
    updated_task = await db["tasks"].find_one({"_id": ObjectId(task_id)})
    updated_task["id"] = str(updated_task["_id"])
    updated_task["owner_id"] = str(updated_task["owner_id"])
    return updated_task

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db["tasks"].delete_one({"_id": ObjectId(task_id), "owner_id": ObjectId(current_user["id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
