from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import check_db_connection, close_db_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown hooks."""
    yield
    close_db_engine()


app = FastAPI(
    title="Arogyavajra Healthcare Management API",
    description="Backend API for Arogyavajra Healthcare Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
origins = settings.cors_origins_list
allow_origins = origins if origins else ["*"]
allow_credentials = bool(origins and "*" not in origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Service liveness probe endpoint."""
    return {
        "status": "healthy",
        "service": "arogyavajra-api",
        "version": "1.0.0",
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Service readiness probe endpoint verifying database connectivity."""
    db_ok = check_db_connection()
    if not db_ok:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "arogyavajra-api",
                "database": "disconnected",
            },
        )
    return {
        "status": "ready",
        "service": "arogyavajra-api",
        "database": "connected",
    }


@app.get("/api/v1", tags=["Root"])
async def api_root():
    """API v1 root endpoint."""
    return {
        "data": {
            "name": "Arogyavajra API",
            "version": "v1",
            "status": "active",
        },
        "message": "Welcome to Arogyavajra Healthcare Management API",
    }

