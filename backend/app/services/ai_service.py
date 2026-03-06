from datetime import datetime, timedelta
from typing import List

def calculate_task_score(task: dict) -> float:
    # Priority mapping
    priority_map = {"high": 3, "medium": 2, "low": 1}
    priority_score = priority_map.get(task.get("priority", "medium"), 2)
    
    # Deadline score (closer deadline = higher score)
    deadline_score = 0
    if task.get("deadline"):
        deadline = task["deadline"]
        if isinstance(deadline, str):
            deadline = datetime.fromisoformat(deadline.replace("Z", ""))
        
        now = datetime.utcnow()
        days_left = (deadline - now).days
        
        if days_left < 0:
            deadline_score = 5 # Overdue
        elif days_left < 1:
            deadline_score = 4 # Due today
        elif days_left < 3:
            deadline_score = 3
        elif days_left < 7:
            deadline_score = 2
        else:
            deadline_score = 1
            
    # Simple heuristic-based score
    total_score = (priority_score * 0.6) + (deadline_score * 0.4)
    return total_score

def prioritize_tasks(tasks: List[dict]) -> List[dict]:
    # Add score to each task and sort
    for task in tasks:
        task["ai_priority_score"] = calculate_task_score(task)
    
    return sorted(tasks, key=lambda x: x["ai_priority_score"], reverse=True)


async def generate_schedule(tasks: List[dict], available_hours_per_day: float) -> dict:
    """
    Generate a day-by-day schedule by spreading task hours from today to each deadline.
    
    Args:
        tasks: List of tasks with title, deadline, priority, estimated_hours
        available_hours_per_day: User's available hours per day
    
    Returns:
        Schedule dict with tasks organized by day
    """
    if available_hours_per_day <= 0:
        raise ValueError("available_hours_per_day must be greater than 0")

    today = datetime.today().date()
    daily_plan = {}
    all_dates = {today}

    def parse_deadline(value):
        if not value:
            return today
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace("Z", "")).date()
        return today

    def ensure_day(day_date):
        if day_date not in daily_plan:
            daily_plan[day_date] = {"tasks": [], "total_hours": 0.0}
        all_dates.add(day_date)

    def add_hours(day_date, title, hours_to_add):
        if hours_to_add <= 0:
            return 0.0
        ensure_day(day_date)
        current_total = daily_plan[day_date]["total_hours"]
        remaining_capacity = max(available_hours_per_day - current_total, 0.0)
        allocated = min(hours_to_add, remaining_capacity)
        if allocated <= 0:
            return 0.0

        task_entries = daily_plan[day_date]["tasks"]
        existing = next((t for t in task_entries if t["task_title"] == title), None)
        if existing:
            existing["hours"] += allocated
        else:
            task_entries.append({"task_title": title, "hours": allocated})
        daily_plan[day_date]["total_hours"] += allocated
        return allocated

    # Prioritize high urgency tasks first so earlier days are allocated sensibly.
    sorted_tasks = prioritize_tasks(tasks)

    for task in sorted_tasks:
        title = task.get("title", "Untitled Task")
        estimated_hours = float(task.get("estimated_hours", 0) or 0)
        if estimated_hours <= 0:
            continue

        deadline_date = parse_deadline(task.get("deadline"))
        days_left = max((deadline_date - today).days, 1)
        remaining = estimated_hours

        # Evenly distribute from today until deadline window.
        for day_offset in range(days_left):
            schedule_date = today + timedelta(days=day_offset)
            remaining_days = days_left - day_offset
            target_for_day = remaining / remaining_days
            allocated = add_hours(schedule_date, title, target_for_day)
            remaining -= allocated

        # If deadlines are too tight for daily capacity, spill over to following days.
        spill_offset = days_left
        while remaining > 1e-6 and spill_offset < days_left + 60:
            schedule_date = today + timedelta(days=spill_offset)
            allocated = add_hours(schedule_date, title, remaining)
            remaining -= allocated
            spill_offset += 1

    if not daily_plan:
        ensure_day(today)

    start_date = today
    end_date = max(all_dates) if all_dates else today
    total_days = (end_date - start_date).days + 1

    schedule = []
    for i in range(total_days):
        current_date = start_date + timedelta(days=i)
        day_info = daily_plan.get(current_date, {"tasks": [], "total_hours": 0.0})
        tasks_for_day = [
            {
                "task_title": t["task_title"],
                "hours": round(float(t["hours"]), 2),
            }
            for t in day_info["tasks"]
            if t["hours"] > 0
        ]
        schedule.append(
            {
                "day": i + 1,
                "date": current_date.strftime("%Y-%m-%d"),
                "tasks": tasks_for_day,
                "total_hours": round(float(day_info["total_hours"]), 2),
            }
        )

    return {"schedule": schedule}
