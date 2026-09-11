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
            name="Walchand College of Engineering",
            code="WCE-SANGLI-2026",
            location="Sangli, Maharashtra"
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

    # 5. Seed Standard Demo Users for Instant Role Demo:
    # student@demo.com, industry@demo.com, institution@demo.com (Password: password123)
    
    # 5a. student@demo.com
    std_demo = db.query(User).filter(User.email == "student@demo.com").first()
    if not std_demo:
        std_demo = User(
            name="Alex Turner",
            email="student@demo.com",
            password_hash=get_password_hash("password123"),
            role="student"
        )
        db.add(std_demo)
        db.commit()
        db.refresh(std_demo)
        
        std_profile = StudentProfile(
            user_id=std_demo.id,
            target_role="Full Stack Engineer",
            headline="Full Stack Developer & Cloud Enthusiast",
            bio="Motivated engineering student skilled in modern web stacks, distributed systems, and cloud infrastructure.",
            cv_url="uploads/cv_alex.pdf",
            education=[{"degree": "B.Tech Information Technology", "institution": "Apex Institute of Technology", "year": "2026", "score": "9.1 CGPA"}],
            experience=[{"role": "Full Stack Intern", "company": "Nexlify Tech", "duration": "4 months", "description": "Built reactive UIs with React and high-speed services using FastAPI."}],
            projects=[{"title": "Distributed Task Queue", "tech_stack": "Python, Redis, Docker", "description": "Asynchronous job scheduler handling 10k tasks/sec."}]
        )
        db.add(std_profile)
        
        demo_skills_present = ["Python", "JavaScript", "React", "SQL", "Data Structures", "Algorithms", "Git", "FastAPI", "Linux"]
        demo_skills_suggested = ["Docker", "Kubernetes", "AWS", "System Design", "Microservices"]
        demo_skills_verified = ["Python", "React", "SQL"]
        
        for name in demo_skills_present:
            s_obj = all_skills_map.get(name.lower())
            if s_obj:
                st = "verified" if name in demo_skills_verified else "present"
                db.add(UserSkill(user_id=std_demo.id, skill_id=s_obj.id, status=st, source="cv_extracted"))
                if st == "verified":
                    db.add(TestAttempt(user_id=std_demo.id, skill_id=s_obj.id, score=92.0, passed=True, verified_at=datetime.now(timezone.utc)))
                    
        for name in demo_skills_suggested:
            s_obj = all_skills_map.get(name.lower())
            if s_obj:
                db.add(UserSkill(user_id=std_demo.id, skill_id=s_obj.id, status="suggested", source="cv_extracted"))
                
        # Also enroll in institution batch if institution exists
        mit_inst = db.query(Institution).first()
        if mit_inst:
            db.add(InstitutionStudent(institution_id=mit_inst.id, student_id=std_demo.id, batch="2026-CSE-A"))
            
        db.commit()
        print("✓ Demo student (student@demo.com) seeded")

    # 5b. industry@demo.com
    ind_demo = db.query(User).filter(User.email == "industry@demo.com").first()
    if not ind_demo:
        ind_demo = User(
            name="Elena Rostova",
            email="industry@demo.com",
            password_hash=get_password_hash("password123"),
            role="industry"
        )
        db.add(ind_demo)
        db.commit()
        db.refresh(ind_demo)
        
        comp_demo = Company(
            user_id=ind_demo.id,
            name="Nexlify Technologies",
            description="Next-generation cloud computing and artificial intelligence solutions.",
            location="Bengaluru, India",
            website="https://nexlify.tech"
        )
        db.add(comp_demo)
        db.commit()
        print("✓ Demo industry employer (industry@demo.com) seeded")

    # 5c. institution@demo.com
    ins_demo = db.query(User).filter(User.email == "institution@demo.com").first()
    if not ins_demo:
        ins_demo = User(
            name="Prof. David K.",
            email="institution@demo.com",
            password_hash=get_password_hash("password123"),
            role="institution"
        )
        db.add(ins_demo)
        db.commit()
        db.refresh(ins_demo)
        
        apex_inst = Institution(
            user_id=ins_demo.id,
            name="Walchand College of Engineering",
            code="WCE-SANGLI-2026",
            location="Sangli, Maharashtra"
        )
        db.add(apex_inst)
        db.commit()
        db.refresh(apex_inst)
        
        if std_demo:
            db.add(InstitutionStudent(institution_id=apex_inst.id, student_id=std_demo.id, batch="2026-CSE-A"))
        if pavitra:
            db.add(InstitutionStudent(institution_id=apex_inst.id, student_id=pavitra.id, batch="2026-CSE-A"))
            
        db.commit()
        print("✓ Demo institution dean (institution@demo.com) seeded")

    # 6. Sync External & Internal Jobs
    sync_external_jobs_to_db(db)
    print("✓ External & internal jobs synced")
    
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
