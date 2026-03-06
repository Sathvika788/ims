# Intern Management System (IMS)

Complete production-ready full-stack application with FastAPI backend and React frontend.

## Tech Stack

### Backend
- Python + FastAPI + Uvicorn
- AWS DynamoDB (single-table design)
- AWS S3 for file uploads
- AWS SES for emails
- JWT authentication
- APScheduler for cron jobs

### Frontend
- React 18 + TypeScript + Vite
- React Router v6
- Axios with JWT interceptor
- Zustand for state management
- TanStack React Query
- Recharts for analytics
- Lucide React icons

## Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- AWS Account with:
  - IAM user with programmatic access
  - DynamoDB permissions
  - S3 bucket created
  - SES email verified

## Setup Instructions

### STEP 1 — Configure Environment Variables

1. Open `backend/.env`
2. Replace the following placeholders:

```env
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY      # Your IAM access key
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY  # Your IAM secret key
S3_BUCKET_NAME=ims-uploads                 # Your S3 bucket name
SES_SENDER_EMAIL=your@email.com            # Your SES-verified email
```

3. Generate a secure SECRET_KEY:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and replace `generate-with-python-secrets-token-hex-32` in `.env`

### STEP 2 — Backend Setup

Open Terminal 1:

```bash
cd backend
python -m venv venv
```

**Windows:**
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

Install dependencies and seed database:

```bash
pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload
```

Expected output:
```
[DynamoDB] Creating table 'IMS'...
[DynamoDB] Table 'IMS' created and ready ✓
[Seed] Creating initial users...
[Seed] ✓ Created ceo: ceo@company.com / Admin@1234
[Seed] ✓ Created manager: manager@company.com / Admin@1234
[Seed] ✓ Created intern: intern@company.com / Admin@1234
[Scheduler] Started — reminders at 5:45 PM weekdays ✓
INFO: Uvicorn running on http://127.0.0.1:8000
```

### STEP 3 — Frontend Setup

