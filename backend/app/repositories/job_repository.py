from sqlalchemy.orm import Session
from sqlalchemy import cast, String, or_, func
from app.models.job import JobModel
from datetime import datetime

class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def clear_all(self):
        self.db.query(JobModel).delete()
        self.db.commit()

    def save_all(self, jobs_data):
        # We can optionally clear all previous jobs or just insert new ones.
        # As per plan, we'll keep it simple: clear old ones and insert new ones on refresh to avoid duplicates if url/title are the same, OR we can just add them.
        # Given "mantendremos todas y actualizaremos" was asked but not answered, 
        # let's just clear all to mimic the old cache behavior properly for now and avoid massive duplication,
        # or we update by URL. Let's do a simple clear and insert for a true 'refresh', or UPSERT.
        # The prompt says: "(Por ahora, la propuesta asume que mantendremos todas...)"
        # Okay, let's try to find by URL and company.
        for job_dict in jobs_data:
            existing = self.db.query(JobModel).filter(
                JobModel.url == job_dict["url"],
                JobModel.title == job_dict["title"],
                JobModel.company == job_dict["company"]
            ).first()
            
            if existing:
                existing.score = job_dict["score"]
                existing.matches = job_dict["matches"]
                existing.skills = job_dict["skills"]
                existing.publication_date = job_dict.get("publication_date")
                existing.modality = job_dict.get("modality")
            else:
                new_job = JobModel(
                    title=job_dict["title"],
                    score=job_dict["score"],
                    matches=job_dict["matches"],
                    skills=job_dict["skills"],
                    url=job_dict["url"],
                    company=job_dict["company"],
                    publication_date=job_dict.get("publication_date"),
                    modality=job_dict.get("modality")
                )
                self.db.add(new_job)
        self.db.commit()

    def get_all_jobs(self, company=None, min_score=None, search=None, modalities=None, skills=None, limit=None):
        query = self.db.query(JobModel)
        
        if company:
            query = query.filter(JobModel.company.ilike(f"%{company}%"))
        
        if min_score is not None:
            query = query.filter(JobModel.score >= min_score)
            
        if search:
            search_term = f"%{search}%"
            # In Postgres, JSON string comparison might need special handling, but we can search in title.
            # For simplicity, we search in title. 
            query = query.filter(JobModel.title.ilike(search_term))
            
        if modalities:
            mod_list = [m.strip().lower() for m in modalities.split(',')]
            query = query.filter(func.lower(JobModel.modality).in_(mod_list))

        if skills:
            skill_list = [s.strip() for s in skills.split(',')]
            conditions = [cast(JobModel.skills, String).ilike(f'%"{skill}"%') for skill in skill_list]
            query = query.filter(or_(*conditions))
            
        query = query.order_by(JobModel.score.desc())
        
        if limit:
            query = query.limit(limit)
            
        jobs = query.all()
        # Convert back to dict for the API response
        return [
            {
                "title": j.title,
                "score": j.score,
                "matches": j.matches,
                "skills": j.skills,
                "url": j.url,
                "company": j.company,
                "publication_date": j.publication_date,
                "modality": j.modality,
                "created_at": j.created_at.isoformat() if j.created_at else None
            } for j in jobs
        ]