#!/bin/bash

# Exit on error
set -e

# Load environment variables if .env file exists
if [ -f .env ]; then
    source .env
fi

# Build and deploy
echo "Building and deploying AI server..."

# Pull latest changes if needed
if [ "$PULL_LATEST" = "true" ]; then
    echo "Pulling latest changes..."
    git pull
fi

# Build and start the services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
echo "Waiting for service to be healthy..."
sleep 10

# Check if service is healthy
if curl -s -f http://localhost:8000/docs > /dev/null; then
    echo "Deployment successful! Service is healthy."
else
    echo "Warning: Service health check failed. Please check the logs."
    docker-compose -f docker-compose.prod.yml logs ai-server
    exit 1
fi 