from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    verify_password, hash_password,
    create_access_token, create_refresh_token,
    get_current_user
)
from app.core.config import settings
from app.models.all_models import User, UserRole
from jose import JWTError, jwt

router = APIRouter()

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "driver"

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/token", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Compte désactivé")

    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "profile_photo_url": user.profile_photo_url,
        }
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(body.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token invalide")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expiré ou invalide")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")

    access_token = create_access_token({"sub": user.id, "role": user.role})
    new_refresh = create_refresh_token(user.id)
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user={"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role}
    )

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "profile_photo_url": current_user.profile_photo_url,
        "linked_entity_id": current_user.linked_entity_id,
    }

@router.post("/change-password")
async def change_password(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(body.get("current_password", ""), current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    current_user.hashed_password = hash_password(body["new_password"])
    db.add(current_user)
    return {"message": "Mot de passe modifié"}
