from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_v1_router
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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = {}
    for error in exc.errors():
        loc = error.get("loc", [])
        if len(loc) > 1 and loc[0] in ("body", "query", "path"):
            field = ".".join(str(x) for x in loc[1:])
        else:
            field = ".".join(str(x) for x in loc)
        errors[field] = error.get("msg")
        
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed.",
                "fields": errors
            }
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    code = "API_ERROR"
    message = str(detail)
    
    if isinstance(detail, dict):
        if "code" in detail:
            code = detail["code"]
        if "message" in detail:
            message = detail["message"]
    else:
        if exc.status_code == 401:
            code = "UNAUTHORIZED"
        elif exc.status_code == 403:
            code = "FORBIDDEN"
        elif exc.status_code == 404:
            code = "NOT_FOUND"
        elif exc.status_code == 409:
            code = "CONFLICT"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": message
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    import logging
    logging.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred."
            }
        }
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


# Mount API v1 Routers (including authentication)
app.include_router(api_v1_router)
