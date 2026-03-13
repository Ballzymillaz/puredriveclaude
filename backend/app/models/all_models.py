"""
Models SQLAlchemy — miroir exact des entités Base44
"""
from sqlalchemy import (
    Column, String, Float, Boolean, DateTime, Text, Integer,
    ForeignKey, ARRAY, Enum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum, uuid

def gen_id():
    return str(uuid.uuid4()).replace("-", "")[:24]

# ── Enums ─────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    admin = "admin"
    fleet_manager = "fleet_manager"
    driver = "driver"

class DriverStatus(str, enum.Enum):
    active = "active"
    pending = "pending"
    inactive = "inactive"
    evaluation = "evaluation"
    suspended = "suspended"

class ContractType(str, enum.Enum):
    slot_standard = "slot_standard"
    slot_premium = "slot_premium"
    slot_black = "slot_black"
    location = "location"

class VehicleStatus(str, enum.Enum):
    available = "available"
    assigned = "assigned"
    alugado = "alugado"
    maintenance = "maintenance"
    inactive = "inactive"

class PaymentStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    paid = "paid"

class LoanStatus(str, enum.Enum):
    requested = "requested"
    approved = "approved"
    active = "active"
    completed = "completed"
    rejected = "rejected"

class DocumentStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    expired = "expired"
    requested = "requested"

# ── User ──────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id            = Column(String(24), primary_key=True, default=gen_id)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    full_name     = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    role          = Column(Enum(UserRole), default=UserRole.driver)
    is_active     = Column(Boolean, default=True)
    is_verified   = Column(Boolean, default=False)
    phone         = Column(String(50))
    profile_photo_url = Column(String(500))
    linked_entity_id  = Column(String(24))  # driver_id or fleet_manager_id
    created_date  = Column(DateTime(timezone=True), server_default=func.now())
    updated_date  = Column(DateTime(timezone=True), onupdate=func.now())

# ── Driver ────────────────────────────────────────────────────
class Driver(Base):
    __tablename__ = "drivers"
    id                    = Column(String(24), primary_key=True, default=gen_id)
    full_name             = Column(String(255), nullable=False)
    email                 = Column(String(255), nullable=False, index=True)
    phone                 = Column(String(50))
    nif                   = Column(String(20))
    address               = Column(Text)
    date_of_birth         = Column(String(20))
    status                = Column(Enum(DriverStatus), default=DriverStatus.pending)
    contract_type         = Column(Enum(ContractType))
    slot_fee              = Column(Float, default=0)
    commission_rate       = Column(Float, default=20)
    assigned_vehicle_id   = Column(String(24))
    assigned_vehicle_plate= Column(String(20))
    fleet_id              = Column(String(24))
    fleet_manager_id      = Column(String(24))
    fleet_manager_name    = Column(String(255))
    commercial_id         = Column(String(24))
    commercial_name       = Column(String(255))
    referred_by           = Column(String(50))
    iva_regime            = Column(String(20), default="exempt")
    irs_retention_rate    = Column(Float)
    vehicle_deposit       = Column(Float, default=500)
    vehicle_deposit_paid  = Column(Boolean, default=False)
    iban                  = Column(String(50))
    uber_uuid             = Column(String(100))
    bolt_id               = Column(String(100))
    upi_balance           = Column(Float, default=0)
    profile_photo_url     = Column(String(500))
    notes                 = Column(Text)
    start_date            = Column(String(20))
    user_id               = Column(String(24))
    created_date          = Column(DateTime(timezone=True), server_default=func.now())
    updated_date          = Column(DateTime(timezone=True), onupdate=func.now())
    created_by            = Column(String(255))

# ── Vehicle ───────────────────────────────────────────────────
class Vehicle(Base):
    __tablename__ = "vehicles"
    id                      = Column(String(24), primary_key=True, default=gen_id)
    brand                   = Column(String(100), nullable=False)
    model                   = Column(String(100), nullable=False)
    first_registration_date = Column(String(20))
    license_plate           = Column(String(20), nullable=False, unique=True)
    color                   = Column(String(50))
    vin                     = Column(String(50))
    status                  = Column(Enum(VehicleStatus), default=VehicleStatus.available)
    assigned_driver_id      = Column(String(24))
    assigned_driver_name    = Column(String(255))
    fleet_id                = Column(String(24))
    fleet_manager_id        = Column(String(24))
    weekly_rental_price     = Column(Float)
    base_purchase_price     = Column(Float)
    market_price            = Column(Float)
    fuel_type               = Column(String(20))
    mileage                 = Column(Float)
    insurance_expiry        = Column(String(20))
    inspection_expiry       = Column(String(20))
    photo_url               = Column(String(500))
    notes                   = Column(Text)
    created_date            = Column(DateTime(timezone=True), server_default=func.now())
    updated_date            = Column(DateTime(timezone=True), onupdate=func.now())
    created_by              = Column(String(255))

# ── FleetManager ──────────────────────────────────────────────
class FleetManager(Base):
    __tablename__ = "fleet_managers"
    id              = Column(String(24), primary_key=True, default=gen_id)
    full_name       = Column(String(255), nullable=False)
    email           = Column(String(255), nullable=False, unique=True)
    phone           = Column(String(50))
    nif             = Column(String(20))
    iban            = Column(String(50))
    status          = Column(String(20), default="pending")
    referral_code   = Column(String(50), unique=True)
    total_drivers   = Column(Integer, default=0)
    total_earnings  = Column(Float, default=0)
    profile_photo_url = Column(String(500))
    notes           = Column(Text)
    user_id         = Column(String(24))
    created_date    = Column(DateTime(timezone=True), server_default=func.now())
    updated_date    = Column(DateTime(timezone=True), onupdate=func.now())

# ── Fleet ─────────────────────────────────────────────────────
class Fleet(Base):
    __tablename__ = "fleets"
    id                = Column(String(24), primary_key=True, default=gen_id)
    name              = Column(String(255), nullable=False)
    description       = Column(Text)
    fleet_manager_id  = Column(String(24))
    fleet_manager_name= Column(String(255))
    vehicle_ids       = Column(JSON, default=list)
    driver_ids        = Column(JSON, default=list)
    status            = Column(String(20), default="active")
    upi_enabled       = Column(Boolean, default=True)
    notes             = Column(Text)
    created_date      = Column(DateTime(timezone=True), server_default=func.now())
    updated_date      = Column(DateTime(timezone=True), onupdate=func.now())

# ── WeeklyPayment ─────────────────────────────────────────────
class WeeklyPayment(Base):
    __tablename__ = "weekly_payments"
    id                          = Column(String(24), primary_key=True, default=gen_id)
    driver_id                   = Column(String(24), nullable=False, index=True)
    driver_name                 = Column(String(255))
    fleet_manager_id            = Column(String(24))
    week_start                  = Column(String(20), nullable=False)
    week_end                    = Column(String(20))
    period_label                = Column(String(100))
    uber_gross                  = Column(Float, default=0)
    bolt_gross                  = Column(Float, default=0)
    other_platform_gross        = Column(Float, default=0)
    total_gross                 = Column(Float, default=0)
    commission_amount           = Column(Float, default=0)
    slot_fee                    = Column(Float, default=0)
    vehicle_rental              = Column(Float, default=0)
    via_verde_amount            = Column(Float, default=0)
    myprio_amount               = Column(Float, default=0)
    miio_amount                 = Column(Float, default=0)
    loan_installment            = Column(Float, default=0)
    vehicle_purchase_installment= Column(Float, default=0)
    reimbursement_credit        = Column(Float, default=0)
    goal_bonus                  = Column(Float, default=0)
    iva_amount                  = Column(Float, default=0)
    irs_retention               = Column(Float, default=0)
    upi_earned                  = Column(Float, default=0)
    total_deductions            = Column(Float, default=0)
    net_amount                  = Column(Float, default=0)
    proof_document_url          = Column(String(500))
    status                      = Column(Enum(PaymentStatus), default=PaymentStatus.draft)
    submitted_by                = Column(String(255))
    approved_by                 = Column(String(255))
    notes                       = Column(Text)
    created_date                = Column(DateTime(timezone=True), server_default=func.now())
    updated_date                = Column(DateTime(timezone=True), onupdate=func.now())
    created_by                  = Column(String(255))

# ── Loan ──────────────────────────────────────────────────────
class Loan(Base):
    __tablename__ = "loans"
    id                  = Column(String(24), primary_key=True, default=gen_id)
    driver_id           = Column(String(24), nullable=False, index=True)
    driver_name         = Column(String(255))
    amount              = Column(Float, nullable=False)
    interest_rate_weekly= Column(Float, default=1)
    total_with_interest = Column(Float)
    duration_weeks      = Column(Float)
    weekly_installment  = Column(Float)
    remaining_balance   = Column(Float)
    paid_amount         = Column(Float, default=0)
    status              = Column(Enum(LoanStatus), default=LoanStatus.requested)
    request_date        = Column(String(20))
    approval_date       = Column(String(20))
    approved_by         = Column(String(255))
    notes               = Column(Text)
    created_date        = Column(DateTime(timezone=True), server_default=func.now())
    updated_date        = Column(DateTime(timezone=True), onupdate=func.now())

# ── VehiclePurchase ───────────────────────────────────────────
class VehiclePurchase(Base):
    __tablename__ = "vehicle_purchases"
    id                  = Column(String(24), primary_key=True, default=gen_id)
    driver_id           = Column(String(24), nullable=False)
    driver_name         = Column(String(255))
    vehicle_id          = Column(String(24), nullable=False)
    vehicle_info        = Column(String(255))
    base_price          = Column(Float, nullable=False)
    total_price         = Column(Float)
    duration_months     = Column(Integer, nullable=False)
    weekly_installment  = Column(Float)
    remaining_balance   = Column(Float)
    paid_amount         = Column(Float, default=0)
    prepayment_amount   = Column(Float, default=0)
    status              = Column(String(20), default="requested")
    start_date          = Column(String(20))
    approved_by         = Column(String(255))
    notes               = Column(Text)
    created_date        = Column(DateTime(timezone=True), server_default=func.now())
    updated_date        = Column(DateTime(timezone=True), onupdate=func.now())

# ── UPITransaction ────────────────────────────────────────────
class UPITransaction(Base):
    __tablename__ = "upi_transactions"
    id          = Column(String(24), primary_key=True, default=gen_id)
    driver_id   = Column(String(24), nullable=False, index=True)
    driver_name = Column(String(255))
    type        = Column(String(20))  # earned | credit | debit
    amount      = Column(Float, nullable=False)
    source      = Column(String(100))
    week_label  = Column(String(100))
    notes       = Column(Text)
    processed_by= Column(String(255))
    created_date= Column(DateTime(timezone=True), server_default=func.now())

# ── Document ──────────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"
    id               = Column(String(24), primary_key=True, default=gen_id)
    owner_type       = Column(String(30))
    owner_id         = Column(String(24), nullable=False, index=True)
    owner_name       = Column(String(255))
    document_type    = Column(String(50))
    file_url         = Column(String(500))
    expiry_date      = Column(String(20))
    status           = Column(Enum(DocumentStatus), default=DocumentStatus.pending)
    rejection_reason = Column(Text)
    approved_by      = Column(String(255))
    version          = Column(Integer, default=1)
    notes            = Column(Text)
    created_date     = Column(DateTime(timezone=True), server_default=func.now())
    updated_date     = Column(DateTime(timezone=True), onupdate=func.now())

# ── MaintenanceRecord ─────────────────────────────────────────
class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    id                   = Column(String(24), primary_key=True, default=gen_id)
    vehicle_id           = Column(String(24), nullable=False, index=True)
    vehicle_info         = Column(String(255))
    type                 = Column(String(50))
    description          = Column(Text)
    cost                 = Column(Float)
    mileage_at_service   = Column(Float)
    service_date         = Column(String(20), nullable=False)
    next_service_date    = Column(String(20))
    next_service_mileage = Column(Float)
    performed_by         = Column(String(255))
    receipt_url          = Column(String(500))
    status               = Column(String(20), default="done")
    alert_triggered      = Column(Boolean, default=False)
    notes                = Column(Text)
    created_date         = Column(DateTime(timezone=True), server_default=func.now())
    updated_date         = Column(DateTime(timezone=True), onupdate=func.now())

# ── Conversation + Message ────────────────────────────────────
class Conversation(Base):
    __tablename__ = "conversations"
    id                = Column(String(24), primary_key=True, default=gen_id)
    title             = Column(String(255), nullable=False)
    type              = Column(String(20), default="direct")
    participants      = Column(JSON, default=list)
    participant_names = Column(String(500))
    created_by        = Column(String(255))
    last_message      = Column(Text)
    last_message_at   = Column(String(50))
    fleet_manager_id  = Column(String(24))
    created_date      = Column(DateTime(timezone=True), server_default=func.now())
    updated_date      = Column(DateTime(timezone=True), onupdate=func.now())

class Message(Base):
    __tablename__ = "messages"
    id              = Column(String(24), primary_key=True, default=gen_id)
    conversation_id = Column(String(24), nullable=False, index=True)
    sender_id       = Column(String(255), nullable=False)
    sender_name     = Column(String(255))
    sender_role     = Column(String(50))
    content         = Column(Text, nullable=False)
    read_by         = Column(JSON, default=list)
    created_date    = Column(DateTime(timezone=True), server_default=func.now())

# ── Notification ──────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"
    id               = Column(String(24), primary_key=True, default=gen_id)
    title            = Column(String(255), nullable=False)
    message          = Column(Text, nullable=False)
    type             = Column(String(20), default="info")
    category         = Column(String(50), default="general")
    recipient_email  = Column(String(255))
    recipient_role   = Column(String(50))
    related_entity   = Column(String(100))
    is_read          = Column(Boolean, default=False)
    read_by          = Column(JSON, default=list)
    action_url       = Column(String(255))
    sent_email       = Column(Boolean, default=False)
    created_date     = Column(DateTime(timezone=True), server_default=func.now())
