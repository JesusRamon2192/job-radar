from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.db import Base

class CompanyDailyStatsModel(Base):
    __tablename__ = "company_daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, index=True)
    snapshot_date = Column(DateTime, index=True)
    
    active_jobs = Column(Integer, default=0)
    new_jobs = Column(Integer, default=0)
    closed_jobs = Column(Integer, default=0)
    
    remote_jobs = Column(Integer, default=0)
    hybrid_jobs = Column(Integer, default=0)
    onsite_jobs = Column(Integer, default=0)
    
    junior_jobs = Column(Integer, default=0)
    mid_jobs = Column(Integer, default=0)
    senior_jobs = Column(Integer, default=0)
    lead_jobs = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
