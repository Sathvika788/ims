# IMS Deployment Guide - AWS Hosting

## Overview
This guide provides complete instructions for deploying the Intern Management System on AWS with your custom domain **xetasolutions.in**.

---

## Prerequisites

1. **AWS Account** - Already have one ✓
2. **Domain registered** - xetasolutions.in ✓
3. **AWS CLI installed** locally (optional, for easier management)
4. **Basic SSH knowledge** - to connect to EC2

---

## Step 1: Prepare for Deployment

### 1.1 Add Production Dependencies to Backend

The backend needs `gunicorn` for production. Update `backend/requirements.txt`:

```
Add these lines:
gunicorn==21.2.0
python-multipart==0.0.6
```

### 1.2 Build Frontend (Local Test First)

Before pushing to AWS, test the Docker build locally:

```bash
# From the IMS root directory
cd frontend
npm run build
cd ..
```

This creates `/frontend/dist` with all optimized static files.

---

## Step 2: AWS EC2 Setup

### 2.1 Launch EC2 Instance

1. Go to AWS Console → EC2 → Instances → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Instance type: **t3.small** (minimum recommended)
4. Storage: **30 GB** (gp3)
5. Security Group: Create new group with inbound rules:
   - Port 22 (SSH) - from your IP only
   - Port 80 (HTTP) - from 0.0.0.0/0
   - Port 443 (HTTPS) - from 0.0.0.0/0

6. Key Pair: Create and download (save as `ims-aws-key.pem`)

### 2.2 Elastic IP (Optional but Recommended)

Allocate an Elastic IP to keep the same IP address if instance restarts:
- EC2 Dashboard → Elastic IPs → Allocate
- Associate with your instance

---

## Step 3: Configure EC2 Instance

### 3.1 Connect via SSH

```bash
# Make key readable
chmod 400 ims-aws-key.pem

# SSH into instance (replace with your IP)
ssh -i ims-aws-key.pem ubuntu@your-elastic-ip
```

### 3.2 Run Setup Script

```bash
# Download and run the setup script
curl -O https://your-repo-url/deployment/aws-setup.sh
bash aws-setup.sh

# Or manually:
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose nginx git certbot python3-certbot-nginx
sudo usermod -aG docker ${USER}
```

---

## Step 4: Deploy Application

### 4.1 Clone Repository on EC2

```bash
# On EC2 instance
cd /opt
sudo mkdir -p ims
sudo chown ubuntu:ubuntu ims
cd ims

# Clone your repository
git clone <your-repo-url> .
# Or if using GitHub with SSH/token
```

### 4.2 Update Environment Variables

```bash
# Edit production environment file
nano .env.production

# Update these with your actual values:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_secret
SECRET_KEY=generate-a-random-secret-key
```

### 4.3 Build and Start Application

```bash
cd /opt/ims

# Build Docker image
docker-compose build

# Start application (runs in background)
docker-compose up -d

# Check logs
docker-compose logs -f ims-app

# Verify health
curl http://localhost:8000/health
```

---

## Step 5: Configure Domain & SSL

### 5.1 Point Domain to EC2 IP

Update your DNS provider or use Route 53:

1. **If using Route 53:**
   - AWS Console → Route 53 → Hosted Zones
   - Create hosted zone for `xetasolutions.in`
   - Add records:
     - Type A: `xetasolutions.in` → your Elastic IP
     - Type A: `www.xetasolutions.in` → your Elastic IP

2. **If using external DNS provider:**
   - Add A record: `xetasolutions.in` → your Elastic IP
   - Add A record: `www.xetasolutions.in` → your Elastic IP

### 5.2 Setup SSL Certificate (Let's Encrypt)

```bash
# On EC2 instance
sudo certbot certonly --standalone \
  -d xetasolutions.in \
  -d www.xetasolutions.in \
  -n --agree-tos --email your-email@example.com

# This creates certificates at:
# /etc/letsencrypt/live/xetasolutions.in/
```

