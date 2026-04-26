"""Stripe checkout + coupon system + IAP receipt validation scaffold."""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

from auth import get_current_user_payload
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)

router = APIRouter(prefix="/api/billing", tags=["billing"])

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")

# SERVER-SIDE PACKAGES (never trust frontend amounts)
PACKAGES: Dict[str, Dict] = {
    "pro_monthly": {"amount": 9.99, "currency": "eur", "label": "Pro Monthly", "duration_days": 30},
    "pro_yearly": {"amount": 79.99, "currency": "eur", "label": "Pro Yearly", "duration_days": 365},
    "lifetime": {"amount": 199.0, "currency": "eur", "label": "Lifetime", "duration_days": None},
}

# Active coupons (in production these would live in DB and be admin-managed)
DEFAULT_COUPONS = {
    "WELCOME20": {"discount_percent": 20, "active": True, "uses_left": 1000},
    "STUDENT50": {"discount_percent": 50, "active": True, "uses_left": 500},
    "BLACKFRIDAY": {"discount_percent": 35, "active": True, "uses_left": 200},
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class CheckoutRequestBody(BaseModel):
    plan_id: str
    origin_url: str
    coupon_code: Optional[str] = None


class CouponCheckBody(BaseModel):
    code: str


def _get_db(request: Request):
    return request.app.state.db


@router.get("/coupons/check")
async def check_coupon(code: str, request: Request):
    """Validate a coupon code before checkout."""
    db = _get_db(request)
    code_up = code.strip().upper()

    coupon = await db.coupons.find_one({"code": code_up}, {"_id": 0})
    if not coupon:
        c = DEFAULT_COUPONS.get(code_up)
        if not c:
            raise HTTPException(404, "Coupon non valido")
        coupon = {"code": code_up, **c}

    if not coupon.get("active") or coupon.get("uses_left", 0) <= 0:
        raise HTTPException(400, "Coupon scaduto o esaurito")

    return {"code": coupon["code"], "discount_percent": coupon["discount_percent"], "valid": True}


@router.post("/stripe/checkout")
async def create_stripe_checkout(body: CheckoutRequestBody, request: Request, payload=Depends(get_current_user_payload)):
    db = _get_db(request)
    pkg = PACKAGES.get(body.plan_id)
    if not pkg:
        raise HTTPException(400, "Piano non valido")

    amount = pkg["amount"]
    discount = 0
    coupon_used = None
    if body.coupon_code:
        try:
            cresp = await check_coupon(body.coupon_code, request)
            discount = cresp["discount_percent"]
            coupon_used = cresp["code"]
            amount = round(amount * (1 - discount / 100), 2)
        except HTTPException:
            pass  # Invalid coupon -> proceed without

    # Build webhook + redirect URLs
    host = body.origin_url.rstrip("/")
    success_url = f"{host}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host}/pricing"
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"

    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    metadata = {
        "user_id": payload["sub"],
        "user_email": payload.get("email", ""),
        "plan_id": body.plan_id,
        "coupon": coupon_used or "",
        "original_amount": str(pkg["amount"]),
    }

    req = CheckoutSessionRequest(
        amount=amount,
        currency=pkg["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    try:
        session = await stripe_checkout.create_checkout_session(req)
    except Exception as e:
        raise HTTPException(502, f"Stripe error: {str(e)[:200]}")

    # Persist transaction (PENDING)
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": payload["sub"],
        "user_email": payload.get("email"),
        "plan_id": body.plan_id,
        "amount": amount,
        "currency": pkg["currency"],
        "discount_percent": discount,
        "coupon": coupon_used,
        "status": "initiated",
        "payment_status": "pending",
        "metadata": metadata,
        "created_at": now_iso(),
    })

    return {"url": session.url, "session_id": session.session_id, "amount": amount, "discount": discount}


@router.get("/stripe/status/{session_id}")
async def get_stripe_status(session_id: str, request: Request, payload=Depends(get_current_user_payload)):
    db = _get_db(request)
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn:
        raise HTTPException(404, "Transaction not found")
    if txn["user_id"] != payload["sub"]:
        raise HTTPException(403, "Forbidden")

    # Idempotent: if already paid, just return
    if txn.get("payment_status") == "paid":
        return {"payment_status": "paid", "status": txn.get("status", "complete"), "already_processed": True}

    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        raise HTTPException(502, f"Stripe error: {str(e)[:200]}")

    update = {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total_cents": status.amount_total,
        "updated_at": now_iso(),
    }

    if status.payment_status == "paid":
        plan_id = txn["plan_id"]
        pkg = PACKAGES.get(plan_id)
        expires = None
        if pkg and pkg["duration_days"]:
            expires = (datetime.now(timezone.utc) + timedelta(days=pkg["duration_days"])).isoformat()
        await db.users.update_one(
            {"id": txn["user_id"]},
            {"$set": {"subscription": {
                "plan_id": plan_id,
                "active": True,
                "expires_at": expires,
                "is_mock": False,
                "last_payment_at": now_iso(),
                "stripe_session_id": session_id,
            }}},
        )
        # Decrement coupon if used
        if txn.get("coupon"):
            await db.coupons.update_one({"code": txn["coupon"]}, {"$inc": {"uses_left": -1}}, upsert=False)
        # Referral commission tracking
        user = await db.users.find_one({"id": txn["user_id"]}, {"_id": 0})
        if user and user.get("referred_by"):
            commission = round(txn["amount"] * 0.10, 2)  # 10% commission
            await db.referral_commissions.insert_one({
                "referrer_id": user["referred_by"],
                "referee_id": user["id"],
                "transaction_session_id": session_id,
                "amount": commission,
                "currency": txn["currency"],
                "status": "pending_payout",
                "created_at": now_iso(),
            })
            await db.users.update_one({"id": user["referred_by"]}, {"$inc": {"stats.xp": 200}})

    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update})
    return {"payment_status": status.payment_status, "status": status.status}


