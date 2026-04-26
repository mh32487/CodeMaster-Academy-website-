"""Daily missions, weekly challenges, user levels, advanced AI tutor."""
import os
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

from auth import get_current_user_payload

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    HAS_LLM = True
except Exception:
    HAS_LLM = False

router = APIRouter(prefix="/api", tags=["gamification"])
logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def today_iso() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def week_iso() -> str:
    """Return ISO week key like 2026-W17."""
    d = datetime.now(timezone.utc).date()
    y, w, _ = d.isocalendar()
    return f"{y}-W{w:02d}"


def compute_level(xp: int) -> Dict:
    """Each level requires +200 XP more than previous. Level n: total = 100 * n * (n+1)."""
    n = 1
    while 100 * n * (n + 1) <= xp:
        n += 1
    current = 100 * (n - 1) * n
    next_threshold = 100 * n * (n + 1)
    return {
        "level": n,
        "current_threshold": current,
        "next_threshold": next_threshold,
        "progress_in_level": xp - current,
        "needed_for_next": next_threshold - xp,
    }


# ---------------------------------------------------------------------------
# Daily missions
# ---------------------------------------------------------------------------
DAILY_MISSION_TEMPLATES = [
    {"id": "complete_2_lessons", "title": {"it": "Completa 2 lezioni", "en": "Complete 2 lessons"}, "icon": "book-open-variant", "target": 2, "metric": "lessons", "xp_reward": 50, "color": "#3B82F6"},
    {"id": "pass_1_quiz", "title": {"it": "Supera 1 quiz", "en": "Pass 1 quiz"}, "icon": "help-circle", "target": 1, "metric": "quizzes_passed", "xp_reward": 40, "color": "#F59E0B"},
    {"id": "ask_tutor", "title": {"it": "Chiedi al tutor 1 volta", "en": "Ask the tutor once"}, "icon": "robot-happy", "target": 1, "metric": "tutor_messages", "xp_reward": 20, "color": "#8B5CF6"},
    {"id": "earn_50_xp", "title": {"it": "Guadagna 50 XP", "en": "Earn 50 XP"}, "icon": "diamond-stone", "target": 50, "metric": "xp_today", "xp_reward": 30, "color": "#0EA5E9"},
]


def _db(request: Request):
    return request.app.state.db


async def get_or_create_daily_missions(db, user_id: str):
    today = today_iso()
    doc = await db.user_missions.find_one({"user_id": user_id, "date": today}, {"_id": 0})
    if doc:
        return doc

    # Create today's missions (rotate 3 of 4)
    import random
    chosen = random.sample(DAILY_MISSION_TEMPLATES, k=3)
    missions = [{**m, "progress": 0, "completed": False, "claimed": False} for m in chosen]
    new = {
        "user_id": user_id,
        "date": today,
        "missions": missions,
        "all_claimed": False,
        "created_at": now_iso(),
    }
    await db.user_missions.insert_one(new)
    new.pop("_id", None)
    return new


async def increment_mission_metric(db, user_id: str, metric: str, amount: int = 1):
    today = today_iso()
    doc = await db.user_missions.find_one({"user_id": user_id, "date": today})
    if not doc:
        await get_or_create_daily_missions(db, user_id)
        doc = await db.user_missions.find_one({"user_id": user_id, "date": today})
    if not doc:
        return
    changed = False
    for m in doc["missions"]:
        if m["metric"] == metric and not m["completed"]:
            m["progress"] = min(m["target"], m["progress"] + amount)
            if m["progress"] >= m["target"]:
                m["completed"] = True
            changed = True
    if changed:
        await db.user_missions.update_one(
            {"user_id": user_id, "date": today},
            {"$set": {"missions": doc["missions"]}},
        )


