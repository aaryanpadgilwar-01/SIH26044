from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class JobSkillTag(BaseModel):
    skill_id: int
    name: str
    status: str  # present (green), suggested/gap (coral), verified (blue/green)
    is_present: bool
    importance_weight: float = 1.0

class JobResponse(BaseModel):
    id: int
    company_id: Optional[int] = None
    company_name: str
    title: str
    location: str
    job_type: str
    description: str
    posted_at: Optional[datetime] = None
    source: str
    platform: str
    match_score: int
    skills: List[JobSkillTag] = []
    has_applied: bool = False

class JobCreate(BaseModel):
    title: str
    location: str = "Bengaluru, India"
    job_type: str = "Full-time"
    description: str
    platform: Optional[str] = "SkillMatrix"
    skills: List[str] = []  # List of skill names required

class ApplicationCreate(BaseModel):
    job_id: int

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    company_name: str
    location: str
    match_score: float
    status: str
    applied_at: datetime
