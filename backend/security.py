"""Security & Auth hardening module.

Adds: password reset, email verification, login OTP (2FA email), session management,
login attempt rate limiting, and login history tracking.

Designed to coexist with the legacy /auth/register and /auth/login endpoints in server.py.
The login/register flows in server.py call helpers in this module (issue_session, send_*).
"""
import os
import re
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr, Field

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_payload,
)
from email_service import send_email

router = APIRouter(prefix="/api/auth", tags=["auth-security"])

# --- Config ---
WEB_BASE_URL = os.environ.get("WEB_BASE_URL", "http://localhost:3000")
PASSWORD_RESET_TTL_MIN = 60  # 1 hour
EMAIL_VERIFICATION_TTL_MIN = 60 * 24 * 3  # 3 days
OTP_TTL_MIN = 10
LOGIN_RATE_LIMIT_WINDOW_MIN = 15
LOGIN_RATE_LIMIT_MAX = 5

# ============================================================================
# Helpers
# ============================================================================
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_iso() -> str:
    return now_utc().isoformat()


def gen_token(prefix: str = "") -> str:
    return prefix + secrets.token_urlsafe(32)


def hash_value(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def device_hash(user_agent: str, ip: str) -> str:
    """Compute a stable-ish device fingerprint. UA carries most info; IP can change."""
    ua_norm = (user_agent or "unknown").strip().lower()[:300]
    return hashlib.sha256(f"{ua_norm}".encode()).hexdigest()[:24]


def parse_device_info(user_agent: str) -> str:
    """Friendly device label from UA."""
    ua = (user_agent or "").lower()
    if "iphone" in ua or "ipad" in ua: return "iOS Device"
    if "android" in ua: return "Android Device"
    if "macintosh" in ua or "mac os" in ua: return "Mac"
    if "windows" in ua: return "Windows PC"
    if "linux" in ua: return "Linux"
    return "Unknown Device"


def get_client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_user_agent(request: Request) -> str:
    return request.headers.get("user-agent", "unknown")[:500]


# ============================================================================
# Password validation
# ============================================================================
PASSWORD_RULES = {
    "min_length": 8,
    "require_upper": True,
    "require_digit": True,
    "require_symbol": True,
}


def validate_strong_password(p: str, lang: str = "it") -> None:
    """Raise HTTPException(400) if password too weak."""
    msgs_it = {
        "len": "La password deve contenere almeno 8 caratteri",
        "upper": "La password deve contenere almeno una maiuscola",
        "digit": "La password deve contenere almeno un numero",
        "symbol": "La password deve contenere almeno un simbolo",
    }
    msgs_en = {
        "len": "Password must be at least 8 characters",
        "upper": "Password must contain at least one uppercase letter",
        "digit": "Password must contain at least one number",
        "symbol": "Password must contain at least one symbol",
    }
    M = msgs_it if lang == "it" else msgs_en
    if len(p) < PASSWORD_RULES["min_length"]:
        raise HTTPException(400, M["len"])
    if PASSWORD_RULES["require_upper"] and not re.search(r"[A-Z]", p):
        raise HTTPException(400, M["upper"])
    if PASSWORD_RULES["require_digit"] and not re.search(r"[0-9]", p):
        raise HTTPException(400, M["digit"])
    if PASSWORD_RULES["require_symbol"] and not re.search(r"[^A-Za-z0-9]", p):
        raise HTTPException(400, M["symbol"])


# ============================================================================
# Login rate limiting (per IP+email)
# ============================================================================
async def check_login_rate_limit(db, ip: str, email: str) -> None:
    cutoff = (now_utc() - timedelta(minutes=LOGIN_RATE_LIMIT_WINDOW_MIN)).isoformat()
    failures = await db.login_attempts.count_documents({
        "ip": ip, "email": email.lower(), "success": False, "created_at": {"$gte": cutoff},
    })
    if failures >= LOGIN_RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail=f"Troppi tentativi di login. Riprova tra {LOGIN_RATE_LIMIT_WINDOW_MIN} minuti.",
        )


async def record_login_attempt(db, ip: str, email: str, ua: str, success: bool, reason: str = ""):
    await db.login_attempts.insert_one({
        "ip": ip, "email": email.lower(), "ua": ua[:300],
        "success": success, "reason": reason, "created_at": now_iso(),
    })


