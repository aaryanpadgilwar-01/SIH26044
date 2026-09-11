from typing import List, Optional, Any
from pydantic import BaseModel

class BatchStatsResponse(BaseModel):
    batch: str
    total_students: int
    total_verified_skills: int
    avg_verified_per_student: float
    avg_job_readiness_score: int
    top_verified_skills: List[dict]  # [{skill: str, count: int}]

class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    verified_students_count: int = 0
    total_students: int = 0
    coverage_percentage: float = 0.0
    industry_demand_percentage: Optional[int] = 0
    batch_competency_percentage: Optional[int] = 0
    gap_percentage: Optional[int] = 0
    status: str  # Low Coverage, Moderate Coverage, Strong Coverage

class StudentRosterItem(BaseModel):
    student_id: int
    name: str
    email: str
    target_role: str
    batch: str
    verified_skills_count: int
    present_skills_count: int
    overall_readiness_score: int
    status: str  # Ready, Near Ready, Needs Upskilling
