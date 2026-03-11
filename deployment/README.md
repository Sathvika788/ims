# IMS Deployment Documentation

Complete hosting setup for the Intern Management System on AWS.

## 📋 Files in This Directory

### Documentation
- **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment guide for AWS
- **LOCAL_DOCKER_SETUP.md** - How to test Docker locally before deploying

### Scripts
- **aws-setup.sh** - Automated EC2 instance setup script
- **deploy.sh** - Quick deployment/update script for EC2

### Configuration
- **nginx-default.conf** - Nginx reverse proxy configuration

## 🚀 Quick Deployment Steps

### Step 1: Local Testing (15 minutes)

```bash
cd /path/to/ims
cd frontend && npm run build && cd ..
docker-compose up -d
curl http://localhost:8000/health
```

See `LOCAL_DOCKER_SETUP.md` for details.

### Step 2: AWS Setup (30 minutes)

1. Launch EC2 instance (Ubuntu 22.04 LTS, t3.small)
2. Create Security Group with ports 22, 80, 443
3. Allocate Elastic IP
4. SSH into instance and run:

```bash
curl -O https://your-repo-url/deployment/aws-setup.sh
bash aws-setup.sh
```

### Step 3: Configure Domain (5 minutes)

Update your domain DNS to point to EC2 Elastic IP:
- A record: `xetasolutions.in` → Elastic IP
- A record: `www.xetasolutions.in` → Elastic IP

### Step 4: Deploy Application (10 minutes)

```bash
cd /opt/ims
git clone <your-repo-url> . # Or git pull if already cloned
nano .env.production  # Add AWS credentials
docker-compose up -d
```

### Step 5: Setup SSL (5 minutes)

```bash
sudo certbot certonly --standalone \
  -d xetasolutions.in \
  -d www.xetasolutions.in

sudo cp deployment/nginx-default.conf /etc/nginx/sites-available/default
sudo systemctl restart nginx
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         xetasolutions.in                    │
│    (Route 53 / Your DNS Provider)           │
└────────────────┬────────────────────────────┘
                 │
         HTTPS (Let's Encrypt)
                 │
┌─────────────────▼────────────────────────────┐
│            Nginx Reverse Proxy               │
│     (Handles SSL, routing, compression)      │
│              Port 443 → 80                   │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────┐
│         FastAPI Backend                      │
│    (Running in Docker container)             │
│         - API endpoints (/api/*)             │
│         - Serves frontend static files       │
│         - Handles ALL requests               │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────┐
│          AWS Services                        │
│   - DynamoDB (database)                      │
│   - SES (email)                              │
│   - IAM (permissions)                        │
└─────────────────────────────────────────────┘
```

## 📊 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI/UX |
| **Backend** | FastAPI + Uvicorn | API server |
| **Server** | Gunicorn | WSGI server (production) |
| **Reverse Proxy** | Nginx | Load balancing, SSL |
| **Database** | DynamoDB | Data storage |
| **Container** | Docker | App containerization |
| **Orchestration** | Docker Compose | Multi-container management |
| **Email** | AWS SES | Transactional emails |
| **DNS** | Route 53 / Your provider | Domain management |

## 🔒 Security Checklist

- [ ] EC2 Security Group restricts inbound traffic
- [ ] SSH key is stored securely (not in Git)
- [ ] .env.production is NOT in Git (use .gitignore)
- [ ] SSL certificates from Let's Encrypt (auto-renew enabled)
- [ ] DynamoDB table has proper IAM permissions
- [ ] SECRET_KEY is changed from default
- [ ] AWS credentials have minimal permissions
- [ ] Nginx security headers configured
- [ ] Database backups enabled
- [ ] Monitoring and alerts set up

## 🛠️ Maintenance Commands

### Deploy Updates

```bash
# SSH into EC2
ssh -i ims-aws-key.pem ubuntu@your-elastic-ip

# Deploy latest changes
cd /opt/ims
bash deployment/deploy.sh main
```

### View Logs

```bash
# Application logs
docker-compose logs -f ims-app

# Nginx logs
sudo tail -f /var/log/nginx/ims_access.log
sudo tail -f /var/log/nginx/ims_error.log
```

### SSL Certificate Renewal

```bash
# Auto-renewal setup (already done by aws-setup.sh)
sudo systemctl status certbot.timer

# Manual renewal
sudo certbot renew --force-renewal
```

### Database Backup

```bash
# DynamoDB: Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name IMS \
  --point-in-time-recovery-specification \
    PointInTimeRecoveryEnabled=true
```

## 📈 Scaling (Future)

When you need to scale:

1. **Horizontal Scaling**: Use AWS App Runner or ECS
2. **Database**: DynamoDB auto-scales on-demand
3. **CDN**: Add CloudFront for static assets
4. **Load Balancing**: Use Application Load Balancer
5. **Multi-region**: Deploy to multiple AWS regions

## 💰 Cost Breakdown

| Service | Cost/Month |
|---------|-----------|
| EC2 t3.small | $8-10 |
| DynamoDB (on-demand) | $1-5 |
| Route 53 (hosted zone) | $0.50 |
| Data transfer | $0-1 |
| **Total** | **~$10-20** |

## 🐛 Troubleshooting

See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting section.

Quick fixes:
```bash
# Application won't start
docker-compose logs ims-app

# Health check failing
curl http://localhost:8000/health -v

# Database connection issues
docker-compose exec ims-app python -c "from app.db.dynamo.client import dynamodb; print('OK')"

# Nginx not working
sudo nginx -t
sudo systemctl restart nginx
```

## 📚 Additional Resources

- [AWS EC2 Guide](https://docs.aws.amazon.com/ec2/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Docker Deployment Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

## ✅ Deployment Checklist

- [ ] Tested locally with Docker
- [ ] EC2 instance launched
- [ ] Security Group configured
- [ ] Domain DNS records updated
- [ ] .env.production file created with real credentials
- [ ] Application deployed to EC2
- [ ] SSL certificate obtained
- [ ] Nginx configured
- [ ] Health check passing
- [ ] Frontend accessible at https://xetasolutions.in
- [ ] Login working
- [ ] API endpoints responding
- [ ] Database operations working
- [ ] Email notifications working
- [ ] Monitoring and logs configured

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for step-by-step instructions.

**Ready to deploy?** Start with `LOCAL_DOCKER_SETUP.md` then follow `DEPLOYMENT_GUIDE.md`.
