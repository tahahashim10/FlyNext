#!/bin/bash
set -e

echo "Starting data import for FlyNext and AFS..."

# Check if containers are running
if ! docker-compose --env-file .env.docker ps | grep -q flynext; then
  echo "Error: Docker containers are not running. Please run ./start.sh first."
  exit 1
fi

# Reset AFS database and import data
echo "Resetting AFS database..."
docker-compose --env-file .env.docker exec afs npx prisma migrate reset --force

echo "Importing AFS data..."
docker-compose --env-file .env.docker exec afs node prisma/data/import_data
docker-compose --env-file .env.docker exec afs node prisma/data/generate_flights
docker-compose --env-file .env.docker exec afs node prisma/data/import_agencies

# Reset FlyNext database
echo "Resetting FlyNext database..."
docker-compose --env-file .env.docker exec flynext npx prisma migrate reset --force

# Fetch cities and airports data (now that AFS is confirmed available)
echo "Fetching cities and airports..."
docker-compose --env-file .env.docker exec flynext node scripts/fetchCitiesAirports.js

# Seed hotels and rooms
echo "Seeding hotels and rooms..."
docker-compose --env-file .env.docker exec flynext node prisma/seed_hotels_and_rooms.js

echo "Data import completed successfully."
