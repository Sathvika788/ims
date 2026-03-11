# Local Docker Setup & Testing

Quick guide for testing the Docker deployment locally before pushing to AWS.

## Prerequisites

- Docker installed
- Docker Compose installed
- Node.js 18+ and npm (for building frontend)

## Quick Start

### 1. Build Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

This creates `/frontend/dist` with production-optimized static files.

### 2. Build & Run with Docker Compose

```bash
# Start the application (builds Docker image first)
docker-compose up -d

# View logs
docker-compose logs -f ims-app

# Check status
docker-compose ps
```

### 3. Test the Application

```bash
# Health check
curl http://localhost:8000/health

# Frontend access
open http://localhost:8000

# API test
curl http://localhost:8000/api/auth/login -X POST
```

### 4. Stop the Application

```bash
docker-compose down

# Also remove volumes
docker-compose down -v
```

## Docker Commands Reference

```bash
# View logs
docker-compose logs -f ims-app

# View service logs
docker-compose logs ims-app --tail 20

# Execute command in container
docker-compose exec ims-app python -m alembic upgrade head

# Rebuild image
docker-compose build --no-cache

# Run with specific env file
docker-compose --env-file .env.production up -d

# Check resource usage
docker stats

# Clean up everything
docker-compose down -v
```

## Environment Variables

Create `.env.docker` for local testing:

```env
ENVIRONMENT=development
DEBUG=true

# AWS (use dummy values for local testing)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy

# Database
DYNAMODB_TABLE_NAME=IMS
DYNAMODB_ENDPOINT=http://dynamodb-local:8000

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api

# Security
SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Email
SENDER_EMAIL=noreply@localhost
AWS_SES_REGION=us-east-1

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

Then run:
```bash
docker-compose --env-file .env.docker up -d
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in docker-compose.yml
```

### Application Won't Start

```bash
# Check logs
docker-compose logs ims-app

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### DynamoDB Connection Issues

```bash
# Test connection to local DynamoDB
docker-compose exec ims-app python -c "
from app.db.dynamo.client import dynamodb
print('Connected to DynamoDB')
"
```

### File Permissions

```bash
# Fix permissions
sudo chown -R $USER:$USER .
docker-compose down
docker-compose build
docker-compose up -d
```

## Production Build Test

To test the production Dockerfile locally:

```bash
# Build image
docker build -t ims:latest .

# Run container
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=dummy \
  -e AWS_SECRET_ACCESS_KEY=dummy \
  ims:latest

# Test
curl http://localhost:8000/health
```

## Next Steps

Once local testing passes:

1. Push changes to repository
2. SSH into AWS EC2 instance
3. Pull latest code: `git pull`
4. Run: `docker-compose up -d`
5. Verify at: https://xetasolutions.in

See `DEPLOYMENT_GUIDE.md` for full AWS setup instructions.
