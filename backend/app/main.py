from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.routers import auth, students, jobs, industry, institutions
from backend.app.services.job_aggregator import sync_external_jobs_to_db

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(students.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(industry.router, prefix=settings.API_V1_STR)
app.include_router(institutions.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    # Sync mock external jobs if needed
    db = SessionLocal()
    try:
        from backend.app.models.models import Job
        job_count = db.query(Job).count()
        if job_count == 0:
            sync_external_jobs_to_db(db)
    except Exception as e:
        print(f"Startup sync notice: {e}")
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url)
    }
