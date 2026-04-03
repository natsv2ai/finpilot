import bcrypt
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Monkeypatch bcrypt to fix passlib incompatibility in newer versions
try:
    if not hasattr(bcrypt, "__about__"):
        bcrypt.__about__ = type("About", (object,), {"__version__": bcrypt.__version__})
except Exception:
    pass

from app.core.config import settings
from app.api.api_v1.router import api_router
from app.db.base import Base
from app.db.database import engine, SessionLocal
from app.db.seed import seed_demo_data

# Import all models so they are registered with Base.metadata
import app.models.user  # noqa
import app.models.holding  # noqa
import app.models.portfolio  # noqa
import app.models.insurance  # noqa
import app.models.expense  # noqa
import app.models.family  # noqa
import app.models.asset  # noqa
import app.models.broker_connection  # noqa
import app.models.market_data  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Wealth Advisor — Portfolio Tracker, XIRR Calculator, Risk Analyzer",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "status": "running", "version": "2.0.0"}
