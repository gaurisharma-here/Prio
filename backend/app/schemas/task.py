from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    status: str = "todo"
    deadline: Optional[datetime] = None
    tags: List[str] = []
    project: Optional[str] = None
    estimated_hours: float = 1.0

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    tags: Optional[List[str]] = None
    project: Optional[str] = None
    estimated_hours: Optional[float] = None

class TaskInDB(TaskBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
