"""
Routers génériques pour toutes les entités.
Chaque entité suit le même pattern CRUD REST :
  GET    /api/{entity}/          → liste (filtrable)
  POST   /api/{entity}/          → créer
  GET    /api/{entity}/{id}       → détail
  PUT    /api/{entity}/{id}       → mettre à jour
  DELETE /api/{entity}/{id}       → supprimer (admin)

Ce fichier contient TOUS les routers pour éviter la répétition.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from typing import Optional, List
import uuid, os, aiofiles
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_admin, require_admin_or_fm
from app.core.config import settings
from app.models.all_models import (
    User, Driver, Vehicle, FleetManager, Fleet, WeeklyPayment,
    Loan, VehiclePurchase, UPITransaction, Document,
    MaintenanceRecord, Conversation, Message, Notification
)

# ─── Drivers ─────────────────────────────────────────────────
router = APIRouter()

async def _paginate(model, db, skip=0, limit=50, filters=None):
    q = select(model)
    if filters:
        for col, val in filters.items():
            q = q.where(getattr(model, col) == val)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()

def _to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

# ═══════════════════ DRIVERS ROUTER ═══════════════════════════
drivers_router = APIRouter()

@drivers_router.get("/")
async def list_drivers(
    skip: int = 0, limit: int = 100,
    status: Optional[str] = None,
    fleet_manager_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    cu=Depends(get_current_user),
    current_user: User = Depends(get_current_user)
):
    q = select(Driver)
    if status:       q = q.where(Driver.status == status)
    if fleet_manager_id: q = q.where(Driver.fleet_manager_id == fleet_manager_id)
    # FM sees only their drivers
    if current_user.role == "fleet_manager":
        q = q.where(Driver.fleet_manager_id == current_user.linked_entity_id)
    result = await db.execute(q.offset(skip).limit(limit))
    drivers = result.scalars().all()
    return {"entities": [_to_dict(d) for d in drivers], "count": len(drivers)}

@drivers_router.get("/{driver_id}")
async def get_driver(driver_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    d = result.scalar_one_or_none()
    if not d: raise HTTPException(404, "Motorista não encontrado")
    return _to_dict(d)

@drivers_router.post("/", status_code=201)
async def create_driver(body: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin_or_fm)):
    body.pop("id", None)
    d = Driver(**body, created_by=current_user.email)
    db.add(d); await db.flush(); await db.refresh(d)
    return _to_dict(d)

@drivers_router.put("/{driver_id}")
async def update_driver(driver_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    d = result.scalar_one_or_none()
    if not d: raise HTTPException(404)
    for k, v in body.items():
        if hasattr(d, k) and k not in ("id", "created_date", "created_by"):
            setattr(d, k, v)
    db.add(d)
    return _to_dict(d)

@drivers_router.delete("/{driver_id}", status_code=204)
async def delete_driver(driver_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await db.execute(delete(Driver).where(Driver.id == driver_id))

# ═══════════════════ VEHICLES ROUTER ══════════════════════════
vehicles_router = APIRouter()

@vehicles_router.get("/")
async def list_vehicles(
    skip: int = 0, limit: int = 100,
    status: Optional[str] = None,
    fleet_manager_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    q = select(Vehicle)
    if status: q = q.where(Vehicle.status == status)
    if fleet_manager_id: q = q.where(Vehicle.fleet_manager_id == fleet_manager_id)
    result = await db.execute(q.offset(skip).limit(limit))
    vehs = result.scalars().all()
    return {"entities": [_to_dict(v) for v in vehs], "count": len(vehs)}

@vehicles_router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    v = result.scalar_one_or_none()
    if not v: raise HTTPException(404)
    return _to_dict(v)

@vehicles_router.post("/", status_code=201)
async def create_vehicle(body: dict, db: AsyncSession = Depends(get_db), cu=Depends(require_admin_or_fm)):
    body.pop("id", None)
    v = Vehicle(**body, created_by=cu.email)
    db.add(v); await db.flush(); await db.refresh(v)
    return _to_dict(v)

@vehicles_router.put("/{vehicle_id}")
async def update_vehicle(vehicle_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    v = result.scalar_one_or_none()
    if not v: raise HTTPException(404)
    for k, val in body.items():
        if hasattr(v, k) and k not in ("id","created_date"): setattr(v, k, val)
    db.add(v); return _to_dict(v)

@vehicles_router.delete("/{vehicle_id}", status_code=204)
async def delete_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await db.execute(delete(Vehicle).where(Vehicle.id == vehicle_id))

# ═══════════════════ PAYMENTS ROUTER ══════════════════════════
payments_router = APIRouter()

@payments_router.get("/")
async def list_payments(
    driver_id: Optional[str] = None,
    fleet_manager_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    q = select(WeeklyPayment)
    if driver_id: q = q.where(WeeklyPayment.driver_id == driver_id)
    if fleet_manager_id: q = q.where(WeeklyPayment.fleet_manager_id == fleet_manager_id)
    if status: q = q.where(WeeklyPayment.status == status)
    if current_user.role == "driver":
        q = q.where(WeeklyPayment.driver_id == current_user.linked_entity_id)
    result = await db.execute(q.order_by(WeeklyPayment.week_start.desc()).offset(skip).limit(limit))
    pays = result.scalars().all()
    return {"entities": [_to_dict(p) for p in pays], "count": len(pays)}

@payments_router.post("/", status_code=201)
async def create_payment(body: dict, db: AsyncSession = Depends(get_db), cu=Depends(require_admin_or_fm)):
    body.pop("id", None)
    # Auto-calc UPI 4%
    total_gross = (body.get("uber_gross", 0) or 0) + (body.get("bolt_gross", 0) or 0) + (body.get("other_platform_gross", 0) or 0)
    body["total_gross"] = total_gross
    if not body.get("upi_earned"):
        body["upi_earned"] = round(total_gross * 0.04, 2)
    p = WeeklyPayment(**body, created_by=cu.email)
    db.add(p); await db.flush(); await db.refresh(p)
    # Update driver UPI balance
    if body.get("upi_earned", 0) > 0 and body.get("driver_id"):
        upi_tx = UPITransaction(
            driver_id=body["driver_id"],
            driver_name=body.get("driver_name"),
            type="earned",
            amount=body["upi_earned"],
            source="weekly_payment",
            week_label=body.get("period_label"),
            processed_by="system"
        )
        db.add(upi_tx)
        result = await db.execute(select(Driver).where(Driver.id == body["driver_id"]))
        driver = result.scalar_one_or_none()
        if driver:
            driver.upi_balance = (driver.upi_balance or 0) + body["upi_earned"]
            db.add(driver)
    return _to_dict(p)

@payments_router.put("/{payment_id}")
async def update_payment(payment_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    result = await db.execute(select(WeeklyPayment).where(WeeklyPayment.id == payment_id))
    p = result.scalar_one_or_none()
    if not p: raise HTTPException(404)
    for k, v in body.items():
        if hasattr(p, k) and k not in ("id","created_date"): setattr(p, k, v)
    db.add(p); return _to_dict(p)

@payments_router.delete("/{payment_id}", status_code=204)
async def delete_payment(payment_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    await db.execute(delete(WeeklyPayment).where(WeeklyPayment.id == payment_id))

# ═══════════════════ LOANS ROUTER ═════════════════════════════
loans_router = APIRouter()

@loans_router.get("/")
async def list_loans(
    driver_id: Optional[str] = None, status: Optional[str] = None,
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    q = select(Loan)
    if driver_id: q = q.where(Loan.driver_id == driver_id)
    if status: q = q.where(Loan.status == status)
    if current_user.role == "driver":
        q = q.where(Loan.driver_id == current_user.linked_entity_id)
    result = await db.execute(q.order_by(Loan.request_date.desc()).offset(skip).limit(limit))
    loans = result.scalars().all()
    return {"entities": [_to_dict(l) for l in loans], "count": len(loans)}

@loans_router.post("/", status_code=201)
async def create_loan(body: dict, db: AsyncSession = Depends(get_db), cu=Depends(get_current_user)):
    body.pop("id", None)
    amt = body.get("amount", 0)
    weeks = body.get("duration_weeks", 4)
    body["total_with_interest"] = round(amt * (1 + 0.01 * weeks), 2)
    body["weekly_installment"]  = round(body["total_with_interest"] / weeks, 2)
    body["remaining_balance"]   = body["total_with_interest"]
    body["request_date"]        = datetime.now().strftime("%Y-%m-%d")
    l = Loan(**body)
    db.add(l); await db.flush(); await db.refresh(l)
    return _to_dict(l)

@loans_router.put("/{loan_id}/approve")
async def approve_loan(loan_id: str, db: AsyncSession = Depends(get_db), cu=Depends(require_admin)):
    result = await db.execute(select(Loan).where(Loan.id == loan_id))
    l = result.scalar_one_or_none()
    if not l: raise HTTPException(404)
    l.status = "active"
    l.approval_date = datetime.now().strftime("%Y-%m-%d")
    l.approved_by = cu.email
    db.add(l); return _to_dict(l)

@loans_router.put("/{loan_id}/reject")
async def reject_loan(loan_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Loan).where(Loan.id == loan_id))
    l = result.scalar_one_or_none()
    if not l: raise HTTPException(404)
    l.status = "rejected"
    db.add(l); return _to_dict(l)

@loans_router.put("/{loan_id}")
async def update_loan(loan_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(Loan).where(Loan.id == loan_id))
    l = result.scalar_one_or_none()
    if not l: raise HTTPException(404)
    for k, v in body.items():
        if hasattr(l, k) and k not in ("id","created_date"): setattr(l, k, v)
    db.add(l); return _to_dict(l)

# ═══════════════════ PURCHASES ROUTER ═════════════════════════
purchases_router = APIRouter()

@purchases_router.get("/")
async def list_purchases(
    driver_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    q = select(VehiclePurchase)
    if driver_id: q = q.where(VehiclePurchase.driver_id == driver_id)
    if current_user.role == "driver":
        q = q.where(VehiclePurchase.driver_id == current_user.linked_entity_id)
    result = await db.execute(q)
    return {"entities": [_to_dict(p) for p in result.scalars().all()]}

@purchases_router.post("/", status_code=201)
async def create_purchase(body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    body.pop("id", None)
    body["total_price"] = round((body.get("base_price", 0) or 0) * 1.25, 2)
    p = VehiclePurchase(**body)
    db.add(p); await db.flush(); await db.refresh(p)
    return _to_dict(p)

@purchases_router.put("/{purchase_id}/approve")
async def approve_purchase(purchase_id: str, db: AsyncSession = Depends(get_db), cu=Depends(require_admin)):
    result = await db.execute(select(VehiclePurchase).where(VehiclePurchase.id == purchase_id))
    p = result.scalar_one_or_none()
    if not p: raise HTTPException(404)
    p.status = "active"
    p.start_date = datetime.now().strftime("%Y-%m-%d")
    p.approved_by = cu.email
    db.add(p); return _to_dict(p)

# ═══════════════════ UPI ROUTER ═══════════════════════════════
upi_router = APIRouter()

@upi_router.get("/transactions")
async def list_upi_transactions(
    driver_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    q = select(UPITransaction)
    if driver_id: q = q.where(UPITransaction.driver_id == driver_id)
    if current_user.role == "driver":
        q = q.where(UPITransaction.driver_id == current_user.linked_entity_id)
    result = await db.execute(q.order_by(UPITransaction.created_date.desc()))
    return {"entities": [_to_dict(t) for t in result.scalars().all()]}

@upi_router.post("/adjust")
async def adjust_upi(body: dict, db: AsyncSession = Depends(get_db), cu=Depends(require_admin)):
    """Admin: crédit/débit manuel UPI d'un motoriste"""
    driver_id = body.get("driver_id")
    amount    = body.get("amount", 0)
    upi_type  = body.get("type", "credit")
    result    = await db.execute(select(Driver).where(Driver.id == driver_id))
    driver    = result.scalar_one_or_none()
    if not driver: raise HTTPException(404, "Motoriste introuvable")
    if upi_type == "credit":
        driver.upi_balance = (driver.upi_balance or 0) + amount
    else:
        driver.upi_balance = max(0, (driver.upi_balance or 0) - amount)
    tx = UPITransaction(driver_id=driver_id, driver_name=driver.full_name,
                         type=upi_type, amount=amount,
                         notes=body.get("notes"), processed_by=cu.email)
    db.add(driver); db.add(tx)
    return {"upi_balance": driver.upi_balance}

