from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.database.db import get_db
from app.models.user import UserModel
from app.utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_reset_password_token,
    verify_reset_password_token
)
from app.services.email_service import EmailService

email_service = EmailService()

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_pro: bool
    profile_config: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/register", response_model=Token)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # default comprehensive profile
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
        },
        "mailing_preferences": {
            "enabled": True,
            "keywords_include": []
        }
    }
    
    user = UserModel(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        profile_config=default_profile
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

class ProfileUpdate(BaseModel):
    profile_config: Dict[str, Any]

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    profile_update: ProfileUpdate, 
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.profile_config = profile_update.profile_config
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password")
def change_password(
    password_data: ChangePassword,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
        
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == request.email).first()
    # We don't want to reveal if a user exists or not for security, 
    # so we return a success message regardless
    if user:
        token = create_reset_password_token(user.email)
        email_service.send_reset_password_email(user.email, token)
    
    return {"message": "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_reset_password_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El token es inválido o ha expirado."
        )
        
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no encontrado."
        )
        
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Contraseña restablecida correctamente."}
