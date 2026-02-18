#!/bin/bash
# Extract database connection info from .env
if [ -f .env ]; then
  export $(cat .env | grep DATABASE_URL | xargs)
  psql $DATABASE_URL -f ../fix-order-status.sql
else
  echo "Error: .env file not found"
  exit 1
fi
