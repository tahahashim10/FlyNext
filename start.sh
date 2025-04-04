#!/bin/bash

# Check if .env.docker file exists
if [ ! -f .env.docker ]; then
  echo "Warning: .env.docker file not found. Creating a sample one..."
  cat > .env.docker << EOF
# Database configuration for FlyNext
FLYNEXT_DB_USER=flynextuser
FLYNEXT_DB_PASSWORD=flynextpass
FLYNEXT_DB_NAME=flynextdb

# Database configuration for AFS
AFS_DB_USER=afsuser
AFS_DB_PASSWORD=afspass
AFS_DB_NAME=afsdb

# Application secrets
JWT_SECRET=development_jwt_secret

# AFS configuration
AFS_API_KEY=development_afs_api_key

# ImageKit configuration (replace with your actual keys)
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
EOF
  echo ".env.docker file created with default values."
  echo "Please edit it with your actual credentials before running the application in production."
fi

# Build and start all services
echo "Starting FlyNext application..."
docker-compose --env-file .env.docker up -d --build

echo "Waiting for services to be ready..."
sleep 10

echo "FlyNext application is now running."
echo "- Main application: http://localhost:3000"
echo "- AFS service: http://localhost:3001"