import os
import re
from typing import List, Tuple, Dict
import pdfplumber
import spacy
from sqlalchemy.orm import Session
from backend.app.models.models import Skill, UserSkill, StudentProfile

# Load spacy model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = spacy.blank("en")

# Role target templates for intelligent skill gap identification
ROLE_RECOMMENDED_SKILLS = {
    "software engineer": [
        "Python", "Java", "Data Structures", "Algorithms", "System Design", 
        "SQL", "Git", "Linux", "Communication", "Problem Solving"
    ],
    "backend developer": [
        "Python", "Java", "SQL", "PostgreSQL", "FastAPI", "REST APIs", 
        "Docker", "System Design", "Distributed Systems", "AWS"
    ],
    "frontend developer": [
        "JavaScript", "TypeScript", "React", "Node.js", "Git", 
        "REST APIs", "Communication", "Problem Solving"
    ],
    "full stack engineer": [
        "JavaScript", "React", "Python", "Node.js", "SQL", 
        "Docker", "REST APIs", "Git", "System Design"
    ],
    "data scientist": [
        "Python", "SQL", "Machine Learning", "Deep Learning", 
        "Algorithms", "scikit-learn", "PyTorch", "Communication"
    ],
    "cloud engineer": [
        "Linux", "Docker", "Kubernetes", "AWS", "Azure", 
        "CI/CD", "Python", "Computer Networks"
    ]
}

def extract_text_from_pdf(pdf_path: str) -> str:
    extracted_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        # If not a valid PDF or error, try reading as UTF-8 plain text
        if os.path.exists(pdf_path):
            with open(pdf_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()
    return extracted_text

def extract_skills_with_nlp(text: str, all_skills: List[Skill]) -> List[Skill]:
    """
    Extract skills present in text using case-insensitive boundary matching and spaCy tokens.
    """
    matched_skills = []
    text_lower = f" {text.lower()} "
    
    for skill in all_skills:
        skill_name = skill.name
        # Build flexible regex for multi-word or special symbols (e.g., C++, Node.js, CI/CD)
        escaped_name = re.escape(skill_name.lower())
        pattern = r"(?<![a-zA-Z0-9_])" + escaped_name + r"(?![a-zA-Z0-9_])"
        
        # Special case aliases
        if skill_name.lower() == "c++":
            pattern = r"(?<![a-zA-Z0-9_])(c\+\+|cpp)(?![a-zA-Z0-9_])"
        elif skill_name.lower() == "react":
            pattern = r"(?<![a-zA-Z0-9_])(react|reactjs|react\.js)(?![a-zA-Z0-9_])"
        elif skill_name.lower() == "node.js":
            pattern = r"(?<![a-zA-Z0-9_])(node|nodejs|node\.js)(?![a-zA-Z0-9_])"
        elif skill_name.lower() == "cloud (aws/gcp)":
            pattern = r"(?<![a-zA-Z0-9_])(aws|gcp|google cloud|amazon web services)(?![a-zA-Z0-9_])"
        elif skill_name.lower() == "cloud (gcp)":
            pattern = r"(?<![a-zA-Z0-9_])(gcp|google cloud)(?![a-zA-Z0-9_])"

        if re.search(pattern, text_lower):
            matched_skills.append(skill)
            
    return matched_skills

def process_student_cv(db: Session, user_id: int, file_path: str) -> Dict:
    """
    Process uploaded CV:
    1. Extract text with pdfplumber
    2. Extract skills with NLP
    3. Determine gap suggestions based on target role
    4. Persist in user_skills table
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    target_role = profile.target_role.lower() if profile and profile.target_role else "software engineer"
    
    # Extract text
    raw_text = extract_text_from_pdf(file_path)
    
    # Fetch all skills from master taxonomy
    all_skills = db.query(Skill).all()
    if not all_skills:
        # Fallback if DB not yet seeded
        all_skills = []
        
    extracted_present_skills = extract_skills_with_nlp(raw_text, all_skills)
    extracted_skill_ids = {s.id for s in extracted_present_skills}
    
    # Identify target role recommended skill names
    recommended_names = ROLE_RECOMMENDED_SKILLS.get(target_role, ROLE_RECOMMENDED_SKILLS["software engineer"])
    
    # Update or insert into user_skills
    present_names = []
    suggested_names = []
    
    for skill in extracted_present_skills:
        present_names.append(skill.name)
        existing = db.query(UserSkill).filter(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == skill.id
        ).first()
        if existing:
            if existing.status != "verified":
                existing.status = "present"
                existing.source = "cv_extracted"
        else:
            db.add(UserSkill(
                user_id=user_id,
                skill_id=skill.id,
                status="present",
                source="cv_extracted"
            ))
            
    # Add suggested skills for missing skills in the target role
    for skill in all_skills:
        if skill.name in recommended_names and skill.id not in extracted_skill_ids:
            suggested_names.append(skill.name)
            existing = db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.skill_id == skill.id
            ).first()
            if not existing:
                db.add(UserSkill(
                    user_id=user_id,
                    skill_id=skill.id,
                    status="suggested",
                    source="cv_extracted"
                ))
                
    # Update profile CV url
    if profile:
        profile.cv_url = file_path
        
    db.commit()
    
    return {
        "extracted_count": len(extracted_present_skills),
        "present_skills": present_names,
        "suggested_skills": suggested_names
    }
