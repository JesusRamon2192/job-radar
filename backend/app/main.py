from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import asyncio

from app.analysis.api_adapter import run_profile_match

app = FastAPI(title="Job Radar API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for jobs
_JOBS_CACHE = {
    "jobs": [],
    "last_updated": None,
    "is_refreshing": False
}

def refresh_jobs_task():
    global _JOBS_CACHE
    _JOBS_CACHE["is_refreshing"] = True
    try:
        data = run_profile_match()
        _JOBS_CACHE["jobs"] = data["jobs"]
        _JOBS_CACHE["last_updated"] = data["last_updated"]
    finally:
        _JOBS_CACHE["is_refreshing"] = False

@app.on_event("startup")
async def startup_event():
    # Trigger an initial fetch if cache is empty
    if not _JOBS_CACHE["jobs"] and not _JOBS_CACHE["is_refreshing"]:
        background_tasks = BackgroundTasks()
        background_tasks.add_task(refresh_jobs_task)
        # We don't await background tasks directly here, we just run it sync for simplicity
        # Or better, run it in a thread
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, refresh_jobs_task)

@app.get("/health")
def health_check():
    return {"status": "ok", "last_updated": _JOBS_CACHE["last_updated"]}

@app.get("/jobs")
def get_jobs(
    company: Optional[str] = None,
    min_score: Optional[int] = None,
    search: Optional[str] = None
):
    jobs = _JOBS_CACHE["jobs"]
    
    if company:
        jobs = [j for j in jobs if j.get("company", "").lower() == company.lower()]
    
    if min_score is not None:
        jobs = [j for j in jobs if j.get("score", 0) >= min_score]
        
    if search:
        s = search.lower()
        jobs = [j for j in jobs if s in j.get("title", "").lower() or s in " ".join(j.get("skills", [])).lower()]
        
    return {
        "jobs": jobs,
        "total": len(jobs),
        "last_updated": _JOBS_CACHE["last_updated"],
        "is_refreshing": _JOBS_CACHE["is_refreshing"]
    }

@app.get("/jobs/top")
def get_top_jobs(limit: int = 10):
    jobs = _JOBS_CACHE["jobs"]
    # ya estan ordenados
    return {"jobs": jobs[:limit]}

@app.post("/refresh")
def refresh_jobs(background_tasks: BackgroundTasks):
    if _JOBS_CACHE["is_refreshing"]:
        return {"status": "already refreshing", "message": "A refresh is already in progress"}
        
    background_tasks.add_task(refresh_jobs_task)
    return {"status": "refreshing", "message": "Refresh task started in background"}