Open Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v5.0.8 ready in 500 ms
➜ Local: http://localhost:5173/
```

### STEP 4 — Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

**Login Credentials (created by seed.py):**

- **CEO:** `ceo@company.com` / `Admin@1234`
- **Manager:** `manager@company.com` / `Admin@1234`
- **Intern:** `intern@company.com` / `Admin@1234`

## Features

### Roles & Permissions

#### Intern
- Submit daily work logs with file uploads
- View and update task status
- Submit expense claims with receipts
- View stipend breakdowns
- Check attendance records

#### Manager
- Verify or reject intern daily logs
- Assign tasks to interns
- Approve or reject expense claims
- Generate invite links for interns
- Calculate monthly stipends
- Override attendance records
- View team analytics

#### CEO
- All manager permissions
- Generate invite links for managers too
- Calculate stipends for all interns at once
- View company-wide analytics dashboard
- Mark stipends as paid
- Access comprehensive charts and metrics

### Key Features

1. **Invite-Only Registration**
   - No public signup
   - Manager/CEO generates one-time invite codes
   - 72-hour expiry
   - Auto-login after registration

2. **Auto-Attendance**
   - Submitting daily log auto-marks attendance
   - Before 6 PM → "present"
   - After 6 PM → "late"
   - Manager can override any record

3. **Stipend Calculation**
   - Formula: base + approved_expenses + bonus - penalty
   - Base = days_present × daily_rate (₹500)
   - Preserves bonus/penalty on recalculation
   - Email notification sent to intern

4. **Daily Reminder Cron**
   - Runs Mon-Fri at 5:45 PM
   - Sends email to interns who haven't submitted logs
   - Powered by APScheduler

5. **File Uploads**
   - Work proofs and expense receipts to S3
   - Max 10MB, supports images/PDF/DOC
   - Returns public S3 URLs

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register with invite code
- `GET /api/auth/me` - Get current user
- `POST /api/auth/invites` - Create invite (manager+)
- `GET /api/auth/invites` - List my invites
- `GET /api/auth/invites/validate/{code}` - Validate invite

### Logs
- `POST /api/logs/submit` - Submit daily log (intern)
- `GET /api/logs/my-logs` - Get own logs
- `GET /api/logs/date/{date}` - Get logs by date (manager+)
- `POST /api/logs/{id}/verify` - Verify/reject log (manager+)

### Tasks
- `POST /api/tasks/` - Create task (manager+)
- `GET /api/tasks/my-tasks` - Get own tasks
- `PATCH /api/tasks/{id}/status` - Update status
- `DELETE /api/tasks/{id}` - Delete task (manager+)

### Expenses
- `POST /api/expenses/submit` - Submit expense (intern)
- `GET /api/expenses/my-expenses` - Get own expenses
- `GET /api/expenses/all` - Get all expenses (manager+)
- `POST /api/expenses/{id}/review` - Approve/reject (manager+)

### Stipends
- `GET /api/stipends/my-stipends` - Get own stipends
- `POST /api/stipends/calculate` - Calculate for one intern (manager+)
- `POST /api/stipends/calculate-all` - Calculate for all (CEO)
- `PATCH /api/stipends/{id}/{month}/adjust` - Adjust bonus/penalty (manager+)
- `PATCH /api/stipends/{id}/{month}/mark-paid` - Mark paid (CEO)

### Attendance
- `GET /api/attendance/my-attendance` - Get own records
- `POST /api/attendance/override` - Override attendance (manager+)
- `GET /api/attendance/date/{date}` - Get by date (manager+)

### Dashboard
- `GET /api/dashboard/intern/stats` - Intern stats
- `GET /api/dashboard/manager/stats` - Manager stats
- `GET /api/dashboard/ceo/analytics` - CEO analytics

## Database Schema (DynamoDB Single-Table)

**Table Name:** IMS  
**Keys:** PK (HASH), SK (RANGE)  
**GSI:** GSI1 with GSI1PK (HASH) + GSI1SK (RANGE)

Entity Patterns:
```
USER:       PK=USER#{id}       SK=PROFILE
EMAIL_IDX:  PK=EMAIL#{email}   SK=USER_ID
INVITE:     PK=INVITE#{code}   SK=INVITE
LOG:        PK=LOG#{intern_id} SK=DATE#{date}#ID#{id}
ATTENDANCE: PK=ATTENDANCE#{id} SK=DATE#{date}
TASK:       PK=TASK#{id}       SK=TASK
EXPENSE:    PK=EXPENSE#{id}    SK=EXPENSE
STIPEND:    PK=STIPEND#{id}    SK=MONTH#{YYYY-MM}
```

## Project Structure

```
ims/
├── backend/
│   ├── .env                    # Environment variables
│   ├── requirements.txt        # Python dependencies
│   ├── scripts/
│   │   └── seed.py            # Create initial users
│   └── app/
│       ├── main.py            # FastAPI app
│       ├── core/              # Config, security, JWT
│       ├── db/dynamo/         # DynamoDB repositories
│       ├── services/          # S3, SES, stipend, scheduler
│       └── api/routes/        # API endpoints
│
└── frontend/
    ├── package.json
    ├── vite.config.ts         # API proxy config
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx            # Routing
        ├── store/             # Zustand auth store
        ├── services/          # Axios instance
        ├── components/layout/ # Sidebar, PageShell
        └── pages/             # All page components
            ├── intern/
            ├── manager/
            └── ceo/
```

## Development Tips

### Reset Database
Delete the DynamoDB table and rerun seed.py:
```bash
python scripts/seed.py
```

### Add New User Manually
```python
from app.db.dynamo import user_repo
from app.core.security import get_password_hash

user_repo.create_user(
    email="new@user.com",
    password_hash=get_password_hash("password"),
    role="intern",  # or "manager" or "ceo"
    name="New User"
)
```

### Test Email Delivery
Ensure your SES sender email is verified in AWS Console.

### Debugging
- Backend logs: Check terminal running uvicorn
- Frontend logs: Browser console (F12)
- Database: Use AWS Console → DynamoDB → Tables → IMS

## Troubleshooting

**"Table 'IMS' already exists"**
- Normal if restarting backend, table persists

**401 Unauthorized**
- Token expired, logout and login again
- Check .env SECRET_KEY matches between restarts

**File upload fails**
- Check S3 bucket exists and permissions
- Verify bucket name in .env

**Email not sending**
- Verify SES sender email in AWS Console
- Check SES is out of sandbox mode for production

**Import errors in backend**
- Ensure all `__init__.py` files exist
- Activate virtual environment
- Reinstall requirements: `pip install -r requirements.txt`

## Production Deployment

1. **Backend**
   - Deploy to AWS EC2, ECS, or Lambda
   - Use environment variables for secrets
   - Enable HTTPS
   - Update CORS origins in `main.py`

2. **Frontend**
   - Build: `npm run build`
   - Deploy dist/ to S3 + CloudFront or Vercel
   - Update API proxy in production

3. **Security**
   - Rotate SECRET_KEY regularly
   - Use AWS Secrets Manager for credentials
   - Enable MFA on AWS account
   - Implement rate limiting
   - Add input validation

## License

MIT License - Free to use and modify

## Support

For issues or questions, contact the development team.
