"""Email service with provider abstraction (mock/Resend/SendGrid).

To go live with Resend:
1. Set EMAIL_PROVIDER=resend and RESEND_API_KEY in .env
2. Get key at https://resend.com/api-keys
3. Verify your sending domain in Resend dashboard
4. Update FROM_EMAIL in .env

To go live with SendGrid:
1. Set EMAIL_PROVIDER=sendgrid and SENDGRID_API_KEY in .env
2. Get key at https://app.sendgrid.com/settings/api_keys
3. Verify single sender or domain
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr

from auth import get_current_admin_payload

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/email", tags=["email"])

EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "mock").lower()
FROM_EMAIL = os.environ.get("FROM_EMAIL", "noreply@codemaster.app")
FROM_NAME = os.environ.get("FROM_NAME", "CodeMaster Academy")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")


# ---------------------------------------------------------------------------
# Templates (6-lingue ready, mostro IT+EN per brevità; altri fallback EN)
# ---------------------------------------------------------------------------
TEMPLATES: Dict[str, Dict[str, Dict[str, str]]] = {
    "welcome": {
        "it": {"subject": "Benvenuto in CodeMaster Academy! 🚀", "body": "Ciao {name},\n\nGrazie per esserti registrato! Inizia oggi a imparare a programmare.\n\nCodice referral: {referral_code}\n\nBuon coding!\nIl team CodeMaster"},
        "en": {"subject": "Welcome to CodeMaster Academy! 🚀", "body": "Hi {name},\n\nThanks for joining! Start learning to code today.\n\nYour referral code: {referral_code}\n\nHappy coding!\nThe CodeMaster team"},
    },
    "password_reset": {
        "it": {"subject": "Reimposta la tua password", "body": "Ciao {name},\n\nClicca qui per reimpostare la password: {reset_url}\n\nLink valido 1 ora.\n\nSe non hai richiesto il reset, ignora questa email."},
        "en": {"subject": "Reset your password", "body": "Hi {name},\n\nClick to reset password: {reset_url}\n\nLink valid for 1 hour.\n\nIf you didn't request this, ignore this email."},
    },
    "payment_success": {
        "it": {"subject": "Pagamento confermato — {plan_name}", "body": "Ciao {name},\n\nIl tuo abbonamento {plan_name} è attivo!\nImporto: €{amount}\n\nGrazie per il tuo supporto.\n\nCodeMaster Academy"},
        "en": {"subject": "Payment confirmed — {plan_name}", "body": "Hi {name},\n\nYour {plan_name} subscription is active!\nAmount: €{amount}\n\nThanks for your support.\n\nCodeMaster Academy"},
    },
    "subscription_renewal": {
        "it": {"subject": "Il tuo abbonamento è stato rinnovato", "body": "Ciao {name},\n\nL'abbonamento {plan_name} è stato rinnovato. Continua a imparare!\n\nCodeMaster"},
        "en": {"subject": "Your subscription renewed", "body": "Hi {name},\n\nYour {plan_name} subscription renewed. Keep learning!\n\nCodeMaster"},
    },
    "certificate_earned": {
        "it": {"subject": "🏆 Hai ottenuto un certificato!", "body": "Complimenti {name}!\n\nHai completato {course_title}. Scarica il certificato: {cert_url}\n\nCondividilo su LinkedIn!"},
        "en": {"subject": "🏆 You earned a certificate!", "body": "Congrats {name}!\n\nYou completed {course_title}. Download cert: {cert_url}\n\nShare on LinkedIn!"},
    },
    "winback": {
        "it": {"subject": "Ti aspettiamo, {name}!", "body": "Ciao {name},\n\nNon programmi da {days} giorni. Riprendi da dove avevi lasciato!\n\nLa tua streak ti aspetta. 🔥"},
        "en": {"subject": "We miss you, {name}!", "body": "Hi {name},\n\nYou haven't coded in {days} days. Pick up where you left off!\n\nYour streak awaits. 🔥"},
    },
    "abandoned_checkout": {
        "it": {"subject": "Hai dimenticato qualcosa? 🛒", "body": "Ciao {name},\n\nNoto che non hai completato l'abbonamento {plan_name}. Usa il coupon WELCOME20 per il 20% di sconto!\n\nLink: {checkout_url}"},
        "en": {"subject": "Forgot something? 🛒", "body": "Hi {name},\n\nYou didn't finish your {plan_name} subscription. Use WELCOME20 for 20% off!\n\n{checkout_url}"},
    },
}


def render_template(template_id: str, lang: str, ctx: Dict) -> Dict[str, str]:
    tpl = TEMPLATES.get(template_id, {}).get(lang) or TEMPLATES.get(template_id, {}).get("en")
    if not tpl:
        return {"subject": template_id, "body": str(ctx)}
    return {
        "subject": tpl["subject"].format(**ctx),
        "body": tpl["body"].format(**ctx),
    }


async def send_email(db, to_email: str, template_id: str, ctx: Dict, lang: str = "it"):
    """Send email via configured provider; always logs to email_outbox."""
    rendered = render_template(template_id, lang, ctx)
    record = {
        "to": to_email,
        "from_email": FROM_EMAIL,
        "from_name": FROM_NAME,
        "template_id": template_id,
        "lang": lang,
        "subject": rendered["subject"],
        "body": rendered["body"],
        "context": {k: str(v)[:200] for k, v in ctx.items()},
        "provider": EMAIL_PROVIDER,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    sent_ok = False
    try:
        if EMAIL_PROVIDER == "resend" and RESEND_API_KEY:
            sent_ok = await _send_via_resend(to_email, rendered["subject"], rendered["body"])
        elif EMAIL_PROVIDER == "sendgrid" and SENDGRID_API_KEY:
            sent_ok = await _send_via_sendgrid(to_email, rendered["subject"], rendered["body"])
        else:
            # MOCK: log only
            logger.info(f"[EMAIL MOCK] to={to_email} subj={rendered['subject']}")
            sent_ok = True
            record["provider"] = "mock"
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        record["error"] = str(e)[:200]

    record["status"] = "sent" if sent_ok else "failed"
    record["sent_at"] = datetime.now(timezone.utc).isoformat() if sent_ok else None
    await db.email_outbox.insert_one(record)
    return sent_ok


async def _send_via_resend(to_email: str, subject: str, body: str) -> bool:
    """TODO real impl: POST to https://api.resend.com/emails with Bearer token."""
    import httpx
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={"from": f"{FROM_NAME} <{FROM_EMAIL}>", "to": [to_email], "subject": subject, "text": body},
        )
        return r.status_code in (200, 202)


