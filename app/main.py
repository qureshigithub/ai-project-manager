from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import projects, tasks, reports, dashboard, agents, users, analytics, automation, auth

app = FastAPI(title="AI Project Manager")

# ============================================================
# 🔥 CORS MIDDLEWARE - Sab se zaroori!
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Sabhi methods (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"],  # Sabhi headers (Authorization, Content-Type)
)

# ============================================================
# ROUTES
# ============================================================
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(automation.router, prefix="/api/v1/automation", tags=["automation"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
def root():
    return {"message": "Welcome to AI Project Manager API"}

@app.get("/health")
def health():
    return {"status": "OK"}