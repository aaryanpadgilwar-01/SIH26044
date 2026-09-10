import json
import os
from typing import List, Dict, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import Job, JobRequiredSkill, Skill
from backend.app.services.cv_service import extract_skills_with_nlp

FIXTURE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "fixtures",
    "external_jobs.json"
)

def fetch_jobs_from_source(source: str = "all", query: Optional[str] = None, location: Optional[str] = None) -> List[Dict]:
    """
    Clean interface for aggregating external jobs.
    Currently backed by sample JSON fixtures; can easily be swapped with live external APIs
    (e.g., Adzuna, LinkedIn, Jooble) without changing application callers.
    """
    if not os.path.exists(FIXTURE_PATH):
        return []
        
    with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
        jobs = json.load(f)
        
    filtered = []
    for job in jobs:
        if source != "all" and job.get("platform", "").lower() != source.lower():
            continue
        if query and (query.lower() not in job.get("title", "").lower() and query.lower() not in job.get("company_name", "").lower()):
            continue
        if location and location.lower() not in job.get("location", "").lower():
            continue
        filtered.append(job)
        
    return filtered

def sync_external_jobs_to_db(db: Session) -> int:
    """
    Syncs external mock jobs into the database and tags them with required skills using spaCy NLP.
    """
    external_jobs = fetch_jobs_from_source()
    all_skills = db.query(Skill).all()
    skills_by_name = {s.name.lower(): s for s in all_skills}
    
    synced_count = 0
    for job_data in external_jobs:
        # Check if job already exists by company and title
        existing = db.query(Job).filter(
            Job.company_name == job_data["company_name"],
            Job.title == job_data["title"]
        ).first()
        
        if not existing:
            new_job = Job(
                company_name=job_data["company_name"],
                title=job_data["title"],
                location=job_data.get("location", "Remote"),
                job_type=job_data.get("job_type", "Full-time"),
                description=job_data.get("description", ""),
                source=job_data.get("source", "external_api"),
                platform=job_data.get("platform", "LinkedIn"),
                posted_at=datetime.now(timezone.utc)
            )
            db.add(new_job)
            db.flush()
            
            # Map skills: check explicit required_skills first, or extract with NLP from description
            explicit_reqs = job_data.get("required_skills", [])
            if explicit_reqs:
                for req in explicit_reqs:
                    s_obj = skills_by_name.get(req["name"].lower())
                    if s_obj:
                        db.add(JobRequiredSkill(
                            job_id=new_job.id,
                            skill_id=s_obj.id,
                            importance_weight=req.get("weight", 1.0)
                        ))
            else:
                # Use spaCy NLP extraction on description
                tagged_skills = extract_skills_with_nlp(new_job.description, all_skills)
                for s in tagged_skills:
                    db.add(JobRequiredSkill(
                        job_id=new_job.id,
                        skill_id=s.id,
                        importance_weight=1.0
                    ))
                    
            synced_count += 1
            
    db.commit()
    return synced_count
