import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

logger = logging.getLogger("skillmatrix.db")

db_url = settings.DATABASE_URL
connect_args = {}

# Try connecting to PostgreSQL; fallback to SQLite if PostgreSQL fails to connect or is not active
if db_url.startswith("postgresql"):
    try:
        # Test connection with a short timeout
        test_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
        with test_engine.connect() as conn:
            pass
        logger.info(f"Connected successfully to PostgreSQL at {db_url.split('@')[-1] if '@' in db_url else db_url}")
        engine = test_engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite local database.")
        db_url = "sqlite:///./skillmatrix.db"
        connect_args = {"check_same_thread": False}
        engine = create_engine(db_url, connect_args=connect_args)
else:
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