# ═══════════════════ FLEET MANAGERS ROUTER ════════════════════
fm_router = APIRouter()

@fm_router.get("/")
async def list_fm(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(FleetManager))
    return {"entities": [_to_dict(fm) for fm in result.scalars().all()]}

@fm_router.get("/{fm_id}")
async def get_fm(fm_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(FleetManager).where(FleetManager.id == fm_id))
    fm = result.scalar_one_or_none()
    if not fm: raise HTTPException(404)
    return _to_dict(fm)

@fm_router.post("/", status_code=201)
async def create_fm(body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    body.pop("id", None)
    fm = FleetManager(**body)
    db.add(fm); await db.flush(); await db.refresh(fm)
    return _to_dict(fm)

@fm_router.put("/{fm_id}")
async def update_fm(fm_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(FleetManager).where(FleetManager.id == fm_id))
    fm = result.scalar_one_or_none()
    if not fm: raise HTTPException(404)
    for k, v in body.items():
        if hasattr(fm, k) and k not in ("id","created_date"): setattr(fm, k, v)
    db.add(fm); return _to_dict(fm)

# ═══════════════════ FLEETS ROUTER ════════════════════════════
fleets_router = APIRouter()

@fleets_router.get("/")
async def list_fleets(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Fleet))
    return {"entities": [_to_dict(f) for f in result.scalars().all()]}

