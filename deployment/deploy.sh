#!/bin/bash

# IMS Deploy Script - For EC2 instance
# Run this script on your EC2 to deploy/update the application
# Usage: bash deploy.sh [branch-name]

set -e

DEPLOY_DIR="/opt/ims"
BRANCH=${1:-main}

echo "============================================"
echo "IMS Deployment Script"
echo "============================================"
echo "Branch: $BRANCH"
echo "Directory: $DEPLOY_DIR"
echo ""

# Check if directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "Error: Deploy directory not found at $DEPLOY_DIR"
    exit 1
fi

cd $DEPLOY_DIR

# Stop current application
echo "Stopping current application..."
docker-compose down

# Pull latest code
echo "Pulling latest code from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Rebuild Docker image
echo "Building Docker image..."
docker-compose build

# Start new application
echo "Starting application..."
docker-compose up -d

# Wait for application to start
echo "Waiting for application to be ready..."
sleep 5

# Check health
echo "Checking health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo ""
    echo "✓ Deployment successful!"
    echo "✓ Application is healthy"
    echo ""
else
    echo ""
    echo "✗ Health check failed"
    echo "Checking logs..."
    docker-compose logs ims-app | tail -20
    exit 1
fi

# Show status
echo "Application status:"
docker-compose ps

echo ""
echo "Deployment complete! Application is live at https://xetasolutions.in"
echo ""
echo "Recent logs (last 10 lines):"
docker-compose logs --tail=10 ims-app
