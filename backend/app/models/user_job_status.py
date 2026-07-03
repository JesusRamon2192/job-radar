from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
import enum
from app.database.db import Base

class JobStatusEnum(str, enum.Enum):
    VIEWED = "VIEWED"
    SAVED = "SAVED"
    APPLIED = "APPLIED"
    SENT = "SENT"

class UserJobStatusModel(Base):
    __tablename__ = "user_job_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(String, nullable=False, index=True)
    status = Column(SQLEnum(JobStatusEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uix_user_job"),
    )
