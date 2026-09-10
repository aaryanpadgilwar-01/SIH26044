from typing import List, Optional, Any
from pydantic import BaseModel
from backend.app.schemas.skill import UserSkillItem

class StudentProfileUpdate(BaseModel):
    target_role: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[List[Any]] = None
    experience: Optional[List[Any]] = None
    projects: Optional[List[Any]] = None

class StudentProfileResponse(BaseModel):
    user_id: int
    name: str
    email: str
    target_role: str
    headline: str
    bio: str
    cv_url: Optional[str] = None
    education: List[Any] = []
    experience: List[Any] = []
    projects: List[Any] = []

class CVUploadResponse(BaseModel):
    status: str
    message: str
    filename: str
    extracted_skill_count: int
    present_skills: List[str]
    suggested_skills: List[str]

class StudentDashboardSummary(BaseModel):
    user_id: int
    name: str
    target_role: str
    cv_processed: bool
    extracted_skill_count: int
    skills_present_count: int
    skills_to_improve_count: int
    other_skills_count: int
    overall_match_percentage: int
    skills: List[UserSkillItem]
    platform_counts: dict
