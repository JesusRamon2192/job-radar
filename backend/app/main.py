from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler

from app.analysis.api_adapter import run_profile_match
from app.database.db import get_db, engine, Base, SessionLocal
from app.repositories.job_repository import JobRepository
from app.models.job import JobModel

app = FastAPI(title="DevRadar API")

scheduler = BackgroundScheduler()


# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state for refresh status
_STATE = {
    "is_refreshing": False,
    "last_updated": None
}

def refresh_jobs_task():
    global _STATE
    _STATE["is_refreshing"] = True
    db = SessionLocal()
    try:
        data = run_profile_match()
        repo = JobRepository(db)
        repo.save_all(data["jobs"])
        _STATE["last_updated"] = data["last_updated"]
    except Exception as e:
        print(f"Error refreshing jobs: {e}")
    finally:
        db.close()
        _STATE["is_refreshing"] = False

@app.on_event("startup")
async def startup_event():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Schedule daily job
    scheduler.add_job(refresh_jobs_task, 'cron', hour=0, minute=0)
    scheduler.start()
    
    # Trigger an initial fetch if DB is empty
    db = SessionLocal()
    try:
        repo = JobRepository(db)
        count = db.query(JobModel).count()
        if count == 0 and not _STATE["is_refreshing"]:
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, refresh_jobs_task)
    finally:
        db.close()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()


@app.get("/health")
def health_check():
    return {"status": "ok", "last_updated": _STATE["last_updated"]}

@app.get("/jobs")
def get_jobs(
    company: Optional[str] = None,
    min_score: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = JobRepository(db)
    jobs = repo.get_all_jobs(company=company, min_score=min_score, search=search)
        
    return {
        "jobs": jobs,
        "total": len(jobs),
        "last_updated": _STATE["last_updated"],
        "is_refreshing": _STATE["is_refreshing"]
    }

@app.get("/jobs/top")
def get_top_jobs(limit: int = 10, db: Session = Depends(get_db)):
    repo = JobRepository(db)
    jobs = repo.get_all_jobs(limit=limit)
    return {"jobs": jobs}

@app.post("/refresh")
def refresh_jobs(background_tasks: BackgroundTasks):
    if _STATE["is_refreshing"]:
        return {"status": "already refreshing", "message": "A refresh is already in progress"}
        
    background_tasks.add_task(refresh_jobs_task)
    return {"status": "refreshing", "message": "Refresh task started in background"}