# ============================================================================
# Sessions
# ============================================================================
async def create_session(db, user_id: str, request: Request) -> Dict:
    ua = get_user_agent(request)
    ip = get_client_ip(request)
    dev_hash = device_hash(ua, ip)
    session_id = "sess_" + secrets.token_urlsafe(16)
    sess = {
        "id": session_id,
        "user_id": user_id,
        "device_hash": dev_hash,
        "device_label": parse_device_info(ua),
        "ua": ua,
        "ip": ip,
        "created_at": now_iso(),
        "last_seen": now_iso(),
        "revoked": False,
    }
    await db.sessions.insert_one(sess)
    return sess


async def is_session_active(db, session_id: str) -> bool:
    if not session_id:
        return True  # legacy token without sid claim — accept (back-compat)
    sess = await db.sessions.find_one({"id": session_id})
    if not sess:
        return False
    return not sess.get("revoked", False)


async def is_known_device(db, user_id: str, request: Request) -> bool:
    ua = get_user_agent(request)
    ip = get_client_ip(request)
    dev_hash = device_hash(ua, ip)
    found = await db.sessions.find_one({"user_id": user_id, "device_hash": dev_hash, "revoked": False})
    return found is not None


# ============================================================================
# OTP (2FA email)
# ============================================================================
async def issue_otp_challenge(db, user: Dict, request: Request) -> str:
    code = "".join(secrets.choice("0123456789") for _ in range(6))
    challenge_id = "chal_" + secrets.token_urlsafe(12)
    await db.auth_otps.insert_one({
        "challenge_id": challenge_id,
        "user_id": user["id"],
        "code_hash": hash_value(code),
        "expires_at": (now_utc() + timedelta(minutes=OTP_TTL_MIN)).isoformat(),
        "used": False,
        "ip": get_client_ip(request),
        "ua": get_user_agent(request),
        "created_at": now_iso(),
    })
    # Send email with code
    try:
        await send_email(
            db,
            user["email"],
            "login_otp",
            {
                "name": user.get("name", "User"),
                "code": code,
                "device": parse_device_info(get_user_agent(request)),
                "ip": get_client_ip(request),
            },
            user.get("language", "it"),
        )
    except Exception:
        pass
    return challenge_id


async def verify_otp(db, challenge_id: str, code: str) -> Optional[Dict]:
    chal = await db.auth_otps.find_one({"challenge_id": challenge_id})
    if not chal or chal.get("used"):
        return None
    if chal["expires_at"] < now_iso():
        return None
    if chal["code_hash"] != hash_value(code):
        return None
    await db.auth_otps.update_one({"challenge_id": challenge_id}, {"$set": {"used": True, "used_at": now_iso()}})
    user = await db.users.find_one({"id": chal["user_id"]})
    return user


# ============================================================================
# Email verification
# ============================================================================
async def issue_email_verification(db, user: Dict):
    token = gen_token("ev_")
    await db.email_verifications.insert_one({
        "user_id": user["id"],
        "token_hash": hash_value(token),
        "expires_at": (now_utc() + timedelta(minutes=EMAIL_VERIFICATION_TTL_MIN)).isoformat(),
        "used": False,
        "created_at": now_iso(),
    })
    verify_url = f"{WEB_BASE_URL}/(marketing)/verify-email?token={token}"
    try:
        await send_email(
            db,
            user["email"],
            "email_verification",
            {"name": user.get("name", "User"), "verify_url": verify_url},
            user.get("language", "it"),
        )
    except Exception:
        pass


# ============================================================================
# New-device alert
# ============================================================================
async def send_new_device_alert(db, user: Dict, request: Request):
    try:
        await send_email(
            db,
            user["email"],
            "new_device_alert",
            {
                "name": user.get("name", "User"),
                "device": parse_device_info(get_user_agent(request)),
                "ip": get_client_ip(request),
                "time": now_iso(),
            },
            user.get("language", "it"),
        )
    except Exception:
        pass


# ============================================================================
# Login history
# ============================================================================
async def record_login_history(db, user_id: str, session_id: str, request: Request, success: bool, reason: str = ""):
    await db.login_history.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "ip": get_client_ip(request),
        "ua": get_user_agent(request),
        "device_label": parse_device_info(get_user_agent(request)),
        "success": success,
        "reason": reason,
        "created_at": now_iso(),
    })