@router.get("/missions/today")
async def my_today_missions(request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    doc = await get_or_create_daily_missions(db, payload["sub"])
    doc.pop("_id", None)
    return doc


class ClaimMissionBody(BaseModel):
    mission_id: str


@router.post("/missions/claim")
async def claim_mission(body: ClaimMissionBody, request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    user_id = payload["sub"]
    today = today_iso()
    doc = await db.user_missions.find_one({"user_id": user_id, "date": today})
    if not doc:
        raise HTTPException(404, "Missioni non trovate")
    target_xp = 0
    for m in doc["missions"]:
        if m["id"] == body.mission_id:
            if not m.get("completed"):
                raise HTTPException(400, "Missione non completata")
            if m.get("claimed"):
                raise HTTPException(400, "Già riscattata")
            m["claimed"] = True
            target_xp = m["xp_reward"]
    await db.user_missions.update_one(
        {"user_id": user_id, "date": today},
        {"$set": {"missions": doc["missions"]}},
    )
    if target_xp:
        await db.users.update_one({"id": user_id}, {"$inc": {"stats.xp": target_xp}})
    return {"xp_gained": target_xp}


# ---------------------------------------------------------------------------
# Weekly challenges
# ---------------------------------------------------------------------------
WEEKLY_CHALLENGE_TEMPLATES = [
    {"id": "weekly_15_lessons", "title": {"it": "Completa 15 lezioni questa settimana", "en": "Complete 15 lessons this week"}, "icon": "rocket-launch", "target": 15, "metric": "lessons", "xp_reward": 300, "color": "#3B82F6"},
    {"id": "weekly_5_quizzes", "title": {"it": "Supera 5 quiz", "en": "Pass 5 quizzes"}, "icon": "trophy", "target": 5, "metric": "quizzes_passed", "xp_reward": 250, "color": "#F59E0B"},
    {"id": "weekly_streak_7", "title": {"it": "Mantieni 7 giorni di streak", "en": "Keep a 7-day streak"}, "icon": "fire", "target": 7, "metric": "streak_days", "xp_reward": 400, "color": "#EF4444"},
]


async def get_weekly_challenge(db, user_id: str):
    week = week_iso()
    doc = await db.user_challenges.find_one({"user_id": user_id, "week": week}, {"_id": 0})
    if doc:
        return doc

    # Pick a deterministic challenge (first template; in prod could rotate)
    import hashlib
    h = int(hashlib.md5(f"{user_id}{week}".encode()).hexdigest(), 16)
    template = WEEKLY_CHALLENGE_TEMPLATES[h % len(WEEKLY_CHALLENGE_TEMPLATES)]
    doc = {
        "user_id": user_id,
        "week": week,
        "challenge": {**template, "progress": 0, "completed": False, "claimed": False},
        "created_at": now_iso(),
    }
    await db.user_challenges.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def increment_challenge_metric(db, user_id: str, metric: str, amount: int = 1, set_value: Optional[int] = None):
    week = week_iso()
    doc = await db.user_challenges.find_one({"user_id": user_id, "week": week})
    if not doc:
        await get_weekly_challenge(db, user_id)
        doc = await db.user_challenges.find_one({"user_id": user_id, "week": week})
    if not doc:
        return
    ch = doc["challenge"]
    if ch["metric"] != metric or ch.get("completed"):
        return
    if set_value is not None:
        ch["progress"] = min(ch["target"], set_value)
    else:
        ch["progress"] = min(ch["target"], ch["progress"] + amount)
    if ch["progress"] >= ch["target"]:
        ch["completed"] = True
    await db.user_challenges.update_one({"user_id": user_id, "week": week}, {"$set": {"challenge": ch}})


@router.get("/challenges/weekly")
async def my_weekly_challenge(request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    doc = await get_weekly_challenge(db, payload["sub"])
    doc.pop("_id", None)
    return doc


@router.post("/challenges/weekly/claim")
async def claim_weekly_challenge(request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    user_id = payload["sub"]
    week = week_iso()
    doc = await db.user_challenges.find_one({"user_id": user_id, "week": week})
    if not doc:
        raise HTTPException(404, "Sfida non trovata")
    ch = doc["challenge"]
    if not ch.get("completed"):
        raise HTTPException(400, "Sfida non completata")
    if ch.get("claimed"):
        raise HTTPException(400, "Già riscattata")
    ch["claimed"] = True
    await db.user_challenges.update_one({"user_id": user_id, "week": week}, {"$set": {"challenge": ch}})
    await db.users.update_one({"id": user_id}, {"$inc": {"stats.xp": ch["xp_reward"]}})
    return {"xp_gained": ch["xp_reward"]}


# ---------------------------------------------------------------------------
# User level endpoint
# ---------------------------------------------------------------------------
@router.get("/level/me")
async def my_level(request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "User not found")
    return compute_level(user.get("stats", {}).get("xp", 0))


# ---------------------------------------------------------------------------
# Advanced AI Tutor
# ---------------------------------------------------------------------------
class CodeAnalyzeBody(BaseModel):
    code: str
    language: str = "python"
    user_lang: str = "it"
    expected_output: Optional[str] = None


class StudyPlanBody(BaseModel):
    goal: str  # e.g. "diventare web developer", "automazione python"
    weekly_hours: int = 5
    user_lang: str = "it"


def _lang_label(code: str) -> str:
    return {"it": "italiano", "en": "English", "es": "español", "fr": "français", "de": "Deutsch", "pt": "português"}.get(code, "italiano")


@router.post("/tutor/analyze-code")
async def tutor_analyze_code(body: CodeAnalyzeBody, request: Request, payload=Depends(get_current_user_payload)):
    if not HAS_LLM or not EMERGENT_LLM_KEY:
        return {"feedback": "(AI offline) Analisi non disponibile.", "suggestions": [], "errors": []}

    system = (
        f"Sei un esperto reviewer di codice {body.language}. Rispondi in {_lang_label(body.user_lang)}. "
        f"Analizza il codice fornito. Output rigorosamente JSON con queste chiavi: "
        f"`feedback` (string, breve riassunto), "
        f"`errors` (array di string con errori riscontrati), "
        f"`suggestions` (array di string con miglioramenti), "
        f"`fixed_code` (string con la versione corretta), "
        f"`difficulty_estimate` (string: base|intermedio|avanzato). "
        f"Restituisci SOLO il JSON, senza markdown."
    )
    user_prompt = f"Codice {body.language} da analizzare:\n```\n{body.code}\n```"
    if body.expected_output:
        user_prompt += f"\n\nOutput atteso: {body.expected_output}"

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"analyze_{payload['sub']}_{datetime.now().timestamp()}",
            system_message=system,
        ).with_model("openai", "gpt-5.2")
        reply = await chat.send_message(UserMessage(text=user_prompt))
        # Try to parse JSON; tolerate ```json fences
        cleaned = reply.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        result = json.loads(cleaned.strip())
    except Exception as e:
        logger.error(f"Code analyze fail: {e}")
        return {"feedback": "Analisi non riuscita. Riprova.", "errors": [str(e)[:120]], "suggestions": [], "fixed_code": "", "difficulty_estimate": "base"}

    return result


@router.post("/tutor/study-plan")
async def tutor_study_plan(body: StudyPlanBody, request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    level_info = compute_level(user.get("stats", {}).get("xp", 0)) if user else {"level": 1}

    if not HAS_LLM or not EMERGENT_LLM_KEY:
        return {"plan": []}

    system = (
        f"Sei un coach educativo per studenti di programmazione. Rispondi in {_lang_label(body.user_lang)}. "
        f"Lo studente è livello {level_info['level']} con {body.weekly_hours} ore/settimana disponibili. "
        f"Genera un piano di studio strutturato in 4 settimane. "
        f"Output rigorosamente JSON come array di oggetti, ognuno con chiavi: "
        f"`week` (int), `theme` (string), `topics` (array di string), `practice` (string), `estimated_hours` (int). "
        f"Restituisci SOLO il JSON array, senza markdown."
    )
    prompt = f"Obiettivo: {body.goal}"

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"plan_{payload['sub']}_{datetime.now().timestamp()}",
            system_message=system,
        ).with_model("openai", "gpt-5.2")
        reply = await chat.send_message(UserMessage(text=prompt))
        cleaned = reply.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        plan = json.loads(cleaned.strip())
    except Exception as e:
        logger.error(f"Study plan fail: {e}")
        return {"plan": [], "error": str(e)[:120]}

    # Persist plan
    plan_doc = {
        "user_id": payload["sub"],
        "goal": body.goal,
        "weekly_hours": body.weekly_hours,
        "plan": plan,
        "created_at": now_iso(),
    }
    await db.study_plans.insert_one(plan_doc)
    return {"plan": plan, "goal": body.goal}


@router.get("/tutor/study-plan/me")
async def get_my_study_plan(request: Request, payload=Depends(get_current_user_payload)):
    db = _db(request)
    doc = await db.study_plans.find_one({"user_id": payload["sub"]}, {"_id": 0}, sort=[("created_at", -1)])
    return doc or {}
