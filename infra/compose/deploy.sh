#!/bin/bash

# Exit on error
set -e

# Load environment variables if .env file exists
if [ -f .env ]; then
    source .env
fi

# Build the Docker image
docker build -t ai-server:prod -f infra/compose/ai-server.prod.Dockerfile .

# Run the container using docker compose
docker compose -f infra/compose/docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f

# Build and deploy
echo "Building and deploying AI server..."

# Pull latest changes if needed
if [ "$PULL_LATEST" = "true" ]; then
    echo "Pulling latest changes..."
    git pull
fi

# Build and start the services
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Wait for health check
echo "Waiting for service to be healthy..."
sleep 10

# Check if service is healthy
if curl -s -f http://localhost:8000/docs > /dev/null; then
    echo "Deployment successful! Service is healthy."
else
    echo "Warning: Service health check failed. Please check the logs."
    docker compose -f docker-compose.prod.yml logs ai-server
    exit 1
fi 