# ============================================================================
# Endpoints
# ============================================================================
class ForgotPasswordBody(BaseModel):
    email: EmailStr
    lang: str = "it"


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordBody, request: Request):
    db = request.app.state.db
    user = await db.users.find_one({"email": body.email.lower()})
    # Always return success to prevent email enumeration
    if user:
        token = gen_token("pr_")
        await db.password_resets.insert_one({
            "user_id": user["id"],
            "token_hash": hash_value(token),
            "expires_at": (now_utc() + timedelta(minutes=PASSWORD_RESET_TTL_MIN)).isoformat(),
            "used": False,
            "created_at": now_iso(),
            "ip": get_client_ip(request),
        })
        reset_url = f"{WEB_BASE_URL}/(auth)/reset-password?token={token}"
        try:
            await send_email(db, user["email"], "password_reset",
                             {"name": user.get("name", "User"), "reset_url": reset_url}, body.lang)
        except Exception:
            pass
    return {"success": True, "message": "If the email exists, a reset link has been sent."}


class ResetPasswordBody(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=200)
    lang: str = "it"


@router.post("/reset-password")
async def reset_password(body: ResetPasswordBody, request: Request):
    db = request.app.state.db
    validate_strong_password(body.new_password, body.lang)
    pr = await db.password_resets.find_one({"token_hash": hash_value(body.token)})
    if not pr or pr.get("used") or pr["expires_at"] < now_iso():
        raise HTTPException(400, "Token non valido o scaduto" if body.lang == "it" else "Invalid or expired token")
    user = await db.users.find_one({"id": pr["user_id"]})
    if not user:
        raise HTTPException(404, "User not found")
    new_hash = hash_password(body.new_password)
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": new_hash, "password_changed_at": now_iso()}})
    await db.password_resets.update_one({"_id": pr["_id"]}, {"$set": {"used": True, "used_at": now_iso()}})
    # Revoke all existing sessions for security
    await db.sessions.update_many({"user_id": user["id"]}, {"$set": {"revoked": True, "revoked_at": now_iso(), "revoked_reason": "password_reset"}})
    return {"success": True, "message": "Password reimpostata. Effettua di nuovo il login." if body.lang == "it" else "Password reset. Please log in again."}


class VerifyEmailBody(BaseModel):
    token: str


@router.post("/verify-email")
async def verify_email(body: VerifyEmailBody, request: Request):
    db = request.app.state.db
    ev = await db.email_verifications.find_one({"token_hash": hash_value(body.token)})
    if not ev or ev.get("used") or ev["expires_at"] < now_iso():
        raise HTTPException(400, "Token non valido o scaduto")
    await db.users.update_one({"id": ev["user_id"]}, {"$set": {"email_verified": True, "email_verified_at": now_iso()}})
    await db.email_verifications.update_one({"_id": ev["_id"]}, {"$set": {"used": True, "used_at": now_iso()}})
    return {"success": True, "message": "Email verificata"}


