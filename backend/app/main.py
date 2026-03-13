"""
PureDrivePT — Backend FastAPI
Auto-hébergé, remplace Base44
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, drivers, vehicles, payments, loans, purchases, upi, fleet_managers, fleets, maintenance, documents, messages, reports, users

app = FastAPI(
    title="PureDrivePT API",
    description="Backend auto-hébergé — remplace Base44",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────
PREFIX = "/api"
app.include_router(auth.router,          prefix=f"{PREFIX}/auth",          tags=["Auth"])
app.include_router(users.router,         prefix=f"{PREFIX}/users",         tags=["Users"])
app.include_router(drivers.router,       prefix=f"{PREFIX}/drivers",       tags=["Drivers"])
app.include_router(vehicles.router,      prefix=f"{PREFIX}/vehicles",      tags=["Vehicles"])
app.include_router(payments.router,      prefix=f"{PREFIX}/payments",      tags=["Payments"])
app.include_router(loans.router,         prefix=f"{PREFIX}/loans",         tags=["Loans"])
app.include_router(purchases.router,     prefix=f"{PREFIX}/purchases",     tags=["Purchases"])
app.include_router(upi.router,           prefix=f"{PREFIX}/upi",           tags=["UPI"])
app.include_router(fleet_managers.router,prefix=f"{PREFIX}/fleet-managers",tags=["Fleet Managers"])
app.include_router(fleets.router,        prefix=f"{PREFIX}/fleets",        tags=["Fleets"])
app.include_router(maintenance.router,   prefix=f"{PREFIX}/maintenance",   tags=["Maintenance"])
app.include_router(documents.router,     prefix=f"{PREFIX}/documents",     tags=["Documents"])
app.include_router(messages.router,      prefix=f"{PREFIX}/messages",      tags=["Messages"])
app.include_router(reports.router,       prefix=f"{PREFIX}/reports",       tags=["Reports"])

# ── Fichiers uploadés ─────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "PureDrivePT"}
