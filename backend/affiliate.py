"""Affiliate dashboard: track commissions, partner coupons, payout requests."""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from auth import get_current_user_payload, get_current_admin_payload

router = APIRouter(prefix="/api/affiliate", tags=["affiliate"])


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class PayoutRequestBody(BaseModel):
    amount: float
    payout_method: str  # 'paypal' | 'bank_transfer'
    payout_details: str  # email or IBAN


@router.get("/me/summary")
async def my_affiliate_summary(request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    user_id = payload["sub"]

    # Total commissions earned
    pipe_total = [
        {"$match": {"referrer_id": user_id, "status": {"$in": ["pending_payout", "paid"]}}},
        {"$group": {"_id": "$status", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    by_status = {row["_id"]: row for row in await db.referral_commissions.aggregate(pipe_total).to_list(10)}

    pending = by_status.get("pending_payout", {"total": 0, "count": 0})
    paid = by_status.get("paid", {"total": 0, "count": 0})

    # Number of invited users
    invited = await db.users.count_documents({"referred_by": user_id})

    # Recent commissions
    recent = await db.referral_commissions.find({"referrer_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)

    # User referral code
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "referral_code": 1, "name": 1})

    # Payout history
    payouts = await db.payout_requests.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(50)

    # Eligible payout: pending >= 50 EUR
    eligible_for_payout = pending["total"] >= 50

    return {
        "referral_code": user.get("referral_code") if user else None,
        "invited_count": invited,
        "pending_amount": round(pending["total"], 2),
        "pending_commissions_count": pending["count"],
        "paid_amount": round(paid["total"], 2),
        "paid_commissions_count": paid["count"],
        "lifetime_earnings": round(pending["total"] + paid["total"], 2),
        "eligible_for_payout": eligible_for_payout,
        "min_payout_threshold": 50,
        "recent_commissions": recent,
        "payout_history": payouts,
    }


@router.post("/me/payout")
async def request_payout(body: PayoutRequestBody, request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    user_id = payload["sub"]

    # Compute pending balance
    pipe = [
        {"$match": {"referrer_id": user_id, "status": "pending_payout"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    agg = await db.referral_commissions.aggregate(pipe).to_list(1)
    pending = agg[0]["total"] if agg else 0

    if body.amount < 50:
        raise HTTPException(400, "Importo minimo €50")
    if body.amount > pending:
        raise HTTPException(400, f"Saldo disponibile: €{pending:.2f}")

    payout_id = f"po_{datetime.now(timezone.utc).timestamp():.0f}_{user_id[:6]}"
    await db.payout_requests.insert_one({
        "id": payout_id,
        "user_id": user_id,
        "amount": body.amount,
        "payout_method": body.payout_method,
        "payout_details": body.payout_details,
        "status": "pending",
        "created_at": now_iso(),
    })

    return {"success": True, "payout_id": payout_id, "status": "pending", "note": "Payout sarà processato entro 7 giorni lavorativi"}


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------
class ApprovePayoutBody(BaseModel):
    payout_id: str
    transaction_ref: Optional[str] = None


@router.get("/admin/all-summary")
async def admin_affiliate_summary(request: Request, payload=Depends(get_current_admin_payload)):
    db = request.app.state.db
    pipe_top = [
        {"$group": {"_id": "$referrer_id", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"total": -1}},
        {"$limit": 20},
    ]
    top_affiliates = await db.referral_commissions.aggregate(pipe_top).to_list(50)
    # Enrich with user names
    enriched = []
    for row in top_affiliates:
        u = await db.users.find_one({"id": row["_id"]}, {"_id": 0, "name": 1, "email": 1})
        enriched.append({
            "user_id": row["_id"],
            "name": u["name"] if u else "—",
            "email": u["email"] if u else "—",
            "total_commissions": round(row["total"], 2),
            "count": row["count"],
        })

    pending_payouts = await db.payout_requests.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(100)

    pipe_global = [{"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}]
    global_pending = await db.referral_commissions.aggregate([{"$match": {"status": "pending_payout"}}, *pipe_global]).to_list(1)
    global_paid = await db.referral_commissions.aggregate([{"$match": {"status": "paid"}}, *pipe_global]).to_list(1)

    return {
        "top_affiliates": enriched,
        "pending_payouts": pending_payouts,
        "total_pending_eur": round(global_pending[0]["total"], 2) if global_pending else 0,
        "total_paid_eur": round(global_paid[0]["total"], 2) if global_paid else 0,
    }


@router.post("/admin/approve-payout")
async def admin_approve_payout(body: ApprovePayoutBody, request: Request, payload=Depends(get_current_admin_payload)):
    db = request.app.state.db
    po = await db.payout_requests.find_one({"id": body.payout_id})
    if not po:
        raise HTTPException(404, "Payout not found")
    if po["status"] != "pending":
        raise HTTPException(400, "Payout already processed")

    # Mark commissions as paid (FIFO until payout amount reached)
    user_id = po["user_id"]
    remaining = po["amount"]
    pending_commissions = await db.referral_commissions.find(
        {"referrer_id": user_id, "status": "pending_payout"}
    ).sort("created_at", 1).to_list(1000)

    paid_ids = []
    for c in pending_commissions:
        if remaining <= 0:
            break
        if c["amount"] <= remaining + 0.01:
            paid_ids.append(c["_id"])
            remaining -= c["amount"]

    if paid_ids:
        await db.referral_commissions.update_many(
            {"_id": {"$in": paid_ids}},
            {"$set": {"status": "paid", "paid_at": now_iso(), "payout_id": body.payout_id}},
        )

    await db.payout_requests.update_one(
        {"id": body.payout_id},
        {"$set": {"status": "approved", "transaction_ref": body.transaction_ref, "approved_at": now_iso(), "approved_by": payload["sub"]}},
    )
    return {"success": True, "commissions_settled": len(paid_ids)}


# ---------------------------------------------------------------------------
# Partner coupons - create coupons assigned to specific affiliate
# ---------------------------------------------------------------------------
class PartnerCouponBody(BaseModel):
    code: str
    discount_percent: int
    affiliate_user_id: str
    uses_left: int = 100


@router.post("/admin/partner-coupons")
async def admin_create_partner_coupon(body: PartnerCouponBody, request: Request, payload=Depends(get_current_admin_payload)):
    db = request.app.state.db
    code = body.code.strip().upper()
    if await db.coupons.find_one({"code": code}):
        raise HTTPException(400, "Coupon exists")
    aff = await db.users.find_one({"id": body.affiliate_user_id})
    if not aff:
        raise HTTPException(404, "Affiliate not found")
    await db.coupons.insert_one({
        "code": code,
        "discount_percent": body.discount_percent,
        "uses_left": body.uses_left,
        "active": True,
        "partner_user_id": body.affiliate_user_id,
        "partner_name": aff.get("name"),
        "created_at": now_iso(),
    })
    return {"success": True, "code": code}
