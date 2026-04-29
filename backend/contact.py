"""Contact form endpoint - persists messages and triggers a mock notification email."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from email_service import send_email

router = APIRouter(prefix="/api", tags=["contact"])
limiter = Limiter(key_func=get_remote_address)


class ContactBody(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(default="General inquiry", max_length=200)
    message: str = Field(min_length=5, max_length=5000)
    lang: str = "it"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("/contact")
@limiter.limit("5/minute")
async def submit_contact(body: ContactBody, request: Request):
    db = request.app.state.db
    doc = {
        "name": body.name.strip(),
        "email": body.email.lower(),
        "subject": body.subject.strip(),
        "message": body.message.strip(),
        "lang": body.lang,
        "ip": (request.client.host if request.client else None),
        "user_agent": request.headers.get("user-agent", "")[:200],
        "status": "new",
        "created_at": now_iso(),
    }
    await db.contact_messages.insert_one(doc)

    # Best-effort acknowledgement to user (mock provider). We reuse the welcome template to log to outbox.
    try:
        await send_email(
            db,
            body.email.lower(),
            "welcome",  # placeholder template — ack uses welcome subject in mock; for prod create dedicated 'contact_ack'
            {"name": body.name, "referral_code": "-"},
            body.lang,
        )
    except Exception:
        pass

    return {"success": True, "message": "Thank you. We will get back to you within 24 business hours."}
