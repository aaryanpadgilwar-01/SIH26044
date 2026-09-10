from typing import List, Optional, Any
from pydantic import BaseModel

class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str
    location: str
    website: Optional[str] = None
    logo_url: Optional[str] = None

class CandidateMatchItem(BaseModel):
    user_id: int
    name: str
    email: str
    target_role: str
    headline: str
    match_score: int
    verified_skills_count: int
    present_skills: List[str]
    missing_skills: List[str]
    has_applied: bool = False
    application_status: Optional[str] = None
    application_id: Optional[int] = None
