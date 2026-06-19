from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime
from app.database.db import Base

class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    score = Column(Integer)
    matches = Column(JSON)
    skills = Column(JSON)
    url = Column(String)
    company = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)