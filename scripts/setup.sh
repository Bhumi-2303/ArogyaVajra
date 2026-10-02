#!/usr/bin/env bash
# ==============================================================================
# Arogyavajra Local Development Setup Script
# ==============================================================================

set -e

echo "=== Initializing Arogyavajra Development Environment ==="

# Check for .env file
if [ ! -f .env ]; then
  echo "--> Creating .env from .env.example..."
  cp .env.example .env
  echo "--> .env created. Please customize it if needed."
else
  echo "--> .env already exists."
fi

echo "--> Development setup complete!"
echo "To start with Docker Compose: docker compose up --build"
echo "To run API locally: cd apps/api && pip install -r requirements.txt && uvicorn app.main:app --reload"
echo "To run Web locally: cd apps/web && npm install && npm run dev"
