from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user, require_role, require_industry
from backend.app.models.models import User, Company, Job, JobRequiredSkill, Skill, Application
from backend.app.schemas.industry import CompanyProfileUpdate, CompanyProfileResponse, CandidateMatchItem
from backend.app.schemas.job import JobCreate, JobResponse
from backend.app.services.matching_engine import get_candidates_for_job

router = APIRouter(prefix="/industry", tags=["industry"], dependencies=[Depends(require_industry)])

@router.get("/company", response_model=CompanyProfileResponse)
def get_company_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    company = current_user.company
    if not company:
        company = Company(
            user_id=current_user.id,
            name=f"{current_user.name}'s Tech Labs",
            description="Innovative technology company building the future.",
            location="Bengaluru, India"
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
    return CompanyProfileResponse(
        id=company.id,
        user_id=company.user_id,
        name=company.name,
        description=company.description or "",
        location=company.location or "Bengaluru, India",
        website=company.website,
        logo_url=company.logo_url
    )

@router.put("/company", response_model=CompanyProfileResponse)
def update_company_profile(
    company_in: CompanyProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    company = current_user.company
    if not company:
        company = Company(user_id=current_user.id, name=company_in.name or "Tech Enterprise")
        db.add(company)
        
    if company_in.name is not None:
        company.name = company_in.name
    if company_in.description is not None:
        company.description = company_in.description
    if company_in.location is not None:
        company.location = company_in.location
    if company_in.website is not None:
        company.website = company_in.website
    if company_in.logo_url is not None:
        company.logo_url = company_in.logo_url
        
    db.commit()
    db.refresh(company)
    return CompanyProfileResponse(
        id=company.id,
        user_id=company.user_id,
        name=company.name,
        description=company.description or "",
        location=company.location or "Bengaluru, India",
        website=company.website,
        logo_url=company.logo_url
    )

@router.get("/jobs")
def list_company_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    company = current_user.company
    company_id = company.id if company else None
    
    # Return company jobs, or sample jobs if none posted yet
    jobs = db.query(Job).filter(Job.company_id == company_id).all() if company_id else []
    if not jobs:
        # Also include sample jobs created for demo
        jobs = db.query(Job).limit(8).all()
        
    results = []
    for j in jobs:
        app_count = db.query(Application).filter(Application.job_id == j.id).count()
        skills = [req.skill.name for req in j.required_skills if req.skill]
        results.append({
            "id": j.id,
            "title": j.title,
            "company_name": j.company_name,
            "location": j.location,
            "job_type": j.job_type,
            "description": j.description,
            "posted_at": j.posted_at,
            "applicant_count": app_count,
            "skills": skills
        })
    return results

@router.post("/jobs")
def post_job(
    job_in: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    company = current_user.company
    company_name = company.name if company else current_user.name
    company_id = company.id if company else None
    
    new_job = Job(
        company_id=company_id,
        company_name=company_name,
        title=job_in.title,
        location=job_in.location,
        job_type=job_in.job_type,
        description=job_in.description,
        source="internal",
        platform=job_in.platform or "SkillMatrix",
        posted_at=datetime.now(timezone.utc)
    )
    db.add(new_job)
    db.flush()
    
    for s_name in job_in.skills:
        skill = db.query(Skill).filter(Skill.name.ilike(s_name.strip())).first()
        if not skill:
            skill = Skill(name=s_name.strip(), category="General")
            db.add(skill)
            db.flush()
        db.add(JobRequiredSkill(
            job_id=new_job.id,
            skill_id=skill.id,
            importance_weight=1.2
        ))
        
    db.commit()
    db.refresh(new_job)
    return {"status": "success", "message": "Job posted successfully", "job_id": new_job.id}

@router.get("/jobs/{job_id}/candidates", response_model=List[CandidateMatchItem])
def get_job_candidates(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidates = get_candidates_for_job(db, job_id)
    return [CandidateMatchItem(**c) for c in candidates]

@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    status_update: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    new_status = status_update.get("status", "reviewed")
    app.status = new_status
    db.commit()
    return {"status": "success", "application_id": app.id, "new_status": app.status}
