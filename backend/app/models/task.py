from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from .user import PyObjectId
from bson import ObjectId

class Task(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    status: str = "todo"  # todo, in_progress, completed
    deadline: Optional[datetime] = None
    tags: List[str] = []
    project: Optional[str] = None
    estimated_hours: float = 1.0
    owner_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
