from datetime import datetime, timedelta
from collections import Counter
from fastapi import APIRouter, Depends
import httpx
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from ..routes.deps import get_current_user
from ..db.mongodb import get_database
from ..core.config import settings

router = APIRouter()


def _parse_deadline(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", ""))
        except ValueError:
            return None
    return None


@router.get("/insights")
async def get_ai_insights(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    tasks = await db["tasks"].find({"owner_id": ObjectId(current_user["id"])}).to_list(2000)

    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.get("status") == "completed")
    pending_tasks = total_tasks - completed_tasks

    pending = [t for t in tasks if t.get("status") != "completed"]
    priority_counter = Counter((t.get("priority") or "medium").lower() for t in tasks)
    most_common_priority = (
        priority_counter.most_common(1)[0][0] if priority_counter else "none"
    )

    high_priority_tasks = sum(1 for t in pending if (t.get("priority") or "").lower() == "high")

    today = datetime.today().date()
    next_3_days = today + timedelta(days=3)
    upcoming_deadlines = 0
    for task in pending:
        deadline = _parse_deadline(task.get("deadline"))
        if deadline:
            deadline_date = deadline.date()
            if today <= deadline_date <= next_3_days:
                upcoming_deadlines += 1

    estimated_hours_values = []
    for task in pending:
        try:
            estimated_hours_values.append(float(task.get("estimated_hours", 0) or 0))
        except (TypeError, ValueError):
            estimated_hours_values.append(0.0)
    average_estimated_hours = (
        sum(estimated_hours_values) / len(estimated_hours_values) if estimated_hours_values else 0.0
    )

    if pending_tasks == 0:
        rule_based_message = "Great job. You have no pending tasks right now."
    elif high_priority_tasks >= 3 and upcoming_deadlines >= 1:
        rule_based_message = (
            f"You have {high_priority_tasks} high priority tasks due soon. "
            "Consider focusing on them first."
        )
    elif upcoming_deadlines >= 3:
        rule_based_message = (
            f"You have {upcoming_deadlines} upcoming deadlines in the next 3 days. "
            "Time-block focused sessions to avoid last-minute pressure."
        )
    elif pending_tasks > completed_tasks:
        rule_based_message = (
            "Your pending tasks are higher than completed tasks. "
            "Start with a short high-priority task to build momentum."
        )
    else:
        rule_based_message = (
            f"Most of your tasks are marked as {most_common_priority} priority. "
            "Plan your next day by tackling the highest-impact task first."
        )

    ai_message = rule_based_message
    if settings.AI_INSIGHTS_MODE.lower().strip() == "groq" and settings.GROQ_API_KEY:
        try:
            prompt = (
                "Write one short productivity insight (max 28 words), practical and actionable.\n"
                f"total_tasks={total_tasks}, completed_tasks={completed_tasks}, pending_tasks={pending_tasks}, "
                f"high_priority_tasks={high_priority_tasks}, upcoming_deadlines_3_days={upcoming_deadlines}, "
                f"avg_estimated_hours_pending={round(average_estimated_hours, 2)}, "
                f"most_common_priority={most_common_priority}."
            )
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GROQ_MODEL,
                        "temperature": 0.3,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a productivity coach. Return plain text only.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices:
                        text = choices[0].get("message", {}).get("content", "").strip()
                        if text:
                            ai_message = text
        except Exception:
            ai_message = rule_based_message

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "most_common_priority": most_common_priority,
        "high_priority_tasks": high_priority_tasks,
        "upcoming_deadlines": upcoming_deadlines,
        "average_estimated_hours": round(average_estimated_hours, 2),
        "ai_message": ai_message,
    }
