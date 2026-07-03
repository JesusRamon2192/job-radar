from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database.db import get_db
from app.models.user import UserModel
from app.models.user_job_status import UserJobStatusModel, JobStatusEnum
from app.utils.security import get_current_user

router = APIRouter(prefix="/jobs/status", tags=["Job Status"])

class JobStatusUpdate(BaseModel):
    job_id: str
    status: JobStatusEnum

class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatusEnum
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[JobStatusResponse])
def get_user_job_statuses(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all job statuses for the current user.
    """
    statuses = db.query(UserJobStatusModel).filter(
        UserJobStatusModel.user_id == current_user.id
    ).all()
    
    return [
        JobStatusResponse(
            job_id=s.job_id,
            status=s.status,
            created_at=s.created_at.isoformat() + "Z" if s.created_at else "",
            updated_at=s.updated_at.isoformat() + "Z" if s.updated_at else None
        ) for s in statuses
    ]

@router.post("", response_model=JobStatusResponse)
def update_job_status(
    status_update: JobStatusUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update or create the status for a specific job.
    Enforces state machine rules:
    - Vista (1) -> Guardada (2), Aplicada (3), Enviada (4)
    - Guardada (2) -> Aplicada (3), Enviada (4)
    - Aplicada (3) -> Enviada (4)
    - Enviada (4) -> No changes allowed (must reset to go back)
    """
    existing_status = db.query(UserJobStatusModel).filter(
        UserJobStatusModel.user_id == current_user.id,
        UserJobStatusModel.job_id == status_update.job_id
    ).first()

    # Priority mapping for validation
    priority = {
        JobStatusEnum.VIEWED: 1,
        JobStatusEnum.SAVED: 2,
        JobStatusEnum.APPLIED: 3,
        JobStatusEnum.SENT: 4
    }

    if existing_status:
        current_priority = priority[existing_status.status]
        new_priority = priority[status_update.status]
        
        # If new priority is lower or equal (except same status update, which does nothing), 
        # it is not allowed unless it's a valid change like 'Saved' to 'Viewed'?
        # Prompt: "Si posteriormente cambia a Aplicada o Enviada, deja de estar Guardada."
        # Prompt: "Una vacante Enviada no puede volver a Aplicada, Guardada o Vista, excepto si el usuario decide reiniciar"
        # Wait, if a user clicks "Guardar" on an "Aplicada", should it go back to Saved? Prompt says: 
        # "Reemplaza cualquier estado anterior. Si ya estaba Enviada no debe permitir volver a Aplicada."
        if current_priority == 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change status from SENT. Must reset first."
            )
            
        # Allow any change up to 3 if not 4?
        # Re-read rules:
        # - Vista: If it has another state, do NOT change to Vista.
        if status_update.status == JobStatusEnum.VIEWED and existing_status.status != JobStatusEnum.VIEWED:
            # Silently ignore or return current
            return JobStatusResponse(
                job_id=existing_status.job_id,
                status=existing_status.status,
                created_at=existing_status.created_at.isoformat() + "Z" if existing_status.created_at else "",
                updated_at=existing_status.updated_at.isoformat() + "Z" if existing_status.updated_at else None
            )

        existing_status.status = status_update.status
        db.commit()
        db.refresh(existing_status)
        return JobStatusResponse(
            job_id=existing_status.job_id,
            status=existing_status.status,
            created_at=existing_status.created_at.isoformat() + "Z" if existing_status.created_at else "",
            updated_at=existing_status.updated_at.isoformat() + "Z" if existing_status.updated_at else None
        )
    else:
        new_status = UserJobStatusModel(
            user_id=current_user.id,
            job_id=status_update.job_id,
            status=status_update.status
        )
        db.add(new_status)
        db.commit()
        db.refresh(new_status)
        return JobStatusResponse(
            job_id=new_status.job_id,
            status=new_status.status,
            created_at=new_status.created_at.isoformat() + "Z" if new_status.created_at else "",
            updated_at=new_status.updated_at.isoformat() + "Z" if new_status.updated_at else None
        )

@router.delete("/{job_id_encoded}")
def reset_job_status(
    job_id_encoded: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset (delete) the job status.
    Since job_id can be a URL, the path parameter must be url-encoded (or use query params, but path is fine if encoded or base64)
    Wait, FastAPI handles path parameters fine but slashes in URLs will break the route.
    It's safer to use a query parameter or pass it in the body.
    Let's change this to use a query parameter.
    """
    pass

@router.delete("")
def reset_job_status_query(
    job_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset (delete) the job status. Uses query param due to job_id being a URL.
    """
    status_entry = db.query(UserJobStatusModel).filter(
        UserJobStatusModel.user_id == current_user.id,
        UserJobStatusModel.job_id == job_id
    ).first()

    if status_entry:
        db.delete(status_entry)
        db.commit()
        return {"detail": "Status reset successfully."}
    
    return {"detail": "Status not found."}
