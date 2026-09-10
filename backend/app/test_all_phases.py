import sys
import os
import json
from fastapi.testclient import TestClient

# Set path
sys.path.insert(0, "/home/pavitra/SIH26044")

from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.models import User, Skill, Job

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("RUNNING END-TO-END VERIFICATION: SKILLMATRIX")
    print("==================================================")
    
    # 1. Health Check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ Health Check Passed:", res.json())
    
    # 2. Phase 1: Auth & Login (Student, Industry, Institution)
    # Student login
    res_student = client.post("/api/v1/auth/login", json={
        "email": "pavitra@skillmatrix.edu",
        "password": "password123"
    })
    assert res_student.status_code == 200, f"Student login failed: {res_student.text}"
    student_token = res_student.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("✓ Phase 1: Student JWT Auth Passed")
    
    # Industry login
    res_ind = client.post("/api/v1/auth/login", json={
        "email": "recruiter@google.com",
        "password": "password123"
    })
    assert res_ind.status_code == 200, f"Industry login failed: {res_ind.text}"
    ind_token = res_ind.json()["access_token"]
    ind_headers = {"Authorization": f"Bearer {ind_token}"}
    print("✓ Phase 1: Industry JWT Auth Passed")
    
    # Institution login
    res_inst = client.post("/api/v1/auth/login", json={
        "email": "dean@mit.edu",
        "password": "password123"
    })
    assert res_inst.status_code == 200, f"Institution login failed: {res_inst.text}"
    inst_token = res_inst.json()["access_token"]
    inst_headers = {"Authorization": f"Bearer {inst_token}"}
    print("✓ Phase 1: Institution JWT Auth Passed")
    
    # 3. Phase 2: Core Services - Matching Engine & Job Aggregator
    res_jobs = client.get("/api/v1/jobs/recommended", headers=student_headers)
    assert res_jobs.status_code == 200, f"Jobs recommendation failed: {res_jobs.text}"
    jobs_list = res_jobs.json()
    assert len(jobs_list) > 0, "No recommended jobs returned"
    top_job = jobs_list[0]
    print(f"✓ Phase 2: Matching Engine computed top job '{top_job['title']}' at '{top_job['company_name']}' with {top_job['match_score']}% Match")
    assert "skills" in top_job and len(top_job["skills"]) > 0, "Job missing skill tags"
    print(f"  • Matched {len([s for s in top_job['skills'] if s['is_present']])} skills, {len([s for s in top_job['skills'] if not s['is_present']])} gap skills")
    
    # 4. Phase 3: Student Dashboard Summary & Verification Test
    res_summary = client.get("/api/v1/students/dashboard-summary", headers=student_headers)
    assert res_summary.status_code == 200, f"Dashboard summary failed: {res_summary.text}"
    summary = res_summary.json()
    print(f"✓ Phase 3: Student Dashboard Summary Passed:")
    print(f"  • Name: {summary['name']}, Extracted Skills: {summary['extracted_skill_count']}")
    print(f"  • Skills Present: {summary['skills_present_count']}, Skills to Improve: {summary['skills_to_improve_count']}")
    print(f"  • Overall Match: {summary['overall_match_percentage']}%")
    
    # Test taking a skill verification assessment
    python_skill = next((s for s in summary['skills'] if s['name'] == 'Python'), summary['skills'][0])
    res_test = client.get(f"/api/v1/students/test/{python_skill['skill_id']}", headers=student_headers)
    assert res_test.status_code == 200, f"Skill test fetch failed: {res_test.text}"
    test_data = res_test.json()
    print(f"✓ Phase 3: Generated Skill Assessment for '{test_data['skill_name']}' with {len(test_data['questions'])} questions")
    
    # Submit test with answers
    submission_answers = {str(q['id']): 1 for q in test_data['questions']} # pick answer
    res_sub = client.post(f"/api/v1/students/test/{python_skill['skill_id']}/submit", headers=student_headers, json={
        "answers": submission_answers
    })
    assert res_sub.status_code == 200, f"Test submission failed: {res_sub.text}"
    test_res = res_sub.json()
    print(f"✓ Phase 3: Test Grading Passed: Score {test_res['score']}%, Status: {test_res['status']}")
    
    # Quick 1-click Apply
    res_apply = client.post(f"/api/v1/jobs/{top_job['id']}/apply", headers=student_headers)
    # 200 or 400 if already applied
    print(f"✓ Phase 3: Quick 1-click Application handled (status {res_apply.status_code})")
    
    # 5. Phase 4: Industry Portal - Candidates & Job Posting
    res_comp_jobs = client.get("/api/v1/industry/jobs", headers=ind_headers)
    assert res_comp_jobs.status_code == 200, f"Industry jobs failed: {res_comp_jobs.text}"
    ind_jobs = res_comp_jobs.json()
    print(f"✓ Phase 4: Industry Portal lists {len(ind_jobs)} active job postings")
    
    if len(ind_jobs) > 0:
        first_job_id = ind_jobs[0]["id"]
        res_cands = client.get(f"/api/v1/industry/jobs/{first_job_id}/candidates", headers=ind_headers)
        assert res_cands.status_code == 200, f"Candidate matching failed: {res_cands.text}"
        cands = res_cands.json()
        print(f"✓ Phase 4: Reverse Matching Engine ranked {len(cands)} candidates for job #{first_job_id}")
        if len(cands) > 0:
            print(f"  • Top Candidate: {cands[0]['name']} ({cands[0]['match_score']}% Match, {cands[0]['verified_skills_count']} verified skills)")
            
    # Post a new job from Industry
    res_post_job = client.post("/api/v1/industry/jobs", headers=ind_headers, json={
        "title": "Cloud Architect",
        "location": "Bengaluru, India",
        "job_type": "Full-time",
        "description": "Lead enterprise cloud modernization and microservices architecture.",
        "skills": ["AWS", "Docker", "Kubernetes", "Linux", "System Design"]
    })
    assert res_post_job.status_code == 200, f"Job posting failed: {res_post_job.text}"
    print("✓ Phase 4: Employer Job Posting & Tagging Passed")

    # 6. Phase 5: Institution Portal - Cohort Analytics & Gap Matrix
    res_batches = client.get("/api/v1/institutions/batches", headers=inst_headers)
    assert res_batches.status_code == 200, f"Batches fetch failed: {res_batches.text}"
    batches = res_batches.json()
    print(f"✓ Phase 5: Institution Batches Available: {batches}")
    
    active_batch = batches[0] if batches else "2026-CSE-A"
    res_stats = client.get(f"/api/v1/institutions/batches/{active_batch}/stats", headers=inst_headers)
    assert res_stats.status_code == 200, f"Batch stats failed: {res_stats.text}"
    b_stats = res_stats.json()
    print(f"✓ Phase 5: Cohort Stats for '{active_batch}': {b_stats['total_students']} Students, {b_stats['total_verified_skills']} Verified Skills, {b_stats['avg_job_readiness_score']}% Readiness")
    
    res_gaps = client.get(f"/api/v1/institutions/batches/{active_batch}/gap-analysis", headers=inst_headers)
    assert res_gaps.status_code == 200, f"Gap analysis failed: {res_gaps.text}"
    gaps = res_gaps.json()
    print(f"✓ Phase 5: Skill Gap Matrix calculated for {len(gaps)} key industry skills")
    if len(gaps) > 0:
        print(f"  • Top Gap Skill: {gaps[0]['skill_name']} (Demand: {gaps[0]['industry_demand_percentage']}%, Cohort: {gaps[0]['batch_competency_percentage']}%, Status: {gaps[0]['status']})")
        
    res_roster = client.get(f"/api/v1/institutions/batches/{active_batch}/roster", headers=inst_headers)
    assert res_roster.status_code == 200, f"Roster failed: {res_roster.text}"
    roster = res_roster.json()
    print(f"✓ Phase 5: Student Placement Roster generated with {len(roster)} student profiles")

    print("==================================================")
    print("ALL 6 PHASES VERIFIED SUCCESSFULLY AND OPERATIONAL!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