@fleets_router.post("/", status_code=201)
async def create_fleet(body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    body.pop("id", None)
    f = Fleet(**body); db.add(f); await db.flush(); await db.refresh(f)
    return _to_dict(f)

@fleets_router.put("/{fleet_id}")
async def update_fleet(fleet_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    result = await db.execute(select(Fleet).where(Fleet.id == fleet_id))
    f = result.scalar_one_or_none()
    if not f: raise HTTPException(404)
    for k, v in body.items():
        if hasattr(f, k) and k not in ("id","created_date"): setattr(f, k, v)
    db.add(f); return _to_dict(f)

# ═══════════════════ MAINTENANCE ROUTER ═══════════════════════
maint_router = APIRouter()

@maint_router.get("/")
async def list_maintenance(
    vehicle_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    q = select(MaintenanceRecord)
    if vehicle_id: q = q.where(MaintenanceRecord.vehicle_id == vehicle_id)
    result = await db.execute(q.order_by(MaintenanceRecord.service_date.desc()))
    return {"entities": [_to_dict(r) for r in result.scalars().all()]}

@maint_router.post("/", status_code=201)
async def create_maint(body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    body.pop("id", None)
    r = MaintenanceRecord(**body); db.add(r); await db.flush(); await db.refresh(r)
    return _to_dict(r)

@maint_router.put("/{record_id}")
async def update_maint(record_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    result = await db.execute(select(MaintenanceRecord).where(MaintenanceRecord.id == record_id))
    r = result.scalar_one_or_none()
    if not r: raise HTTPException(404)
    for k, v in body.items():
        if hasattr(r, k) and k not in ("id","created_date"): setattr(r, k, v)
    db.add(r); return _to_dict(r)

# ═══════════════════ DOCUMENTS ROUTER ═════════════════════════
docs_router = APIRouter()

@docs_router.get("/")
async def list_docs(
    owner_id: Optional[str] = None, status: Optional[str] = None,
    db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    q = select(Document)
    if owner_id: q = q.where(Document.owner_id == owner_id)
    if status:   q = q.where(Document.status == status)
    result = await db.execute(q.order_by(Document.created_date.desc()))
    return {"entities": [_to_dict(d) for d in result.scalars().all()]}

@docs_router.post("/", status_code=201)
async def create_doc(body: dict, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    body.pop("id", None)
    d = Document(**body); db.add(d); await db.flush(); await db.refresh(d)
    return _to_dict(d)

@docs_router.put("/{doc_id}/approve")
async def approve_doc(doc_id: str, db: AsyncSession = Depends(get_db), cu=Depends(require_admin)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    d = result.scalar_one_or_none()
    if not d: raise HTTPException(404)
    d.status = "approved"; d.approved_by = cu.email
    db.add(d); return _to_dict(d)

@docs_router.put("/{doc_id}/reject")
async def reject_doc(doc_id: str, body: dict, db: AsyncSession = Depends(get_db), cu=Depends(require_admin)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    d = result.scalar_one_or_none()
    if not d: raise HTTPException(404)
    d.status = "rejected"; d.rejection_reason = body.get("reason"); d.approved_by = cu.email
    db.add(d); return _to_dict(d)

@docs_router.post("/upload")
async def upload_file(file: UploadFile = File(...), cu=Depends(get_current_user)):
    if file.size and file.size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, "Fichier trop grand")
    ext  = os.path.splitext(file.filename or "")[1]
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, name)
    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)
    return {"url": f"/uploads/{name}"}

# ═══════════════════ MESSAGES ROUTER ══════════════════════════
messages_router = APIRouter()

@messages_router.get("/conversations")
async def list_conversations(db: AsyncSession = Depends(get_db), cu=Depends(get_current_user)):
    q = select(Conversation)
    result = await db.execute(q.order_by(Conversation.updated_date.desc()))
    convs = result.scalars().all()
    if cu.role not in ("admin",):
        convs = [c for c in convs if cu.email in (c.participants or [])]
    return {"entities": [_to_dict(c) for c in convs]}

@messages_router.post("/conversations", status_code=201)
async def create_conversation(body: dict, db: AsyncSession = Depends(get_db), cu=Depends(get_current_user)):
    body.pop("id", None); body["created_by"] = cu.email
    if cu.email not in (body.get("participants") or []):
        body.setdefault("participants", []).append(cu.email)
    c = Conversation(**body); db.add(c); await db.flush(); await db.refresh(c)
    return _to_dict(c)

@messages_router.get("/conversations/{conv_id}/messages")
async def list_messages(conv_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(Message).where(Message.conversation_id == conv_id).order_by(Message.created_date)
    )
    return {"entities": [_to_dict(m) for m in result.scalars().all()]}

@messages_router.post("/conversations/{conv_id}/messages", status_code=201)
async def send_message(conv_id: str, body: dict, db: AsyncSession = Depends(get_db), cu=Depends(get_current_user)):
    m = Message(
        conversation_id=conv_id,
        sender_id=cu.email,
        sender_name=cu.full_name,
        sender_role=cu.role,
        content=body.get("content", ""),
        read_by=[cu.email]
    )
    db.add(m)
    # Update conversation last_message
    result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = result.scalar_one_or_none()
    if conv:
        conv.last_message = body.get("content", "")
        conv.last_message_at = datetime.now().isoformat()
        db.add(conv)
    await db.flush(); await db.refresh(m)
    return _to_dict(m)

# ═══════════════════ REPORTS ROUTER ═══════════════════════════
reports_router = APIRouter()

@reports_router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    from sqlalchemy import text
    r = await db.execute(text("""
        SELECT
          COUNT(DISTINCT driver_id) as active_drivers,
          SUM(total_gross) as total_gross,
          SUM(net_amount) as total_net,
          SUM(vehicle_rental) as total_rental,
          SUM(upi_earned) as total_upi,
          SUM(irs_retention) as total_irs,
          SUM(iva_amount) as total_iva
        FROM weekly_payments
        WHERE status != 'draft'
    """))
    row = r.fetchone()
    return {
        "active_drivers":  row[0] or 0,
        "total_gross":     float(row[1] or 0),
        "total_net":       float(row[2] or 0),
        "total_rental":    float(row[3] or 0),
        "total_upi":       float(row[4] or 0),
        "total_irs":       float(row[5] or 0),
        "total_iva":       float(row[6] or 0),
    }

@reports_router.get("/weekly")
async def get_weekly_stats(db: AsyncSession = Depends(get_db), _=Depends(require_admin_or_fm)):
    from sqlalchemy import text
    r = await db.execute(text("""
        SELECT week_start, SUM(total_gross), SUM(net_amount), COUNT(*)
        FROM weekly_payments
        GROUP BY week_start ORDER BY week_start DESC LIMIT 12
    """))
    return {"weeks": [{"week_start": str(row[0]), "gross": float(row[1] or 0), "net": float(row[2] or 0), "payments": row[3]} for row in r.fetchall()]}

# ═══════════════════ USERS ROUTER ═════════════════════════════
users_router = APIRouter()

@users_router.get("/")
async def list_users(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return {"entities": [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "is_active": u.is_active} for u in users]}

@users_router.post("/", status_code=201)
async def create_user(body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    from app.core.security import hash_password
    result = await db.execute(select(User).where(User.email == body["email"]))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email déjà utilisé")
    u = User(
        email=body["email"],
        full_name=body.get("full_name"),
        hashed_password=hash_password(body.get("password", "changeme123")),
        role=body.get("role", "driver"),
        linked_entity_id=body.get("linked_entity_id"),
    )
    db.add(u); await db.flush(); await db.refresh(u)
    return {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role}

@users_router.put("/{user_id}/toggle-active")
async def toggle_user(user_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    u = result.scalar_one_or_none()
    if not u: raise HTTPException(404)
    u.is_active = not u.is_active
    db.add(u); return {"is_active": u.is_active}

# Register all routers
router = APIRouter()


# ── PATCHES ADDITIONNELS ──────────────────────────────────────────────────────

# DELETE loan
@loans_router.delete("/{loan_id}", status_code=204)
async def delete_loan(loan_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    loan = await db.get(Loan, loan_id)
    if not loan: raise HTTPException(404, "Empréstimo não encontrado")
    await db.delete(loan); await db.commit()

# DELETE + UPDATE user
@users_router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db), cu=Depends(require_admin)):
    if user_id == cu.id: raise HTTPException(400, "Não pode apagar a sua própria conta")
    u = await db.get(User, user_id)
    if not u: raise HTTPException(404)
    await db.delete(u); await db.commit()

@users_router.put("/{user_id}")
async def update_user(user_id: str, body: dict, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    u = await db.get(User, user_id)
    if not u: raise HTTPException(404)
    for k, v in body.items():
        if k == "password" and v:
            from app.core.security import get_password_hash
            u.hashed_password = get_password_hash(v)
        elif k not in ("id", "created_date", "hashed_password"):
            setattr(u, k, v)
    await db.commit(); await db.refresh(u); return _to_dict(u)

# DELETE + UPDATE fleet manager
@fm_router.delete("/{fm_id}", status_code=204)
async def delete_fm(fm_id: str, db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    fm = await db.get(FleetManager, fm_id)
    if not fm: raise HTTPException(404)
    await db.delete(fm); await db.commit()

# Support conversation (driver → admin)
from sqlalchemy import select as sa_select
@messages_router.post("/support-conversation")
async def get_or_create_support(db: AsyncSession = Depends(get_db), cu=Depends(get_current_user)):
    # Chercher conversation existante avec le mot "Support" pour cet user
    q = await db.execute(
        sa_select(Conversation).where(
            Conversation.title.ilike(f"%{cu.full_name}%Support%") |
            Conversation.title.ilike(f"%Support%{cu.full_name}%")
        )
    )
    conv = q.scalars().first()
    if not conv:
        # Trouver un admin
        admin_q = await db.execute(sa_select(User).where(User.role == "admin").limit(1))
        admin = admin_q.scalars().first()
        conv = Conversation(
            id=str(__import__('uuid').uuid4()),
            title=f"{cu.full_name} — Support",
            created_by=cu.id
        )
        db.add(conv)
        # Ajouter participants
        for uid in [cu.id] + ([admin.id] if admin else []):
            db.add(ConversationParticipant(conversation_id=conv.id, user_id=uid))
        await db.commit(); await db.refresh(conv)
    return _to_dict(conv)
