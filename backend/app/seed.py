import os
import json
from datetime import datetime, timezone
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models.models import (
    User, StudentProfile, Skill, UserSkill, SkillTest, TestAttempt,
    Company, Job, JobRequiredSkill, Application, Institution, InstitutionStudent
)
from backend.app.services.job_aggregator import sync_external_jobs_to_db

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Seeding database...")
    
    # 1. Seed Skills Taxonomy
    tax_path = os.path.join(os.path.dirname(__file__), "fixtures", "skills_taxonomy.json")
    if os.path.exists(tax_path):
        with open(tax_path, "r") as f:
            tax_skills = json.load(f)
            for s in tax_skills:
                existing = db.query(Skill).filter(Skill.name.ilike(s["name"])).first()
                if not existing:
                    db.add(Skill(name=s["name"], category=s.get("category", "General")))
        db.commit()
        print("✓ Skills taxonomy seeded")
        
    all_skills_map = {s.name.lower(): s for s in db.query(Skill).all()}
    
    # 2. Seed Demo Student: Pavitra S
    pavitra = db.query(User).filter(User.email == "pavitra@skillmatrix.edu").first()
    if not pavitra:
        pavitra = User(
            name="Pavitra S",
            email="pavitra@skillmatrix.edu",
            password_hash=get_password_hash("password123"),
            role="student"
        )
        db.add(pavitra)
        db.commit()
        db.refresh(pavitra)
        
        # Profile
        profile = StudentProfile(
            user_id=pavitra.id,
            target_role="Software Engineer",
            headline="Aspiring Software Engineer & Problem Solver",
            bio="Passionate computer science student focused on distributed systems, algorithms, and full-stack development.",
            cv_url="uploads/cv_pavitra.pdf",
            education=[{"degree": "B.Tech Computer Science", "institution": "National Institute of Technology", "year": "2026", "score": "8.8 CGPA"}],
            experience=[{"role": "Software Engineering Intern", "company": "Tech Innovations", "duration": "3 months", "description": "Built REST APIs with FastAPI and optimized PostgreSQL database queries."}],
            projects=[{"title": "SkillMatrix", "tech_stack": "FastAPI, React, spaCy, PostgreSQL", "description": "Academia-Industry skill mapping platform with AI matching."}]
        )
        db.add(profile)
        db.commit()
        
        # Exact skills from reference screenshot:
        # Present: Python, Java, SQL, Data Structures, Algorithms, Linux, Problem Solving, Git
        # Suggested: System Design, Cloud (AWS/GCP), Docker, Machine Learning, Communication
        skills_present = ["Python", "Java", "SQL", "Data Structures", "Algorithms", "Linux", "Problem Solving", "Git"]
        skills_suggested = ["System Design", "Cloud (AWS/GCP)", "Docker", "Machine Learning", "Communication"]
        skills_verified = ["Python", "SQL"]
        
        for name in skills_present:
            s_obj = all_skills_map.get(name.lower())
            if s_obj:
                status = "verified" if name in skills_verified else "present"
                db.add(UserSkill(user_id=pavitra.id, skill_id=s_obj.id, status=status, source="cv_extracted"))
                if status == "verified":
                    db.add(TestAttempt(user_id=pavitra.id, skill_id=s_obj.id, score=90.0, passed=True, verified_at=datetime.now(timezone.utc)))
                    
        for name in skills_suggested:
            s_obj = all_skills_map.get(name.lower())
            if s_obj:
                db.add(UserSkill(user_id=pavitra.id, skill_id=s_obj.id, status="suggested", source="cv_extracted"))
                
        db.commit()
        print("✓ Demo student Pavitra seeded with exact UI skills")
        
    # 3. Seed Demo Industry Employer: Google / Tech Recruiter
    recruiter = db.query(User).filter(User.email == "recruiter@google.com").first()
    if not recruiter:
        recruiter = User(
            name="Sarah Chen",
            email="recruiter@google.com",
            password_hash=get_password_hash("password123"),
            role="industry"
        )
        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)
        
        company = Company(
            user_id=recruiter.id,
            name="Google",
            description="Organizing world's information and making it universally accessible.",
            location="Bengaluru, India",
            website="https://careers.google.com"
        )
        db.add(company)
        db.commit()
        print("✓ Demo industry employer seeded")
        
    # 4. Seed Demo Institution: MIT / University Dean
    dean = db.query(User).filter(User.email == "dean@mit.edu").first()
    if not dean:
        dean = User(
            name="Dr. Rajesh Sharma",
            email="dean@mit.edu",
            password_hash=get_password_hash("password123"),
            role="institution"
        )
        db.add(dean)
        db.commit()
        db.refresh(dean)
        
        inst = Institution(
            user_id=dean.id,
            name="MIT College of Engineering",
            code="MIT-ENG-2026",
            location="Pune, Maharashtra"
        )
        db.add(inst)
        db.commit()
        db.refresh(inst)
        
        # Enroll Pavitra in Batch 2026-CSE-A
        db.add(InstitutionStudent(institution_id=inst.id, student_id=pavitra.id, batch="2026-CSE-A"))
        
        # Add a few peers in batch
        peers = [
            ("Aaryan Padgilwar", "aaryan@mit.edu", "Full Stack Developer"),
            ("Priya Nair", "priya@mit.edu", "Backend Developer"),
            ("Rohan Mehta", "rohan@mit.edu", "Data Scientist"),
            ("Ananya Verma", "ananya@mit.edu", "Cloud Engineer")
        ]
        for name, email, target_role in peers:
            u = User(name=name, email=email, password_hash=get_password_hash("password123"), role="student")
            db.add(u)
            db.commit()
            db.refresh(u)
            db.add(StudentProfile(user_id=u.id, target_role=target_role, headline=f"Aspiring {target_role}"))
            db.add(InstitutionStudent(institution_id=inst.id, student_id=u.id, batch="2026-CSE-A"))
            
            # Add random skills
            s_objs = list(all_skills_map.values())[:6]
            for s in s_objs:
                db.add(UserSkill(user_id=u.id, skill_id=s.id, status="verified", source="test"))
                
        db.commit()
        print("✓ Demo institution & student cohort seeded")

    # 5. Sync External & Internal Jobs
    sync_external_jobs_to_db(db)
    print("✓ External & internal jobs synced")
    
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
