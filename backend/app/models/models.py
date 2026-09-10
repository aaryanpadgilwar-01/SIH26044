from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # student, industry, institution
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    user_skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    test_attempts = relationship("TestAttempt", back_populates="user", cascade="all, delete-orphan")
    company = relationship("Company", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    institution = relationship("Institution", back_populates="user", uselist=False, cascade="all, delete-orphan")
    institution_enrollments = relationship("InstitutionStudent", back_populates="student", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    target_role = Column(String(100), default="Software Engineer")
    headline = Column(String(255), default="Aspiring Software Engineer & Problem Solver")
    bio = Column(Text, default="")
    cv_url = Column(String(500), nullable=True)
    education = Column(JSON, default=list)      # [{degree, institution, year, score}]
    experience = Column(JSON, default=list)     # [{role, company, duration, description}]
    projects = Column(JSON, default=list)       # [{title, tech_stack, description, link}]

    user = relationship("User", back_populates="student_profile")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), default="General")  # Programming, Frameworks, Cloud, etc.

    user_skills = relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")
    tests = relationship("SkillTest", back_populates="skill", cascade="all, delete-orphan")
    job_requirements = relationship("JobRequiredSkill", back_populates="skill", cascade="all, delete-orphan")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="present")  # present, suggested, verified
    source = Column(String(50), default="cv_extracted")  # cv_extracted, manual, test

    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills")


class SkillTest(Base):
    __tablename__ = "skill_tests"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), unique=True, nullable=False)
    # Array of questions: [{id, question, options: [str], correct_index: int, explanation: str}]
    questions = Column(JSON, nullable=False)

    skill = relationship("Skill", back_populates="tests")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)  # 0.0 - 100.0
    passed = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="test_attempts")
    skill = relationship("Skill")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    logo_url = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    location = Column(String(255), default="Bengaluru, India")

    user = relationship("User", back_populates="company")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    location = Column(String(255), default="Remote")
    job_type = Column(String(50), default="Full-time")  # Full-time, Internship, etc.
    description = Column(Text, nullable=False)
    posted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source = Column(String(50), default="internal")  # internal, external_api
    platform = Column(String(50), default="SkillMatrix")  # LinkedIn, Indeed, Naukri, Direct

    company = relationship("Company", back_populates="jobs")
    required_skills = relationship("JobRequiredSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class JobRequiredSkill(Base):
    __tablename__ = "job_required_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    importance_weight = Column(Float, default=1.0)  # 0.5 to 2.0

    job = relationship("Job", back_populates="required_skills")
    skill = relationship("Skill", back_populates="job_requirements")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, default=0.0)
    status = Column(String(50), default="applied")  # applied, reviewed, shortlisted, rejected
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    job = relationship("Job", back_populates="applications")
    student = relationship("User", back_populates="applications")


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)
    location = Column(String(255), default="India")

    user = relationship("User", back_populates="institution")
    enrollments = relationship("InstitutionStudent", back_populates="institution", cascade="all, delete-orphan")


class InstitutionStudent(Base):
    __tablename__ = "institution_students"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    batch = Column(String(100), default="2026-CSE")  # Batch name or class code

    institution = relationship("Institution", back_populates="enrollments")
    student = relationship("User", back_populates="institution_enrollments")
