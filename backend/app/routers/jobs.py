from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import User, Job, Application, JobRequiredSkill, Skill
from backend.app.schemas.job import JobResponse, ApplicationResponse, ApplicationCreate
from backend.app.services.matching_engine import get_jobs_for_student, compute_match_score

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/recommended", response_model=List[JobResponse])
def get_recommended_jobs(
    query: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    jobs_data = get_jobs_for_student(
        db=db,
        student_id=current_user.id,
        query=query,
        location=location,
        job_type=job_type,
        platform=platform
    )
    return [JobResponse(**j) for j in jobs_data]

@router.get("", response_model=List[JobResponse])
def list_jobs(
    query: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_recommended_jobs(
        query=query,
        location=location,
        job_type=job_type,
        platform=platform,
        current_user=current_user,
        db=db
    )

@router.get("/my-applications", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.student_id == current_user.id).order_by(Application.applied_at.desc()).all()
    res = []
    for a in apps:
        res.append(ApplicationResponse(
            id=a.id,
            job_id=a.job_id,
            job_title=a.job.title if a.job else "Position",
            company_name=a.job.company_name if a.job else "Company",
            location=a.job.location if a.job else "Remote",
            match_score=a.match_score,
            status=a.status,
            applied_at=a.applied_at
        ))
    return res

@router.post("/{job_id}/apply", response_model=ApplicationResponse)
def apply_to_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    existing_app = db.query(Application).filter(
        Application.job_id == job_id,
        Application.student_id == current_user.id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this position")
        
    # Calculate match score at submission time
    student_skills = {us.skill_id: us.status for us in current_user.user_skills if us.status in ["present", "verified"]}
    score, _ = compute_match_score(student_skills, job.required_skills)
    
    app = Application(
        job_id=job_id,
        student_id=current_user.id,
        match_score=float(score),
        status="applied",
        applied_at=datetime.now(timezone.utc)
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    
    return ApplicationResponse(
        id=app.id,
        job_id=job.id,
        job_title=job.title,
        company_name=job.company_name,
        location=job.location,
        match_score=app.match_score,
        status=app.status,
        applied_at=app.applied_at
    )
