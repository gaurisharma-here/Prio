# Prio - Smart Task & Productivity Platform

Prio is a full-stack productivity platform built with FastAPI, React, and MongoDB. It combines task management, analytics, deterministic schedule generation, and AI-assisted productivity insight messaging.

## Features

- **User Authentication**: JWT-based signup/login flow with protected routes.
- **Task Management**: Create, update, complete, and delete tasks with priorities and deadlines.
- **Priority Scoring**: Heuristic task prioritization based on priority and deadline urgency.
- **Deterministic Schedule Generator**: Evenly distributes task hours from today to task deadlines while respecting `available_hours_per_day`.
- **Analytics Dashboard**:
  - Task status breakdown
  - Priority distribution
  - 7-day productivity trends
  - AI Productivity Insights card
- **AI Productivity Insights**:
  - Backend endpoint: `GET /ai/insights`
  - Computes task metrics using rule-based logic
  - Optionally uses Groq to generate a natural-language insight message
- **Dockerized Deployment**: Frontend, backend, and MongoDB run through Docker Compose.

## Tech Stack

- **Backend**: FastAPI, Motor (MongoDB async driver), Pydantic, JWT auth.
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons.
- **Infrastructure**: Docker, Docker Compose, Nginx.

## API Highlights

- `POST /schedule/generate`: Generates day-by-day schedule from pending tasks.
- `GET /analytics/summary`: Returns total/completed/pending stats and priority distribution.
- `GET /analytics/productivity-trends`: Returns last 7 days completion data.
- `GET /ai/insights`: Returns productivity metrics and `ai_message`.

## Configuration (`backend/.env`)

Required basics:
- `MONGODB_URL`
- `DATABASE_NAME`
- `SECRET_KEY`

AI-related:
- `AI_PROVIDER` (`groq` or `gemini`) - currently not required for deterministic scheduling.
- `AI_INSIGHTS_MODE` (`rule_based` or `groq`) - controls how `ai_message` is generated in `/ai/insights`.
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

## Getting Started (Docker)

1. From project root, build and start all services:
```bash
docker compose up -d --build
```

2. Check status:
```bash
docker compose ps
```

3. Access:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

4. View logs:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## Local Development (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Scheduling Logic (Current)

- Uses `datetime.today()` as schedule start.
- For each task: `days_left = max((deadline - today).days, 1)`.
- Splits `estimated_hours` across `days_left`.
- Enforces daily cap via `available_hours_per_day`.
- If a deadline window is too tight, remaining hours spill over into subsequent days.

## Notes

- Insights metrics are deterministic and auditable.
- When `AI_INSIGHTS_MODE=groq`, only the insight text is LLM-generated; core metrics remain rule-based.
- Do not commit real API keys to version control.
