"""Advanced admin: full CRUD + retention analytics."""
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

from auth import get_current_admin_payload

router = APIRouter(prefix="/api/admin", tags=["admin-advanced"])


def _db(request: Request):
    return request.app.state.db


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Lessons CRUD
# ---------------------------------------------------------------------------
class LessonUpdate(BaseModel):
    title: Optional[Dict[str, str]] = None
    content: Optional[Dict[str, str]] = None
    code: Optional[str] = None
    code_explanation: Optional[Dict[str, str]] = None
    order: Optional[int] = None
    is_premium: Optional[bool] = None


@router.put("/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, body: LessonUpdate, request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if not upd:
        raise HTTPException(400, "Nothing to update")
    upd["updated_at"] = now_iso()
    res = await db.lessons.update_one({"id": lesson_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(404, "Lesson not found")
    return {"success": True, "updated_fields": list(upd.keys())}


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    await db.lessons.delete_one({"id": lesson_id})
    await db.courses.update_one(
        {"id": lesson["course_id"]},
        {"$pull": {"lesson_ids": lesson_id}},
    )
    return {"success": True}


# ---------------------------------------------------------------------------
# Quizzes CRUD
# ---------------------------------------------------------------------------
class QuizCreate(BaseModel):
    language_id: str
    level: str
    title: Dict[str, str]
    questions: List[Dict]


@router.post("/quizzes")
async def create_quiz(body: QuizCreate, request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    course_id = f"course_{body.language_id}_{body.level}"
    if not await db.courses.find_one({"id": course_id}):
        raise HTTPException(404, "Course not found")
    import uuid
    quiz_id = f"quiz_admin_{uuid.uuid4().hex[:8]}"
    await db.quizzes.insert_one({
        "id": quiz_id,
        "course_id": course_id,
        "language_id": body.language_id,
        "level": body.level,
        "title": body.title,
        "questions": body.questions,
        "is_premium": body.level in ("advanced", "pro"),
        "created_at": now_iso(),
    })
    await db.courses.update_one({"id": course_id}, {"$push": {"quiz_ids": quiz_id}})
    return {"success": True, "quiz_id": quiz_id}


@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str, request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    quiz = await db.quizzes.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    await db.quizzes.delete_one({"id": quiz_id})
    await db.courses.update_one({"id": quiz["course_id"]}, {"$pull": {"quiz_ids": quiz_id}})
    return {"success": True}


# ---------------------------------------------------------------------------
# Users management
# ---------------------------------------------------------------------------
class UserPlanUpdate(BaseModel):
    plan_id: str
    active: bool = True
    expires_at: Optional[str] = None


@router.put("/users/{user_id}/subscription")
async def update_user_subscription(user_id: str, body: UserPlanUpdate, request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    res = await db.users.update_one(
        {"id": user_id},
        {"$set": {"subscription": {
            "plan_id": body.plan_id,
            "active": body.active,
            "expires_at": body.expires_at,
            "is_mock": True,
            "set_by_admin": True,
            "last_payment_at": now_iso(),
        }}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "User not found")
    return {"success": True}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    if user_id == payload["sub"]:
        raise HTTPException(400, "Cannot delete yourself")
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("role") == "admin":
        raise HTTPException(400, "Cannot delete admin users")
    await db.users.delete_one({"id": user_id})
    await db.progress.delete_many({"user_id": user_id})
    await db.tutor_messages.delete_many({"user_id": user_id})
    return {"success": True}


# ---------------------------------------------------------------------------
# Coupons management
# ---------------------------------------------------------------------------
class CouponCreate(BaseModel):
    code: str
    discount_percent: int
    uses_left: int = 100
    active: bool = True


@router.post("/coupons")
async def admin_create_coupon(body: CouponCreate, request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    code = body.code.strip().upper()
    if await db.coupons.find_one({"code": code}):
        raise HTTPException(400, "Coupon already exists")
    if body.discount_percent < 1 or body.discount_percent > 95:
        raise HTTPException(400, "Discount must be 1-95")
    await db.coupons.insert_one({
        "code": code,
        "discount_percent": body.discount_percent,
        "uses_left": body.uses_left,
        "active": body.active,
        "created_at": now_iso(),
    })
    return {"success": True, "code": code}


@router.get("/coupons")
async def admin_list_coupons(request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    return await db.coupons.find({}, {"_id": 0}).to_list(200)


# ---------------------------------------------------------------------------
# Retention & conversion analytics
# ---------------------------------------------------------------------------
@router.get("/analytics/retention")
async def retention_analytics(request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    now = datetime.now(timezone.utc)
    day1 = (now - timedelta(days=1)).isoformat()
    day7 = (now - timedelta(days=7)).isoformat()
    day30 = (now - timedelta(days=30)).isoformat()

    total = await db.users.count_documents({"role": "user"})
    active_24h = await db.users.count_documents({"role": "user", "stats.last_activity": {"$gte": day1}})
    active_7d = await db.users.count_documents({"role": "user", "stats.last_activity": {"$gte": day7}})
    active_30d = await db.users.count_documents({"role": "user", "stats.last_activity": {"$gte": day30}})

    # Streak distribution
    streak_pipeline = [
        {"$match": {"role": "user"}},
        {"$bucket": {"groupBy": "$stats.streak_days", "boundaries": [0, 1, 3, 7, 14, 30, 1000], "default": "other"}},
    ]
    streak_buckets = await db.users.aggregate(streak_pipeline).to_list(20)

    # Plan distribution
    plan_pipeline = [
        {"$match": {"role": "user"}},
        {"$group": {"_id": "$subscription.plan_id", "count": {"$sum": 1}}},
    ]
    plan_dist = await db.users.aggregate(plan_pipeline).to_list(10)

    # Total revenue (sum of paid transactions)
    rev_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    rev_agg = await db.payment_transactions.aggregate(rev_pipeline).to_list(1)
    total_revenue = rev_agg[0]["total"] if rev_agg else 0
    paid_count = rev_agg[0]["count"] if rev_agg else 0

    return {
        "total_users": total,
        "active_24h": active_24h,
        "active_7d": active_7d,
        "active_30d": active_30d,
        "retention_7d_percent": round((active_7d / total) * 100, 1) if total else 0,
        "retention_30d_percent": round((active_30d / total) * 100, 1) if total else 0,
        "streak_buckets": streak_buckets,
        "plan_distribution": plan_dist,
        "total_revenue_eur": round(total_revenue, 2),
        "paid_transactions": paid_count,
        "arpu": round(total_revenue / total, 2) if total else 0,
    }


@router.get("/analytics/conversion-funnel")
async def conversion_funnel(request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    total = await db.users.count_documents({"role": "user"})
    completed_one_lesson = await db.progress.distinct("user_id", {"type": "lesson", "completed": True})
    passed_one_quiz = await db.progress.distinct("user_id", {"type": "quiz", "passed": True})
    pro_users = await db.users.count_documents({"role": "user", "subscription.plan_id": {"$in": ["pro_monthly", "pro_yearly", "lifetime"]}, "subscription.active": True})

    return {
        "registered": total,
        "completed_first_lesson": len(completed_one_lesson),
        "passed_first_quiz": len(passed_one_quiz),
        "subscribed_pro": pro_users,
        "lesson_engagement_percent": round((len(completed_one_lesson) / total) * 100, 1) if total else 0,
        "conversion_to_pro_percent": round((pro_users / total) * 100, 2) if total else 0,
    }


@router.get("/transactions")
async def admin_transactions(request: Request, payload=Depends(get_current_admin_payload)):
    db = _db(request)
    return await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
