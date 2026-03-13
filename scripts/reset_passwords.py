#!/usr/bin/env python3
"""
reset_passwords.py — Génère les hash bcrypt pour les utilisateurs initiaux
Usage:
  python scripts/reset_passwords.py
  
Puis copiez les hash dans scripts/init.sql ou appelez directement l'API.
"""
import sys
try:
    from passlib.context import CryptContext
except ImportError:
    print("pip install passlib[bcrypt]")
    sys.exit(1)

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

users = [
    ("millaballzy@gmail.com",    "admin",         "DÉFINISSEZ_MOT_DE_PASSE_ADMIN"),
    ("danyelagsilva@gmail.com",  "fleet_manager", "DÉFINISSEZ_MOT_DE_PASSE_FM"),
]

print("\n── Hash bcrypt pour init.sql ──────────────────────────────")
for email, role, password in users:
    h = pwd.hash(password)
    print(f"\n-- {email} ({role})")
    print(f"-- Password: {password}")
    print(f"-- Hash: {h}")
    print(f"UPDATE users SET hashed_password = '{h}' WHERE email = '{email}';")

print("\n── Vérification ────────────────────────────────────────────")
for email, role, password in users:
    h = pwd.hash(password)
    assert pwd.verify(password, h), f"ERREUR: hash invalide pour {email}"
    print(f"✓ {email}: OK")
