"""API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.authorization import router as authz_router
from app.api.v1.patients import router as patients_router
from app.api.v1.users import router as users_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(authz_router)
api_v1_router.include_router(patients_router)
api_v1_router.include_router(users_router)

__all__ = ["api_v1_router"]