async def _send_via_sendgrid(to_email: str, subject: str, body: str) -> bool:
    """TODO real impl: POST to SendGrid v3 mail/send."""
    import httpx
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {SENDGRID_API_KEY}", "Content-Type": "application/json"},
            json={
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": FROM_EMAIL, "name": FROM_NAME},
                "subject": subject,
                "content": [{"type": "text/plain", "value": body}],
            },
        )
        return r.status_code in (200, 202)


# ---------------------------------------------------------------------------
# Admin endpoints to inspect outbox
# ---------------------------------------------------------------------------
@router.get("/outbox")
async def list_outbox(request: Request, payload=Depends(get_current_admin_payload)):
    db = request.app.state.db
    return await db.email_outbox.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


class TestEmailBody(BaseModel):
    to: EmailStr
    template_id: str = "welcome"
    lang: str = "it"


@router.post("/test")
async def admin_test_email(body: TestEmailBody, request: Request, payload=Depends(get_current_admin_payload)):
    db = request.app.state.db
    ok = await send_email(db, body.to, body.template_id, {"name": "Test", "referral_code": "TESTCODE", "plan_name": "Pro Mensile", "amount": "9.99", "course_title": "Python Base", "cert_url": "https://example.com", "reset_url": "https://example.com/reset", "checkout_url": "https://example.com/pricing", "days": 7}, body.lang)
    return {"sent": ok, "provider": EMAIL_PROVIDER}
