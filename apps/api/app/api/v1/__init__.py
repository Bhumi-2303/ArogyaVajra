"""API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.authorization import router as authz_router
from app.api.v1.doctors import router as doctors_router
from app.api.v1.availability import router as availability_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.patients import router as patients_router
from app.api.v1.users import router as users_router
from app.api.v1.medical_records import router as medical_records_router
from app.api.v1.prescriptions import router as prescriptions_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(authz_router)
api_v1_router.include_router(doctors_router)
api_v1_router.include_router(availability_router)
api_v1_router.include_router(appointments_router)
api_v1_router.include_router(medical_records_router)
api_v1_router.include_router(prescriptions_router)
api_v1_router.include_router(patients_router)
api_v1_router.include_router(users_router)

__all__ = ["api_v1_router"]
