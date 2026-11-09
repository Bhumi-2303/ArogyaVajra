#!/bin/sh
set -e

echo "=== Running Database Migrations ==="
alembic upgrade head

echo "=== Starting ArogyaVajra API Server ==="
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
