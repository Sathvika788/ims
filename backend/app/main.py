from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.dynamo.client import bootstrap_table
from app.services.scheduler import start_scheduler
from app.api.routes import auth, logs, attendance, tasks, expenses, stipends, dashboard,leaves,wfh,projects,resignations, complaints

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    bootstrap_table()
    scheduler = start_scheduler()
    yield
    # Shutdown
    scheduler.shutdown()


app = FastAPI(
    title="Intern Management System",
    description="Complete IMS with FastAPI backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(stipends.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(leaves.router, prefix="/api")
app.include_router(wfh.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(resignations.router, prefix="/api")  # ADD
app.include_router(complaints.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Intern Management System API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
