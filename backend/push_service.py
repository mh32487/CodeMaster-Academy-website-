"""Expo Push Notifications service.

Architecture:
- Frontend registers an Expo push token after login (POST /api/push/register)
- Backend stores token in users.push_tokens[] (deduplicated)
- Scheduled tasks (or manual triggers) call send_push() which dispatches to Expo's API
- Categories: daily_reminder, streak_save, quiz_reminder, upgrade_pro, abandoned_checkout

To enable real push:
1. Frontend must run in expo dev build or production build (Expo Go limited)
2. No additional config needed - Expo's free push service works out-of-box
3. For production: add eas.json projectId; configure APN keys for iOS production
"""
import os
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from auth import get_current_user_payload, get_current_admin_payload

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/push", tags=["push"])

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


class RegisterTokenBody(BaseModel):
    expo_push_token: str
    platform: str  # 'ios' | 'android' | 'web'


class SendPushBody(BaseModel):
    user_id: str
    title: str
    body: str
    data: Optional[Dict] = None


@router.post("/register")
async def register_token(body: RegisterTokenBody, request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    user_id = payload["sub"]
    # Idempotent: store unique tokens per user
    await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"push_tokens": {"token": body.expo_push_token, "platform": body.platform}}},
    )
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"push_settings.enabled": True, "push_settings.last_registered": datetime.now(timezone.utc).isoformat()}},
    )
    return {"success": True}


@router.post("/unregister")
async def unregister_token(body: RegisterTokenBody, request: Request, payload=Depends(get_current_user_payload)):
    db = request.app.state.db
    await db.users.update_one(
        {"id": payload["sub"]},
        {"$pull": {"push_tokens": {"token": body.expo_push_token}}},
    )
    return {"success": True}


async def _send_via_expo(messages: List[Dict]) -> Dict:
    """Send batch of messages via Expo Push API."""
    if not messages:
        return {"sent": 0}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(EXPO_PUSH_URL, json=messages, headers={"Content-Type": "application/json", "Accept": "application/json"})
            return {"sent": len(messages), "response": r.json() if r.status_code == 200 else r.text[:200]}
    except Exception as e:
        logger.error(f"Expo push fail: {e}")
        return {"sent": 0, "error": str(e)[:200]}


async def send_push(db, user_id: str, title: str, body: str, data: Optional[Dict] = None, category: str = "general"):
    """Helper to push to a single user (all their tokens). Logs to push_outbox."""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "push_tokens": 1, "push_settings": 1})
    if not user:
        return {"sent": 0, "reason": "user_not_found"}
    if user.get("push_settings", {}).get("enabled") is False:
        return {"sent": 0, "reason": "user_disabled"}
    tokens = [t["token"] for t in (user.get("push_tokens") or []) if t.get("token", "").startswith("ExponentPushToken")]
    if not tokens:
        # Still log it for debug
        await db.push_outbox.insert_one({
            "user_id": user_id, "title": title, "body": body, "data": data, "category": category,
            "tokens_count": 0, "status": "no_tokens",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"sent": 0, "reason": "no_tokens"}

    messages = [{"to": t, "title": title, "body": body, "data": data or {}, "sound": "default", "channelId": "default"} for t in tokens]
    res = await _send_via_expo(messages)

    await db.push_outbox.insert_one({
        "user_id": user_id, "title": title, "body": body, "data": data, "category": category,
        "tokens_count": len(tokens), "status": "sent" if res.get("sent") else "failed",
        "expo_response": res,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return res


# ---------------------------------------------------------------------------
# Admin/manual triggers
# ---------------------------------------------------------------------------
@router.post("/send")
async def admin_send_push(body: SendPushBody, request: Request, payload=Depends(get_current_admin_payload)):
    db = request.app.state.db
    return await send_push(db, body.user_id, body.title, body.body, body.data, "admin_manual")


@router.post("/scheduler/run")
async def scheduler_run(request: Request, payload=Depends(get_current_admin_payload)):
    """Manually trigger reminder scheduler. In production, call from a cron job daily."""
    db = request.app.state.db
    now = datetime.now(timezone.utc)
    counters = {"daily_reminders": 0, "streak_saves": 0, "winback": 0, "abandoned_checkout": 0}

    # 1. Daily reminders: users who haven't been active today
    cutoff = (now - timedelta(hours=20)).isoformat()
    users = await db.users.find({"role": "user", "stats.last_activity": {"$lt": cutoff}, "push_settings.enabled": {"$ne": False}}, {"_id": 0, "id": 1, "name": 1, "stats": 1}).to_list(2000)
    for u in users:
        streak = u.get("stats", {}).get("streak_days", 0)
        if streak >= 3:
            await send_push(db, u["id"], "🔥 Salva la tua streak!", f"Sei a {streak} giorni di fila. Non perderla, fai una lezione veloce!", {"action": "open_home"}, "streak_save")
            counters["streak_saves"] += 1
        else:
            await send_push(db, u["id"], "📚 È ora di studiare!", f"Ciao {u['name']}, dedica 5 minuti al codice oggi.", {"action": "open_home"}, "daily_reminder")
            counters["daily_reminders"] += 1

    # 2. Winback: users inactive 7+ days
    winback_cutoff = (now - timedelta(days=7)).isoformat()
    inactive = await db.users.find({"role": "user", "stats.last_activity": {"$lt": winback_cutoff}}, {"_id": 0, "id": 1, "name": 1}).to_list(500)
    for u in inactive:
        await send_push(db, u["id"], f"Ti aspettiamo {u['name']}! 👋", "Riprendi da dove avevi lasciato. Hai sbloccato uno sconto del 20%!", {"action": "open_pricing", "coupon": "WELCOME20"}, "winback")
        counters["winback"] += 1

    # 3. Abandoned checkout: users with pending payment_transactions older than 1h
    abandoned_cutoff = (now - timedelta(hours=1)).isoformat()
    pending = await db.payment_transactions.find({"payment_status": "pending", "created_at": {"$lt": abandoned_cutoff}}, {"_id": 0}).to_list(500)
    seen_users = set()
    for txn in pending:
        if txn["user_id"] in seen_users:
            continue
        seen_users.add(txn["user_id"])
        await send_push(db, txn["user_id"], "🛒 Hai dimenticato qualcosa?", f"Completa l'acquisto del piano {txn['plan_id']}. Coupon: WELCOME20!", {"action": "open_pricing", "plan_id": txn["plan_id"]}, "abandoned_checkout")
        counters["abandoned_checkout"] += 1

    return {"counters": counters, "ran_at": now.isoformat()}


@router.get("/outbox")
async def list_outbox(request: Request, payload=Depends(get_current_admin_payload)):
    db = request.app.state.db
    return await db.push_outbox.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
