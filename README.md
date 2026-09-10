# SkillMatrix — Academia-Industry Skill Mapping
**SIH 2026 | Problem Statement SIH26044 | Team WinYaLearn**

SkillMatrix is an intelligent talent aggregation and academia-industry skill bridging platform. It connects Students, Industry Employers, and Academic Institutions through an AI-driven skill matching engine, automated skill verification assessments, and a unified job marketplace.

---

## 🚀 Key Features by Portal

### 1. Student Portal
- **Reference UI Match**: Recreated to match the CareerBridge / SkillMatrix reference layout.
  - Top Navigation with search, notifications, and user avatar.
  - Left Sidebar with quick navigation and "Keep Growing!" progress nudge.
  - Greeting header with live CV processing badge (`✓ CV processed • 12 skills extracted`).
  - Search & filter bar by Keyword, Location, Job Type, and Platform.
  - **"Jobs for You" Cards**:
    - Color-coded match percentage badge (Green ≥70%, Amber 50–69%, Red <50%).
    - Matched skills in green pills (`✓ Skill`) and missing/gap skills in coral pills (`✕ Skill`).
    - Excerpt and 1-click apply.
  - **Right Sidebar**:
    - **Your Skills**: Legend, present skills, and suggested skills with "Get Personalized Learning Plan" CTA.
    - **Skill Match Overview**: Radial / Donut SVG chart with live counts of skills you have, skills to improve, and other skills.
    - **Top Platforms**: LinkedIn, Indeed, Naukri job count tiles.
    - Motivational quote card.
- **AI Skill Verification Assessments**: Click any skill pill to launch a 5-question technical quiz (generated via OpenAI API or curated fallback). Scoring ≥ 70% instantly verifies the skill, updates the database, and awards a verified badge.
- **CV Upload**: PDF parsing via `pdfplumber` + NLP skill tagging via `spaCy` (`en_core_web_sm`).

### 2. Industry Portal
- Employer profile management and branded job postings.
- Required skills tagging with custom importance weights.
- **Reverse Candidate Matching Engine**: Ranks student candidates using cosine similarity and weighted mastery scoring.
- Applicant tracking pipeline with status updates (`applied` → `reviewed` → `shortlisted` → `rejected`).

### 3. Institution Portal (Dean / Admin)
- Student batch management (e.g. `2026-CSE-A`, `2026-CSE-B`).
- Cohort Key Performance Indicators: Total Enrolled, Total Verified Skills, Average Verified per Student, and Overall Placement Readiness.
- **Academia-Industry Skill Gap Matrix**: Side-by-side comparison of current industry demand vs. batch verified competency with automated status alerts (`Critical Gap`, `Moderate Gap`, `Well Covered`).
- **Student Placement Roster**: Individual student verification counts, readiness scores, and status tags with CSV export.

---

## 🛠️ Strict Tech Stack Compliance

- **Frontend**: React.js, HTML5, CSS3, JavaScript, Tailwind CSS, Lucide React icons, Vite
- **Backend**: FastAPI (Python 3.14)
- **Database**: PostgreSQL (SQLAlchemy ORM + Alembic migrations) with automated resilient fallback to SQLite for local development
- **Auth**: JWT Bearer tokens + bcrypt password hashing + OAuth2 session handling
- **CV/PDF Processing**: `pdfplumber`
- **Skill Tagging / NLP**: `spaCy` (`en_core_web_sm` + rule-based PhraseMatcher)
- **Matching Engine**: `scikit-learn` & `numpy` cosine similarity + weighted coverage scoring (0–100%)
- **Job Aggregation**: Clean `fetch_jobs_from_source()` interface backed by sample JSON fixtures, ready for external API swap
- **AI Assessments**: OpenAI API (`gpt-4o-mini`) via `OPENAI_API_KEY` with deterministic curated fallbacks

---

## 🔑 Demo Accounts

All demo accounts use the password: `password123`

| Role | Name | Email | Default Dashboard |
|---|---|---|---|
| **Student** | Pavitra S | `pavitra@skillmatrix.edu` | Student Dashboard (Full match with reference UI) |
| **Industry** | Sarah Chen (Google) | `recruiter@google.com` | Industry Portal & Candidate Pipeline |
| **Institution** | Dr. Rajesh Sharma (MIT) | `dean@mit.edu` | Dean's Institution Analytics & Skill Gap Matrix |

---

## 🏃 Running the Application

### 1. Start the FastAPI Backend
```bash
cd /home/pavitra/SIH26044
source venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
API Documentation is available at: `http://localhost:8000/docs`

### 2. Start the React Frontend
```bash
cd /home/pavitra/SIH26044/frontend
bun run dev
# or
npm run dev
```
Web Application is available at: `http://localhost:5173`

### 3. Run Automated End-to-End Tests
```bash
cd /home/pavitra/SIH26044
PYTHONPATH=. ./venv/bin/python backend/app/test_all_phases.py
```