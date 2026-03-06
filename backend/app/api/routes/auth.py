from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import timedelta

from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, require_manager, require_ceo
)
from app.core.config import settings
from app.db.dynamo import user_repo, invite_repo

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    invite_code: str


class InviteCreateRequest(BaseModel):
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint"""
    user = user_repo.get_user_by_email(form_data.username)
    
    if not user or not verify_password(form_data.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['id'], "email": user['email'], "role": user['role']},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    }


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register with invite code"""
    
    # Validate invite code
    is_valid, role, error = invite_repo.validate_invite(request.invite_code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)
    
    # Create user
    try:
        password_hash = get_password_hash(request.password)
        user = user_repo.create_user(
            email=request.email,
            password_hash=password_hash,
            role=role,
            name=request.name
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Consume invite
    invite_repo.consume_invite(request.invite_code)
    
    # Auto-login
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['id'], "email": user['email'], "role": user['role']},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user = user_repo.get_user_by_id(current_user['user_id'])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "role": user['role']
    }


@router.post("/invites")
async def create_invite(
    request: InviteCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create invite code (manager can create intern invites, CEO can create all)"""
    
    # Check permissions
    if current_user['role'] == 'manager' and request.role != 'intern':
        raise HTTPException(status_code=403, detail="Managers can only create intern invites")
    
    if current_user['role'] not in ['manager', 'ceo']:
        raise HTTPException(status_code=403, detail="Only managers and CEOs can create invites")
    
    if request.role not in ['intern', 'manager', 'ceo']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    invite = invite_repo.create_invite(
        role=request.role,
        created_by=current_user['user_id']
    )
    
    # Generate full registration URL
    invite['registration_url'] = f"{settings.FRONTEND_URL}/register?code={invite['code']}"
    
    return invite


@router.get("/invites")
async def get_my_invites(current_user: dict = Depends(require_manager)):
    """Get invites created by current user"""
    invites = invite_repo.get_invites_by_creator(current_user['user_id'])
    
    # Add registration URLs
    for invite in invites:
        invite['registration_url'] = f"{settings.FRONTEND_URL}/register?code={invite['code']}"
    
    return invites


@router.get("/invites/validate/{code}")
async def validate_invite_code(code: str):
    """Validate an invite code (public endpoint)"""
    is_valid, role, error = invite_repo.validate_invite(code)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)
    
    return {"valid": True, "role": role}
