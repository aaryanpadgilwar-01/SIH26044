from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.core.deps import get_current_user
from backend.app.models.models import User, StudentProfile, Company, Institution
from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    role = user_in.role.lower()
    if role not in ["student", "industry", "institution"]:
        role = "student"
    
    # Create user
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create corresponding profile
    if role == "student":
        student_profile = StudentProfile(
            user_id=user.id,
            target_role=user_in.target_role or "Software Engineer",
            headline=f"Aspiring {user_in.target_role or 'Software Engineer'}"
        )
        db.add(student_profile)
    elif role == "industry":
        company = Company(
            user_id=user.id,
            name=user_in.company_name or f"{user.name}'s Organization",
            description="Leading technology enterprise empowering talent."
        )
        db.add(company)
    elif role == "institution":
        institution = Institution(
            user_id=user.id,
            name=user_in.institution_name or f"{user.name} Institute of Technology",
            location="India"
        )
        db.add(institution)
    
    db.commit()
    
    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role
    )

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = {}
    if current_user.role == "student" and current_user.student_profile:
        profile_data = {
            "target_role": current_user.student_profile.target_role,
            "headline": current_user.student_profile.headline,
            "cv_url": current_user.student_profile.cv_url
        }
    elif current_user.role == "industry" and current_user.company:
        profile_data = {
            "company_id": current_user.company.id,
            "company_name": current_user.company.name,
            "location": current_user.company.location
        }
    elif current_user.role == "institution" and current_user.institution:
        profile_data = {
            "institution_id": current_user.institution.id,
            "institution_name": current_user.institution.name
        }
    
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "profile": profile_data
    }
