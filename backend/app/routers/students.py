import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user, require_role
from backend.app.models.models import User, StudentProfile, Skill, UserSkill, Job
from backend.app.schemas.student import (
    StudentProfileUpdate, StudentProfileResponse, CVUploadResponse, StudentDashboardSummary
)
from backend.app.schemas.skill import (
    UserSkillItem, AddUserSkill, SkillTestResponse, QuestionItem, TestSubmission, TestResultResponse
)
from backend.app.services.cv_service import process_student_cv
from backend.app.services.test_service import get_or_create_skill_test, grade_skill_test

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/dashboard-summary", response_model=StudentDashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    target_role = profile.target_role if profile and profile.target_role else "Software Engineer"
    
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    
    present_skills = [us for us in user_skills if us.status in ["present", "verified"]]
    suggested_skills = [us for us in user_skills if us.status == "suggested"]
    
    # Calculate counts
    skills_have_count = len(present_skills)
    skills_improve_count = len(suggested_skills)
    other_skills_count = max(2, (len(present_skills) + len(suggested_skills)) // 4)
    
    total_target_skills = skills_have_count + skills_improve_count
    match_pct = int(round((skills_have_count / total_target_skills) * 100)) if total_target_skills > 0 else 70
    
    skills_list = []
    for us in user_skills:
        skills_list.append(UserSkillItem(
            skill_id=us.skill_id,
            name=us.skill.name if us.skill else f"Skill #{us.skill_id}",
            category=us.skill.category if us.skill else "General",
            status=us.status,
            source=us.source
        ))
        
    # Platform job counts
    platform_counts = {
        "LinkedIn": db.query(Job).filter(Job.platform == "LinkedIn").count() or 120,
        "Indeed": db.query(Job).filter(Job.platform == "Indeed").count() or 80,
        "Naukri": db.query(Job).filter(Job.platform == "Naukri").count() or 65,
        "Direct": db.query(Job).filter(Job.platform == "SkillMatrix").count() or 47
    }
    
    return StudentDashboardSummary(
        user_id=current_user.id,
        name=current_user.name,
        target_role=target_role,
        cv_processed=bool(profile and profile.cv_url),
        extracted_skill_count=len(present_skills),
        skills_present_count=skills_have_count,
        skills_to_improve_count=skills_improve_count,
        other_skills_count=other_skills_count,
        overall_match_percentage=match_pct,
        skills=skills_list,
        platform_counts=platform_counts
    )

@router.post("/cv-upload", response_model=CVUploadResponse)
async def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    safe_filename = f"cv_user_{current_user.id}_{int(os.times().system)}{file_ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    result = process_student_cv(db, current_user.id, saved_path)
    
    return CVUploadResponse(
        status="success",
        message="CV processed successfully and skills extracted",
        filename=file.filename,
        extracted_skill_count=result["extracted_count"],
        present_skills=result["present_skills"],
        suggested_skills=result["suggested_skills"]
    )

@router.get("/skills", response_model=List[UserSkillItem])
def get_student_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    return [
        UserSkillItem(
            skill_id=us.skill_id,
            name=us.skill.name if us.skill else f"Skill #{us.skill_id}",
            category=us.skill.category if us.skill else "General",
            status=us.status,
            source=us.source
        )
        for us in user_skills
    ]

@router.post("/skills", response_model=UserSkillItem)
def add_or_update_skill(
    skill_in: AddUserSkill,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find or create skill in master taxonomy
    skill = db.query(Skill).filter(Skill.name.ilike(skill_in.name)).first()
    if not skill:
        skill = Skill(name=skill_in.name, category=skill_in.category or "General")
        db.add(skill)
        db.commit()
        db.refresh(skill)
        
    user_skill = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == skill.id
    ).first()
    
    if user_skill:
        user_skill.status = skill_in.status or "present"
    else:
        user_skill = UserSkill(
            user_id=current_user.id,
            skill_id=skill.id,
            status=skill_in.status or "present",
            source="manual"
        )
        db.add(user_skill)
        
    db.commit()
    db.refresh(user_skill)
    
    return UserSkillItem(
        skill_id=user_skill.skill_id,
        name=skill.name,
        category=skill.category,
        status=user_skill.status,
        source=user_skill.source
    )

@router.get("/test/{skill_id}", response_model=SkillTestResponse)
def get_skill_test(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    test = get_or_create_skill_test(db, skill_id)
    if not test:
        raise HTTPException(status_code=500, detail="Could not generate test for this skill")
        
    # Strip correct_index and explanation before serving to student
    safe_questions = [
        QuestionItem(
            id=q.get("id", i + 1),
            question=q.get("question", ""),
            options=q.get("options", [])
        )
        for i, q in enumerate(test.questions)
    ]
    
    return SkillTestResponse(
        skill_id=skill.id,
        skill_name=skill.name,
        questions=safe_questions
    )

@router.post("/test/{skill_id}/submit", response_model=TestResultResponse)
def submit_skill_test(
    skill_id: int,
    submission: TestSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        result = grade_skill_test(db, current_user.id, skill_id, submission.answers)
        return TestResultResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile", response_model=StudentProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return StudentProfileResponse(
        user_id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        target_role=profile.target_role,
        headline=profile.headline,
        bio=profile.bio,
        cv_url=profile.cv_url,
        education=profile.education or [],
        experience=profile.experience or [],
        projects=profile.projects or []
    )

@router.put("/profile", response_model=StudentProfileResponse)
def update_profile(
    profile_in: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.student_profile
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        
    if profile_in.target_role is not None:
        profile.target_role = profile_in.target_role
    if profile_in.headline is not None:
        profile.headline = profile_in.headline
    if profile_in.bio is not None:
        profile.bio = profile_in.bio
    if profile_in.education is not None:
        profile.education = profile_in.education
    if profile_in.experience is not None:
        profile.experience = profile_in.experience
    if profile_in.projects is not None:
        profile.projects = profile_in.projects
        
    db.commit()
    db.refresh(profile)
    
    return StudentProfileResponse(
        user_id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        target_role=profile.target_role,
        headline=profile.headline,
        bio=profile.bio,
        cv_url=profile.cv_url,
        education=profile.education or [],
        experience=profile.experience or [],
        projects=profile.projects or []
    )