### 5.3 Configure Nginx

```bash
# Copy nginx config
sudo cp /opt/ims/deployment/nginx-default.conf /etc/nginx/sites-available/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## Step 6: Configure DynamoDB Access

Your EC2 instance needs AWS permissions to access DynamoDB.

### 6.1 Create IAM Role

1. AWS Console → IAM → Roles → Create Role
2. Trusted identity: EC2
3. Permissions: Attach `DynamoDBFullAccess` (or create custom policy)
4. Name: `ims-dynamodb-role`

### 6.2 Attach Role to Instance

1. EC2 Console → Your instance → Security tab
2. Click "Modify IAM instance profile"
3. Select `ims-dynamodb-role`

---

## Step 7: Database Setup

### 7.1 Create DynamoDB Table

If you haven't already, create the IMS table in DynamoDB:

```bash
# Using AWS CLI
aws dynamodb create-table \
  --table-name IMS \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create GSI1
aws dynamodb update-table \
  --table-name IMS \
  --attribute-definitions \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --global-secondary-indexes '[...]' \
  --region us-east-1
```

---

## Step 8: Email Configuration (Optional but Recommended)

### 8.1 Set Up AWS SES

1. AWS Console → SES → Verified identities
2. Create identity for your domain `xetasolutions.in`
3. Add DKIM records to your DNS
4. Update `.env.production`:
   ```
   SENDER_EMAIL=noreply@xetasolutions.in
   AWS_SES_REGION=us-east-1
   ```

---

## Step 9: Verify Deployment

### 9.1 Test Application

```bash
# From your local machine
curl https://xetasolutions.in/health

# Should return:
# {"status":"healthy","service":"IMS API"}

# Test API
curl https://xetasolutions.in/api/auth/login -X POST
```

### 9.2 Access Application

Open browser and go to: **https://xetasolutions.in**

---

## Step 10: Monitoring & Maintenance

### 10.1 Check Application Logs

```bash
# On EC2 instance
cd /opt/ims
docker-compose logs -f ims-app
```

### 10.2 View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/ims_access.log

# Error logs
sudo tail -f /var/log/nginx/ims_error.log
```

### 10.3 Auto-renew SSL Certificate

```bash
# Test renewal (dry-run)
sudo certbot renew --dry-run

# Setup auto-renewal cron
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 10.4 Update Application

```bash
cd /opt/ims
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check Docker status
docker ps
docker-compose ps

# Check logs
docker-compose logs ims-app

# Verify environment variables
cat .env.production

# Test database connection
docker exec ims-app python -c "from app.db.dynamo.client import dynamodb; print('DB OK')"
```

### Domain Not Resolving

```bash
# Check DNS propagation
nslookup xetasolutions.in
dig xetasolutions.in

# Check Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID
```

### SSL Certificate Issues

```bash
# Check certificate validity
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

### Memory/Performance Issues

```bash
# Upgrade EC2 instance to t3.medium
# Increase Docker container resources in docker-compose.yml
# Monitor with: docker stats
```

---

## Cost Estimation (Monthly)

- EC2 t3.small: ~$8-10/month
- DynamoDB On-Demand: $1-5/month (varies by usage)
- Route 53: $0.50/month (per hosted zone)
- SES: ~$0.10 per email (usually free tier covers it)
- **Total: ~$10-20/month**

---

## Security Checklist

- [ ] Changed SECRET_KEY in .env.production
- [ ] AWS credentials are securely stored
- [ ] Security Group only allows necessary ports
- [ ] SSL certificates are active
- [ ] IAM role has minimal permissions
- [ ] Database backups enabled
- [ ] Regular updates scheduled

---

## Next Steps

1. Update your DNS to point to the Elastic IP
2. Get SSL certificate from Let's Encrypt
3. Configure Nginx reverse proxy
4. Monitor application performance
5. Set up automated backups

---

## Support & Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Docker Documentation](https://docs.docker.com/)

---

**Good luck with your deployment!** 🚀
