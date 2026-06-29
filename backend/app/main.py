from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from starlette.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from zoneinfo import ZoneInfo
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.analysis.api_adapter import run_profile_match
from app.database.db import get_db, engine, Base, SessionLocal
from app.models.job import JobModel
from app.models.user import UserModel
from app.routers import auth, admin
from app.services.cache_service import CacheService
from app.services.matcher_service import MatcherService
from app.utils.security import get_current_user, get_current_user_optional

app = FastAPI(title="DevRadar API")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

scheduler = BackgroundScheduler()

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)

# In-memory state for refresh status
_STATE = {
    "is_refreshing": False
}

def refresh_jobs_task():
    global _STATE
    _STATE["is_refreshing"] = True
    db = SessionLocal()
    try:
        from app.repositories.job_repository import JobRepository
        result = run_profile_match(force_refresh=True)
        repo = JobRepository(db)
        repo.save_all(result["jobs"])
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
    scheduler.add_job(
        refresh_jobs_task, 
        'cron', 
        hour=0, 
        minute=0, 
        timezone=ZoneInfo("America/Mexico_City")
    )
    scheduler.start()
    
    db = SessionLocal()
    try:
        # Create mock PRO user if not exists
        user = db.query(UserModel).filter(UserModel.email == "jesus.ramon2192@gmail.com").first()
        if not user:
            from app.utils.security import get_password_hash
            default_profile = {
                "categories": {
                    "Cloud Computing": ["Amazon Web Services", "AWS", "Google Cloud Platform", "GCP", "Microsoft Azure", "Azure", "Cloud Native"],
                    "Containers": ["Docker", "Docker Compose", "Kubernetes", "K8s", "EKS", "AKS", "Helm"],
                    "DevOps & CI/CD": ["DevOps", "Linux", "CI/CD", "GitLab", "Git", "GitHub Actions", "Jenkins", "Terraform", "Ansible", "Bash"],
                    "Artificial Intelligence": ["OpenAI API", "ChatGPT", "AI Agents", "Prompt Engineering", "Machine Learning", "LLMs", "LangChain"],
                    "Backend": ["Python", "Node.js", "Java", "PostgreSQL", "REST API", "GraphQL", "MongoDB", "Redis", "MySQL", "Spring Boot", "Express", "Django", "FastAPI", "C#", ".NET", "Go"],
                    "Observability": ["New Relic", "Grafana", "Prometheus", "Datadog", "Splunk", "ELK"],
                    "Frontend": ["JavaScript", "HTML", "CSS", "React", "TypeScript", "Tailwind CSS", "Vue.js", "Angular", "Next.js", "Redux"]
                },
                "weights": {
                    "Cloud Computing": 80,
                    "Containers": 85,
                    "DevOps & CI/CD": 80,
                    "Artificial Intelligence": 75,
                    "Backend": 85,
                    "Observability": 70,
                    "Frontend": 85
                }
            }
            new_user = UserModel(
                email="jesus.ramon2192@gmail.com", 
                hashed_password=get_password_hash("admin123"), 
                is_pro=True,
                profile_config=default_profile
            )
            db.add(new_user)
            db.commit()
            print("Mock PRO user inserted")

        # Initial fetch if cache is empty
        if not CacheService.get_raw_jobs("epam") and not _STATE["is_refreshing"]:
            loop = asyncio.get_event_loop()
            loop.run_in_executor(None, refresh_jobs_task)
    finally:
        db.close()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get("/health")
def health_check():
    return {"status": "ok", "last_updated": CacheService.get_last_updated()}

@app.get("/jobs")
@limiter.limit("60/minute")
def get_jobs(
    request: Request,
    company: Optional[str] = None,
    min_score: Optional[int] = None,
    search: Optional[str] = None,
    modalities: Optional[str] = None,
    skills: Optional[str] = None,
    current_user: Optional[UserModel] = Depends(get_current_user_optional)
):
    raw_jobs = []
    sources = ["epam", "softek", "accenture", "globant", "ibm", "greenhouse", "axity"]
    for source in sources:
        jobs = CacheService.get_raw_jobs(source)
        if jobs:
            raw_jobs.extend(jobs)
            
    matcher = MatcherService()
    default_anon_profile = {
        "categories": {
            "Frontend": ["javascript", "react", "html", "css", "typescript", "angular", "vue"],
            "Backend": ["python", "java", "node.js", "c#", "go", "ruby", "php", "sql", "postgresql", "mysql"],
            "Cloud & DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "linux", "ci/cd", "jenkins", "terraform"],
            "Data & AI": ["machine learning", "data engineering", "spark", "pandas", "python", "sql"]
        },
        "weights": {
            "Frontend": 70,
            "Backend": 90,
            "Cloud & DevOps": 65,
            "Data & AI": 50
        }
    }
    profile_config = current_user.profile_config if current_user else default_anon_profile
    
    scored_jobs = []
    mod_list = [m.strip().lower() for m in modalities.split(',')] if modalities else []
    skill_list = [s.strip().lower() for s in skills.split(',')] if skills else []

    for job in raw_jobs:
        title = job.get("title") or job.get("name", "N/A")
        
        # Pre-filter by company and search
        if company and company.lower() not in job.get("company", "").lower():
            continue
        if search and search.lower() not in title.lower():
            continue
            
        # Modality filter
        job_modality = job.get("modality", "").lower()
        if mod_list and job_modality not in mod_list:
            continue
            
        # Skills filter
        job_skills = [s.lower() for s in job.get("skills", [])]
        if skill_list and not any(s in job_skills for s in skill_list):
            continue

        result = matcher.score(job, profile_config)
        
        if min_score is not None and result["score"] < min_score:
            continue
            
        scored_jobs.append({
            "title": title,
            "score": result["score"],
            "matches": result["matches"],
            "category_breakdown": result.get("category_breakdown", {}),
            "skills": job.get("skills", []),
            "url": job.get("url", "N/A"),
            "company": job.get("company", "Desconocida"),
            "publication_date": job.get("publication_date"),
            "modality": job.get("modality", "Unknown")
        })
        
    scored_jobs.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "jobs": scored_jobs,
        "total": len(scored_jobs),
        "last_updated": CacheService.get_last_updated(),
        "is_refreshing": _STATE["is_refreshing"]
    }

@app.post("/refresh")
@limiter.limit("5/hour")
def refresh_jobs(request: Request, background_tasks: BackgroundTasks, current_user: UserModel = Depends(get_current_user)):
    if _STATE["is_refreshing"]:
        return {"status": "already refreshing", "message": "A refresh is already in progress"}
        
    background_tasks.add_task(refresh_jobs_task)
    return {"status": "refreshing", "message": "Refresh task started in background"}