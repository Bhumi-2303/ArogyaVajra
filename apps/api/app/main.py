"""Arogyavajra API Entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Arogyavajra Healthcare Management API",
    description="Backend API for Arogyavajra Healthcare Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "arogyavajra-api",
        "version": "1.0.0",
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
