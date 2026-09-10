from typing import List, Optional
from pydantic import BaseModel

class SkillBase(BaseModel):
    name: str
    category: str = "General"

class SkillResponse(SkillBase):
    id: int

    class Config:
        from_attributes = True

class UserSkillItem(BaseModel):
    skill_id: int
    name: str
    category: str
    status: str  # present, suggested, verified
    source: str  # cv_extracted, manual, test

class UserSkillUpdate(BaseModel):
    skill_id: int
    status: str

class AddUserSkill(BaseModel):
    name: str
    category: Optional[str] = "General"
    status: Optional[str] = "present"

class QuestionItem(BaseModel):
    id: int
    question: str
    options: List[str]
    # correct_index & explanation are excluded when serving to student

class SkillTestResponse(BaseModel):
    skill_id: int
    skill_name: str
    questions: List[QuestionItem]

class TestSubmission(BaseModel):
    # Mapping of question_id to selected_option_index
    answers: dict[str, int]

class TestResultResponse(BaseModel):
    skill_id: int
    skill_name: str
    score: float
    passed: bool
    threshold: float
    correct_count: int
    total_count: int
    status: str
    message: str
