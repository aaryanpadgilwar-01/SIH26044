import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple, Any
from sqlalchemy.orm import Session
from backend.app.models.models import User, UserSkill, Job, JobRequiredSkill, Skill, Application

def compute_match_score(
    student_skill_dict: Dict[int, str], # skill_id -> status ('present', 'verified', 'suggested')
    job_required_skills: List[JobRequiredSkill] # list with skill_id and importance_weight
) -> Tuple[int, List[Dict]]:
    """
    Computes a match score (0-100%) using cosine similarity and weighted scoring.
    Verified skills give a high-confidence bonus.
    """
    if not job_required_skills:
        return 100, []

    all_skill_ids = [req.skill_id for req in job_required_skills]
    weights = [req.importance_weight for req in job_required_skills]
    
    # Vectors
    v_job = np.array(weights, dtype=float)
    v_student = np.zeros(len(all_skill_ids), dtype=float)
    
    tag_breakdown = []
    matched_weight = 0.0
    total_weight = sum(weights)

    for idx, req in enumerate(job_required_skills):
        sid = req.skill_id
        status = student_skill_dict.get(sid, "missing")
        is_present = False
        
        if status == "verified":
            v_student[idx] = req.importance_weight * 1.15  # Bonus for verified mastery
            is_present = True
            matched_weight += req.importance_weight
        elif status == "present":
            v_student[idx] = req.importance_weight
            is_present = True
            matched_weight += req.importance_weight
        else:
            v_student[idx] = 0.0
            status = "gap"
            
        tag_breakdown.append({
            "skill_id": sid,
            "name": req.skill.name if req.skill else f"Skill #{sid}",
            "status": status,
            "is_present": is_present,
            "importance_weight": req.importance_weight
        })

    # Weighted coverage score
    coverage_score = (matched_weight / total_weight) * 100 if total_weight > 0 else 0

    # Vector cosine similarity
    if np.linalg.norm(v_student) > 0 and np.linalg.norm(v_job) > 0:
        cos_sim = cosine_similarity(v_student.reshape(1, -1), v_job.reshape(1, -1))[0][0]
        cos_score = float(cos_sim * 100)
    else:
        cos_score = 0.0

    # Blended score: 60% weighted coverage + 40% cosine similarity
    final_score = int(round(0.6 * coverage_score + 0.4 * cos_score))
    final_score = max(5, min(99, final_score)) if matched_weight > 0 else 0
    
    return final_score, tag_breakdown

def get_jobs_for_student(db: Session, student_id: int, query: str = None, location: str = None, job_type: str = None, platform: str = None) -> List[Dict]:
    """
    Ranks all available jobs for a student according to the matching engine.
    """
    # Fetch student's skills
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == student_id).all()
    student_skill_dict = {us.skill_id: us.status for us in user_skills if us.status in ["present", "verified"]}
    
    # Query jobs
    jobs_query = db.query(Job)
    if location and location != "All Locations":
        jobs_query = jobs_query.filter(Job.location.ilike(f"%{location}%"))
    if job_type and job_type != "All Job Types":
        jobs_query = jobs_query.filter(Job.job_type.ilike(f"%{job_type}%"))
    if platform and platform != "All Platforms":
        jobs_query = jobs_query.filter(Job.platform.ilike(f"%{platform}%"))
    if query:
        jobs_query = jobs_query.filter(
            (Job.title.ilike(f"%{query}%")) | 
            (Job.company_name.ilike(f"%{query}%")) |
            (Job.description.ilike(f"%{query}%"))
        )
        
    all_jobs = jobs_query.all()
    
    # Get student applications
    applied_job_ids = {
        app.job_id for app in db.query(Application).filter(Application.student_id == student_id).all()
    }
    
    ranked_jobs = []
    for job in all_jobs:
        score, skill_tags = compute_match_score(student_skill_dict, job.required_skills)
        ranked_jobs.append({
            "id": job.id,
            "company_id": job.company_id,
            "company_name": job.company_name,
            "title": job.title,
            "location": job.location,
            "job_type": job.job_type,
            "description": job.description,
            "posted_at": job.posted_at,
            "source": job.source,
            "platform": job.platform,
            "match_score": score,
            "skills": skill_tags,
            "has_applied": job.id in applied_job_ids
        })
        
    # Sort descending by match_score
    ranked_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked_jobs

def get_candidates_for_job(db: Session, job_id: int) -> List[Dict]:
    """
    Ranks all students in reverse matching for an employer/recruiter job.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return []
        
    students = db.query(User).filter(User.role == "student").all()
    ranked_candidates = []
    
    for student in students:
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == student.id).all()
        student_skill_dict = {us.skill_id: us.status for us in user_skills if us.status in ["present", "verified"]}
        score, skill_tags = compute_match_score(student_skill_dict, job.required_skills)
        
        # Check application
        app = db.query(Application).filter(
            Application.job_id == job_id,
            Application.student_id == student.id
        ).first()
        
        verified_count = sum(1 for us in user_skills if us.status == "verified")
        present_names = [t["name"] for t in skill_tags if t["is_present"]]
        missing_names = [t["name"] for t in skill_tags if not t["is_present"]]
        
        ranked_candidates.append({
            "user_id": student.id,
            "name": student.name,
            "email": student.email,
            "target_role": student.student_profile.target_role if student.student_profile else "Software Engineer",
            "headline": student.student_profile.headline if student.student_profile else "Candidate",
            "match_score": score,
            "verified_skills_count": verified_count,
            "present_skills": present_names,
            "missing_skills": missing_names,
            "has_applied": app is not None,
            "application_status": app.status if app else None,
            "application_id": app.id if app else None
        })
        
    ranked_candidates.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked_candidates
