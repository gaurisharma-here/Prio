import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from app.core.security import get_password_hash

async def seed_data():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["productivity_platform"]
    
    # Clear existing data
    await db["users"].delete_many({})
    await db["tasks"].delete_many({})
    
    # Create sample user
    user = {
        "username": "demo",
        "email": "demo@example.com",
        "hashed_password": get_password_hash("password123"),
        "full_name": "Demo User",
        "is_active": True
    }
    user_result = await db["users"].insert_one(user)
    user_id = user_result.inserted_id
    
    # Create sample tasks
    now = datetime.utcnow()
    tasks = [
        {
            "title": "Finish Project Documentation",
            "description": "Complete the final README and API docs",
            "priority": "high",
            "status": "in_progress",
            "deadline": now + timedelta(days=1),
            "tags": ["work", "docs"],
            "project": "Personal",
            "owner_id": user_id,
            "created_at": now - timedelta(days=2),
            "updated_at": now
        },
        {
            "title": "Buy Groceries",
            "description": "Milk, Eggs, Bread, Fruits",
            "priority": "low",
            "status": "todo",
            "deadline": now + timedelta(days=3),
            "tags": ["personal", "home"],
            "project": "Personal",
            "owner_id": user_id,
            "created_at": now - timedelta(days=1),
            "updated_at": now
        },
        {
            "title": "Weekly Team Meeting",
            "description": "Discuss quarterly goals and progress",
            "priority": "medium",
            "status": "completed",
            "deadline": now - timedelta(hours=2),
            "tags": ["work", "meeting"],
            "project": "Work",
            "owner_id": user_id,
            "created_at": now - timedelta(days=5),
            "updated_at": now - timedelta(hours=2)
        }
    ]
    
    await db["tasks"].insert_many(tasks)
    print("Sample data seeded successfully!")
    print("User: demo / password123")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