@router.post("/resend-verification")
async def resend_verification(request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("email_verified"):
        return {"success": True, "already_verified": True}
    await issue_email_verification(db, user)
    return {"success": True}


class VerifyOTPBody(BaseModel):
    challenge_id: str
    code: str = Field(min_length=4, max_length=10)


@router.post("/verify-otp")
async def verify_otp_endpoint(body: VerifyOTPBody, request: Request):
    db = request.app.state.db
    user = await verify_otp(db, body.challenge_id, body.code)
    if not user:
        raise HTTPException(400, "Codice non valido o scaduto")
    # Create session, issue token
    sess = await create_session(db, user["id"], request)
    token = create_access_token_with_session(user["id"], user["email"], user.get("role", "user"), sess["id"])
    await record_login_history(db, user["id"], sess["id"], request, True, "otp_verified")
    # Optionally notify the user about login from new device (already known device after this)
    try:
        await send_new_device_alert(db, user, request)
    except Exception:
        pass
    user_clean = {k: v for k, v in user.items() if k not in ("_id", "password_hash")}
    return {"token": token, "user": user_clean, "session_id": sess["id"]}


@router.get("/sessions")
async def list_sessions(request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    docs = await db.sessions.find(
        {"user_id": payload["sub"], "revoked": False},
        {"_id": 0, "user_id": 0, "device_hash": 0},
    ).sort("last_seen", -1).to_list(50)
    current_sid = payload.get("sid")
    for d in docs:
        d["is_current"] = d["id"] == current_sid
    return docs


@router.post("/sessions/{session_id}/revoke")
async def revoke_session(session_id: str, request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    # Only owner may revoke
    sess = await db.sessions.find_one({"id": session_id, "user_id": payload["sub"]})
    if not sess:
        raise HTTPException(404, "Session not found")
    await db.sessions.update_one({"id": session_id}, {"$set": {"revoked": True, "revoked_at": now_iso(), "revoked_reason": "user_revoked"}})
    return {"success": True}


@router.post("/sessions/revoke-all-others")
async def revoke_all_others(request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    current_sid = payload.get("sid")
    q: Dict = {"user_id": payload["sub"], "revoked": False}
    if current_sid:
        q["id"] = {"$ne": current_sid}
    res = await db.sessions.update_many(q, {"$set": {"revoked": True, "revoked_at": now_iso(), "revoked_reason": "revoked_others"}})
    return {"success": True, "revoked_count": res.modified_count}


@router.get("/login-history")
async def login_history(request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    docs = await db.login_history.find(
        {"user_id": payload["sub"]},
        {"_id": 0, "user_id": 0, "ua": 0},
    ).sort("created_at", -1).limit(50).to_list(50)
    return docs


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=200)
    lang: str = "it"


@router.post("/change-password")
async def change_password(body: ChangePasswordBody, request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    user = await db.users.find_one({"id": payload["sub"]})
    if not user or not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(400, "Password attuale non corretta" if body.lang == "it" else "Current password incorrect")
    validate_strong_password(body.new_password, body.lang)
    new_hash = hash_password(body.new_password)
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": new_hash, "password_changed_at": now_iso()}})
    return {"success": True}


# ============================================================================
# Token helper with session id
# ============================================================================
def create_access_token_with_session(user_id: str, email: str, role: str, session_id: str) -> str:
    """Same as auth.create_access_token but adds 'sid' claim for session tracking."""
    import jwt
    from auth import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "sid": session_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ============================================================================
# Add new email templates (mutates email_service TEMPLATES dict at import)
# ============================================================================
def _register_extra_email_templates():
    from email_service import TEMPLATES
    TEMPLATES.setdefault("email_verification", {
        "it": {
            "subject": "Verifica la tua email - CodeMaster Academy",
            "body": "Ciao {name},\n\nGrazie per esserti registrato! Conferma la tua email cliccando qui:\n\n{verify_url}\n\nIl link è valido 3 giorni.\n\nSe non hai effettuato la registrazione, ignora questa email.\n\nIl team CodeMaster",
        },
        "en": {
            "subject": "Verify your email - CodeMaster Academy",
            "body": "Hi {name},\n\nThanks for signing up! Confirm your email by clicking:\n\n{verify_url}\n\nLink valid for 3 days.\n\nIf you didn't sign up, please ignore this email.\n\nThe CodeMaster team",
        },
    })
    TEMPLATES.setdefault("login_otp", {
        "it": {
            "subject": "Codice di verifica login: {code}",
            "body": "Ciao {name},\n\nQualcuno sta effettuando l'accesso al tuo account da un nuovo dispositivo.\n\nIl tuo codice di verifica è: {code}\n\nDispositivo: {device}\nIP: {ip}\n\nIl codice è valido 10 minuti.\n\nSe non sei stato tu, cambia immediatamente la password.",
        },
        "en": {
            "subject": "Login verification code: {code}",
            "body": "Hi {name},\n\nSomeone is signing in to your account from a new device.\n\nYour verification code: {code}\n\nDevice: {device}\nIP: {ip}\n\nCode expires in 10 minutes.\n\nIf this wasn't you, change your password immediately.",
        },
    })
    TEMPLATES.setdefault("new_device_alert", {
        "it": {
            "subject": "🔔 Nuovo accesso al tuo account",
            "body": "Ciao {name},\n\nAbbiamo rilevato un nuovo accesso al tuo account.\n\nDispositivo: {device}\nIP: {ip}\nOra: {time}\n\nSe sei stato tu, puoi ignorare questa email. Altrimenti, cambia immediatamente la password e revoca le sessioni dal tuo profilo.",
        },
        "en": {
            "subject": "🔔 New sign-in to your account",
            "body": "Hi {name},\n\nWe detected a new sign-in to your account.\n\nDevice: {device}\nIP: {ip}\nTime: {time}\n\nIf this was you, you can ignore this email. Otherwise, change your password immediately and revoke sessions from your profile.",
        },
    })


_register_extra_email_templates()
