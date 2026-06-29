from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.db import get_db
from app.models.user import UserModel
from app.utils.security import get_admin_user
from app.worker import send_user_email_task

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_admin_user)],
)

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(UserModel).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "is_active": u.is_active,
            "is_pro": u.is_pro,
            "is_admin": u.is_admin,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.post("/users/{user_id}/force-email")
def force_email_send(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Cannot send email to inactive user")
        
    # Queue the celery task directly
    send_user_email_task.delay(user_id)
    
    return {"status": "success", "message": f"Email task queued for {user.email}"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    
    return {"status": "success", "message": f"User {user.email} deleted successfully"}