# ---------------------------------------------------------------------------
# IAP receipt validation - architecture scaffold
# ---------------------------------------------------------------------------
class IAPVerifyBody(BaseModel):
    plan_id: str
    receipt: str  # base64 receipt or purchase token
    platform: str  # 'ios' or 'android'
    product_id: Optional[str] = None


@router.post("/iap/verify")
async def verify_iap(body: IAPVerifyBody, request: Request, payload=Depends(get_current_user_payload)):
    """
    SCAFFOLD: In production validates receipt via Apple App Store / Google Play Developer API.
    Currently stores the receipt for review and grants subscription on faith for testing.
    """
    db = _get_db(request)
    pkg = PACKAGES.get(body.plan_id)
    if not pkg:
        raise HTTPException(400, "Plan not found")

    # TODO: Real validation:
    # - iOS: POST https://buy.itunes.apple.com/verifyReceipt with shared_secret
    # - Android: Google Play Developer API purchases.subscriptions.get
    await db.iap_receipts.insert_one({
        "user_id": payload["sub"],
        "plan_id": body.plan_id,
        "platform": body.platform,
        "product_id": body.product_id,
        "receipt_excerpt": body.receipt[:120],
        "validated": False,  # MOCKED until real validation
        "created_at": now_iso(),
    })

    expires = None
    if pkg["duration_days"]:
        expires = (datetime.now(timezone.utc) + timedelta(days=pkg["duration_days"])).isoformat()

    await db.users.update_one(
        {"id": payload["sub"]},
        {"$set": {"subscription": {
            "plan_id": body.plan_id,
            "active": True,
            "expires_at": expires,
            "is_mock": True,  # FLAGGED as mock until real validation wired
            "platform": body.platform,
            "last_payment_at": now_iso(),
        }}},
    )
    return {"success": True, "is_mock": True, "note": "IAP receipt stored. Real validation requires production keys."}


# ---------------------------------------------------------------------------
# Stripe Webhook (idempotent)
# ---------------------------------------------------------------------------
async def handle_stripe_webhook_request(request: Request) -> dict:
    db = _get_db(request)
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        evt = await stripe_checkout.handle_webhook(body, sig)
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {str(e)[:200]}")

    await db.stripe_webhook_events.insert_one({
        "event_id": evt.event_id,
        "event_type": evt.event_type,
        "session_id": evt.session_id,
        "payment_status": evt.payment_status,
        "metadata": evt.metadata,
        "created_at": now_iso(),
    })

    if evt.payment_status == "paid" and evt.session_id:
        txn = await db.payment_transactions.find_one({"session_id": evt.session_id})
        if txn and txn.get("payment_status") != "paid":
            plan_id = txn["plan_id"]
            pkg = PACKAGES.get(plan_id)
            expires = None
            if pkg and pkg["duration_days"]:
                expires = (datetime.now(timezone.utc) + timedelta(days=pkg["duration_days"])).isoformat()
            await db.users.update_one(
                {"id": txn["user_id"]},
                {"$set": {"subscription": {
                    "plan_id": plan_id,
                    "active": True,
                    "expires_at": expires,
                    "is_mock": False,
                    "last_payment_at": now_iso(),
                    "stripe_session_id": evt.session_id,
                }}},
            )
            await db.payment_transactions.update_one(
                {"session_id": evt.session_id},
                {"$set": {"payment_status": "paid", "status": "complete", "updated_at": now_iso()}},
            )
    return {"received": True, "event_id": evt.event_id}
