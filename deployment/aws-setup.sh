#!/bin/bash

# AWS EC2 Setup Script for IMS
# Run this on a fresh Ubuntu 22.04 EC2 instance
# Usage: bash aws-setup.sh

set -e

echo "============================================"
echo "IMS Application - AWS EC2 Setup"
echo "============================================"

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ${USER}

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "Installing Git..."
sudo apt-get install -y git

# Install Nginx (reverse proxy)
echo "Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create app directory
echo "Creating app directory..."
sudo mkdir -p /opt/ims
sudo chown ${USER}:${USER} /opt/ims

# Clone repository (if using git)
echo "Cloning repository..."
cd /opt/ims
git clone <your-repo-url> . || echo "Update with your repository URL"

# Create environment file
echo "Creating environment file..."
cat > /opt/ims/.env.production << 'EOF'
ENVIRONMENT=production
DEBUG=false

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Database
DYNAMODB_TABLE_NAME=IMS
DYNAMODB_ENDPOINT=https://dynamodb.us-east-1.amazonaws.com

# Frontend
VITE_API_BASE_URL=https://xetasolutions.in/api

# Security
SECRET_KEY=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Email
SENDER_EMAIL=noreply@xetasolutions.in
AWS_SES_REGION=us-east-1

# CORS
CORS_ORIGINS=https://xetasolutions.in,https://www.xetasolutions.in

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
EOF

echo ""
echo "============================================"
echo "Setup Complete! Manual steps required:"
echo "============================================"
echo ""
echo "1. Edit .env.production with your AWS credentials:"
echo "   nano /opt/ims/.env.production"
echo ""
echo "2. Update the Nginx configuration:"
echo "   sudo nano /etc/nginx/sites-available/default"
echo ""
echo "3. Build and start the application:"
echo "   cd /opt/ims"
echo "   docker-compose up -d"
echo ""
echo "4. Set up SSL with Certbot:"
echo "   sudo apt-get install -y certbot python3-certbot-nginx"
echo "   sudo certbot certonly --standalone -d xetasolutions.in -d www.xetasolutions.in"
echo ""
echo "5. Update Route 53 DNS records to point to this EC2 instance"
echo ""
echo "============================================"
