# IMS Hosting - Quick Reference

## Your Setup
- **Application**: Intern Management System (React + FastAPI)
- **Hosting**: AWS EC2
- **Domain**: xetasolutions.in
- **Deployment Type**: Docker containerized (frontend + backend together)

---

## 🚀 Quick Start Commands

### Local Testing
```bash
cd frontend && npm run build && cd ..
docker-compose up -d
curl http://localhost:8000/health
```

### Deploy to AWS
```bash
# 1. SSH to EC2
ssh -i ims-aws-key.pem ubuntu@YOUR_ELASTIC_IP

# 2. Clone and deploy
cd /opt/ims
git clone <your-repo> .
nano .env.production  # Add AWS credentials
docker-compose up -d

# 3. Setup SSL
sudo certbot certonly --standalone -d xetasolutions.in -d www.xetasolutions.in

# 4. Configure Nginx
sudo cp deployment/nginx-default.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds Docker image (multi-stage: React build + FastAPI) |
| `docker-compose.yml` | Orchestrates containers locally |
| `.env.production` | Production environment variables |
| `deployment/` | All deployment scripts and guides |
| `backend/requirements.txt` | Updated with gunicorn for production |
| `backend/app/main.py` | Updated to serve frontend static files |

---

## 🏗️ Architecture

```
Your Domain (xetasolutions.in)
        ↓
    Route 53 DNS
        ↓
   Elastic IP (EC2)
        ↓
   Nginx (Port 443 SSL)
        ↓
   FastAPI Backend (Port 8000)
   ├─ Serves /api/* endpoints
   └─ Serves Frontend static files (React build)
        ↓
   AWS DynamoDB (Database)
```

---

## ⚙️ AWS Resources Needed

1. **EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.small (recommended)
   - 30GB storage
   - Security Group: ports 22, 80, 443

2. **Elastic IP**
   - Static IP for consistent access

3. **DynamoDB Table**
   - Table name: `IMS`
   - Already configured in codebase

4. **Route 53** (Domain DNS)
   - Add A records pointing to Elastic IP
   - Or use your DNS provider

5. **IAM Role**
   - EC2 instance needs DynamoDB access
   - Attach `DynamoDBFullAccess` policy

---

## 🔑 Environment Variables (Update These)

In `.env.production`:
```
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_secret
SECRET_KEY=generate-a-random-secret
SENDER_EMAIL=noreply@xetasolutions.in
```

---

## 📋 Deployment Steps (30 mins)

1. **Prepare** (5 min)
   - Build frontend: `npm run build` in `/frontend`
   
2. **EC2 Setup** (10 min)
   - Launch instance
   - Create security group
   - Get Elastic IP
   - Create IAM role
   
3. **Configure** (5 min)
   - Clone repo
   - Update `.env.production`
   - Update environment
   
4. **Deploy** (5 min)
   - Run: `docker-compose up -d`
   - Verify health: `curl http://localhost:8000/health`
   
5. **SSL & DNS** (5 min)
   - Get Let's Encrypt certificate
   - Update DNS records
   - Configure Nginx

---

## ✅ Verification Checklist

After deployment, verify:

```bash
# Health check
curl https://xetasolutions.in/health
# Expected: {"status":"healthy","service":"IMS API"}

# Frontend loads
curl https://xetasolutions.in/ | head -20
# Expected: HTML with React app

# API working
curl -X POST https://xetasolutions.in/api/auth/login
# Expected: JSON response or 422 (expected for empty POST)

# Check logs
docker-compose logs ims-app
# Expected: No errors in logs
```

---

## 📊 Estimated Costs

| Service | Cost |
|---------|------|
| EC2 t3.small | $8-10/mo |
| DynamoDB | $1-5/mo |
| Route 53 | $0.50/mo |
| Data transfer | $0-1/mo |
| **Total** | **~$10-20/mo** |

---

## 🔄 Updating Application

After initial deploy, to update:

```bash
# SSH to EC2
ssh -i ims-aws-key.pem ubuntu@YOUR_ELASTIC_IP

# Pull latest
cd /opt/ims
git pull origin main

# Redeploy
bash deployment/deploy.sh main
```

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| Docker won't start | Check logs: `docker-compose logs ims-app` |
| Port 8000 in use | Kill process: `lsof -ti:8000 \| xargs kill -9` |
| Domain not resolving | Update Route 53 A records to Elastic IP |
| SSL not working | Get certificate: `sudo certbot certonly --standalone -d xetasolutions.in` |
| Database not connecting | Check IAM role is attached to EC2 instance |
| Frontend not loading | Check frontend build: `/frontend/dist` should exist |

---

## 📚 Full Documentation

- **DEPLOYMENT_GUIDE.md** - Complete step-by-step guide (20 pages)
- **LOCAL_DOCKER_SETUP.md** - Test locally before deploying
- **aws-setup.sh** - Automated EC2 setup
- **deploy.sh** - Quick redeploy script

---

## 🎯 Next Immediate Actions

1. ✅ **Today**: Test locally with Docker
   ```bash
   cd frontend && npm run build && cd ..
   docker-compose up -d
   ```

2. ✅ **Tomorrow**: Launch EC2 & deploy
   - Create EC2 instance
   - Run deployment guide steps 3-5
   
3. ✅ **This week**: Point domain
   - Update DNS records
   - Get SSL certificate
   - Configure Nginx

---

**Your app will be live at: https://xetasolutions.in** 🚀
