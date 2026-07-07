import os
from celery import Celery
from celery.schedules import crontab
from datetime import datetime, timedelta
from app.database.db import SessionLocal
from app.models.user import UserModel
from app.models.job import JobModel
from app.services.email_service import EmailService

# Initialize Celery
redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery(
    "job_radar_worker",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Mexico_City",
    enable_utc=True,
)

# Schedule for daily emails at 8:00 AM
celery_app.conf.beat_schedule = {
    "send-daily-jobs-email": {
        "task": "app.worker.send_daily_emails_task",
        "schedule": crontab(hour=8, minute=0),
    }
}

@celery_app.task
def send_daily_emails_task():
    """
    Task triggered at 8 AM.
    It fetches all active users and delegates the email sending
    for each user to another background task for scalability.
    """
    db = SessionLocal()
    try:
        active_users = db.query(UserModel).filter(UserModel.is_active == True).all()
        for user in active_users:
            # We delay the individual email sending task so it scales horizontally
            send_user_email_task.delay(user.id)
    finally:
        db.close()

@celery_app.task
def send_user_email_task(user_id: int):
    """
    Task to send an email to a specific user.
    """
    db = SessionLocal()
    try:
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            return

        profile_config = user.profile_config or {}
        mailing_prefs = profile_config.get("mailing_preferences", {})
        
        # Check if mailing is enabled (default is True if not explicitly set)
        if not mailing_prefs.get("enabled", True):
            return

        # Fetch jobs from the last 24 hours
        yesterday = datetime.utcnow() - timedelta(days=1)
        new_jobs = db.query(JobModel).filter(JobModel.created_at >= yesterday).all()

        if new_jobs:
            # Filter jobs by keywords if they exist
            keywords = mailing_prefs.get("keywords_include", [])
            if keywords:
                filtered_jobs = []
                for job in new_jobs:
                    # check if any keyword is in title or skills
                    title_lower = (job.title or "").lower()
                    skills_lower = [s.lower() for s in (job.skills or [])]
                    
                    match_found = False
                    for kw in keywords:
                        kw_lower = kw.lower()
                        if kw_lower in title_lower or any(kw_lower in s for s in skills_lower):
                            match_found = True
                            break
                    
                    if match_found:
                        filtered_jobs.append(job)
                
                new_jobs = filtered_jobs

            if new_jobs:
                email_service = EmailService()
                email_service.send_daily_jobs_email(user, new_jobs)
    finally:
        db.close()
