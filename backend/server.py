"""CodeMaster Academy backend - FastAPI."""
import os
import uuid
import logging
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_payload,
    get_current_admin_payload,
    decode_token,
)
import jwt as _pyjwt
from billing import router as billing_router, handle_stripe_webhook_request
from certificates_pdf import router as certificates_router
from missions import (
    router as gamification_router,
    increment_mission_metric,
    increment_challenge_metric,
)
from admin_advanced import router as admin_advanced_router
from legal import router as legal_router
from email_service import router as email_router, send_email
from push_service import router as push_router, send_push
from affiliate import router as affiliate_router
from seed_data import (
    LANGUAGES,
    LEVELS,
    LEVEL_TITLES,
    LANGUAGE_CONTENT,
    PATHS,
    PROJECTS,
    PLANS,
    BADGES,
    _placeholder_lessons,
    _placeholder_quizzes,
    _placeholder_exercises,
)

# Try to import emergentintegrations - optional for AI tutor
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
    HAS_LLM = True
except Exception as e:
    logging.warning(f"emergentintegrations not available: {e}")
    HAS_LLM = False

# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="CodeMaster Academy API")
app.state.db = db  # Expose db to routers via request.app.state.db

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def gen_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"


def gen_referral_code() -> str:
    return uuid.uuid4().hex[:8].upper()


def clean_doc(d: dict) -> dict:
    """Remove _id from MongoDB documents."""
    if d is None:
        return d
    d.pop("_id", None)
    return d


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)
    language: str = "it"
    referral_code: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LessonCompleteRequest(BaseModel):
    lesson_id: str


class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: List[int]


class ExerciseSubmitRequest(BaseModel):
    exercise_id: str
    code: str


class TutorChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    language: str = "it"
    context: Optional[str] = None  # e.g., a lesson title


class CheckoutRequest(BaseModel):
    plan_id: str


class AdminLessonCreate(BaseModel):
    language_id: str
    level: str
    title: Dict[str, str]
    content: Dict[str, str]
    code: str = ""
    code_explanation: Dict[str, str] = {}
    order: int = 999


class AdminLanguageCreate(BaseModel):
    id: str
    name: str
    icon_family: str = "MaterialIcons"
    icon_name: str = "code"
    color: str = "#3B82F6"
    tagline: Dict[str, str]
    has_full_content: bool = False
    order: int = 99


# ---------------------------------------------------------------------------
# Seeder
# ---------------------------------------------------------------------------
async def seed_database():
    """Idempotent seeding of languages, courses, lessons, quizzes, exercises, paths, projects, plans, badges."""
    existing = await db.languages.count_documents({})
    if existing >= len(LANGUAGES):
        logger.info("DB already seeded; skipping.")
    else:
        logger.info("Seeding database...")
        await db.languages.delete_many({})
        await db.courses.delete_many({})
        await db.lessons.delete_many({})
        await db.quizzes.delete_many({})
        await db.exercises.delete_many({})

        for lang in LANGUAGES:
            await db.languages.insert_one(dict(lang))

            # Determine content
            if lang["id"] in LANGUAGE_CONTENT:
                lessons_map, quizzes_map, exercises_map = LANGUAGE_CONTENT[lang["id"]]
            else:
                lessons_map = _placeholder_lessons(lang["name"])
                quizzes_map = _placeholder_quizzes(lang["name"])
                exercises_map = _placeholder_exercises(lang["name"])

            for level in LEVELS:
                course_id = f"course_{lang['id']}_{level}"
                course = {
                    "id": course_id,
                    "language_id": lang["id"],
                    "level": level,
                    "title": LEVEL_TITLES[level],
                    "lesson_ids": [],
                    "quiz_ids": [],
                    "exercise_ids": [],
                    "is_premium": level in ("advanced", "pro"),
                    "created_at": now_iso(),
                }

                # Lessons
                for idx, l in enumerate(lessons_map.get(level, [])):
                    lesson_id = f"lesson_{lang['id']}_{level}_{idx}"
                    await db.lessons.insert_one({
                        "id": lesson_id,
                        "course_id": course_id,
                        "language_id": lang["id"],
                        "level": level,
                        "order": idx,
                        "title": l["title"],
                        "content": l["content"],
                        "code": l.get("code", ""),
                        "code_explanation": l.get("code_explanation", {}),
                        "is_premium": level in ("advanced", "pro"),
                        "created_at": now_iso(),
                    })
                    course["lesson_ids"].append(lesson_id)

                # Quiz
                quiz_questions = quizzes_map.get(level, [])
                if quiz_questions:
                    quiz_id = f"quiz_{lang['id']}_{level}"
                    await db.quizzes.insert_one({
                        "id": quiz_id,
                        "course_id": course_id,
                        "language_id": lang["id"],
                        "level": level,
                        "title": {l_code: f"Quiz {LEVEL_TITLES[level][l_code]} - {lang['name']}" for l_code in ("it", "en", "es", "fr", "de", "pt")},
                        "questions": quiz_questions,
                        "is_premium": level in ("advanced", "pro"),
                        "created_at": now_iso(),
                    })
                    course["quiz_ids"].append(quiz_id)

                # Exercises
                for idx, ex in enumerate(exercises_map.get(level, [])):
                    ex_id = f"ex_{lang['id']}_{level}_{idx}"
                    await db.exercises.insert_one({
                        "id": ex_id,
                        "course_id": course_id,
                        "language_id": lang["id"],
                        "level": level,
                        "order": idx,
                        "title": ex["title"],
                        "instructions": ex["instructions"],
                        "starter_code": ex["starter_code"],
                        "solution": ex["solution"],
                        "expected_output": ex.get("expected_output", ""),
                        "is_premium": level in ("advanced", "pro"),
                        "created_at": now_iso(),
                    })
                    course["exercise_ids"].append(ex_id)

                await db.courses.insert_one(course)

        logger.info(f"Seeded {len(LANGUAGES)} languages with courses.")

    # Paths, projects, plans, badges - always re-upsert
    await db.paths.delete_many({})
    for p in PATHS:
        await db.paths.insert_one(dict(p))

    await db.projects.delete_many({})
    for p in PROJECTS:
        await db.projects.insert_one(dict(p))

    await db.plans.delete_many({})
    for p in PLANS:
        await db.plans.insert_one(dict(p))

    await db.badges.delete_many({})
    for b in BADGES:
        await db.badges.insert_one(dict(b))

    # Seed admin user
    admin_email = "admin@codemaster.app"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "id": gen_id("user_"),
            "email": admin_email,
            "name": "Admin",
            "password_hash": hash_password("Admin123!"),
            "role": "admin",
            "language": "it",
            "referral_code": gen_referral_code(),
            "referred_by": None,
            "subscription": {"plan_id": "lifetime", "active": True, "expires_at": None},
            "stats": {"xp": 0, "streak_days": 0, "lessons_completed": 0, "quizzes_passed": 0, "projects_completed": 0, "last_activity": now_iso()},
            "badges": [],
            "created_at": now_iso(),
        })
        logger.info("Admin user created: admin@codemaster.app / Admin123!")

    # Seed demo user
    demo_email = "demo@codemaster.app"
    existing_demo = await db.users.find_one({"email": demo_email})
    if not existing_demo:
        await db.users.insert_one({
            "id": gen_id("user_"),
            "email": demo_email,
            "name": "Demo Student",
            "password_hash": hash_password("Demo123!"),
            "role": "user",
            "language": "it",
            "referral_code": gen_referral_code(),
            "referred_by": None,
            "subscription": {"plan_id": "free", "active": True, "expires_at": None},
            "stats": {"xp": 320, "streak_days": 5, "lessons_completed": 12, "quizzes_passed": 3, "projects_completed": 1, "last_activity": now_iso()},
            "badges": ["first_lesson", "lesson_5", "first_quiz"],
            "created_at": now_iso(),
        })
        logger.info("Demo user created: demo@codemaster.app / Demo123!")

    # Seed leaderboard sample users (for ranking aesthetics)
    if await db.users.count_documents({}) < 12:
        sample_users = [
            ("Alice", 1450, 12), ("Marco", 1320, 9), ("Sofia", 1180, 7),
            ("Lucas", 980, 4), ("Emma", 870, 6), ("Davide", 720, 5),
            ("Giulia", 650, 3), ("Niko", 540, 2), ("Chloe", 410, 4),
        ]
        for name, xp, streak in sample_users:
            email = f"{name.lower()}@codemaster.app"
            if not await db.users.find_one({"email": email}):
                await db.users.insert_one({
                    "id": gen_id("user_"),
                    "email": email,
                    "name": name,
                    "password_hash": hash_password("Demo123!"),
                    "role": "user",
                    "language": "it",
                    "referral_code": gen_referral_code(),
                    "referred_by": None,
                    "subscription": {"plan_id": "free", "active": True, "expires_at": None},
                    "stats": {"xp": xp, "streak_days": streak, "lessons_completed": xp // 30, "quizzes_passed": xp // 100, "projects_completed": xp // 500, "last_activity": now_iso()},
                    "badges": ["first_lesson", "lesson_5"] if xp >= 200 else ["first_lesson"],
                    "created_at": now_iso(),
                })
        logger.info("Sample leaderboard users seeded.")


@app.on_event("startup")
async def on_startup():
    await seed_database()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def get_user(user_id: str) -> Optional[dict]:
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return user


async def award_badge(user_id: str, badge_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        return
    if badge_id in (user.get("badges") or []):
        return
    await db.users.update_one({"id": user_id}, {"$push": {"badges": badge_id}})


async def evaluate_badges(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return
    stats = user.get("stats") or {}
    if stats.get("lessons_completed", 0) >= 1:
        await award_badge(user_id, "first_lesson")
    if stats.get("lessons_completed", 0) >= 5:
        await award_badge(user_id, "lesson_5")
    if stats.get("lessons_completed", 0) >= 25:
        await award_badge(user_id, "lesson_25")
    if stats.get("quizzes_passed", 0) >= 1:
        await award_badge(user_id, "first_quiz")
    if stats.get("streak_days", 0) >= 3:
        await award_badge(user_id, "streak_3")
    if stats.get("streak_days", 0) >= 7:
        await award_badge(user_id, "streak_7")
    if stats.get("projects_completed", 0) >= 1:
        await award_badge(user_id, "first_project")


async def update_streak(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        return
    last = user.get("stats", {}).get("last_activity")
    streak = user.get("stats", {}).get("streak_days", 0)
    today = datetime.now(timezone.utc).date()
    new_streak = streak
    try:
        if last:
            last_date = datetime.fromisoformat(last.replace("Z", "+00:00")).date()
            diff = (today - last_date).days
            if diff == 0:
                new_streak = streak  # same day
            elif diff == 1:
                new_streak = streak + 1
            else:
                new_streak = 1
        else:
            new_streak = 1
    except Exception:
        new_streak = max(1, streak)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"stats.streak_days": new_streak, "stats.last_activity": now_iso()}},
    )


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"app": "CodeMaster Academy", "status": "ok", "version": "1.0.0"}


@api.post("/auth/register")
async def register(body: RegisterRequest, request: Request):
    return await _register_impl(body)

@api.post("/auth/login")
@limiter.limit("10/minute")
async def login(body: LoginRequest, request: Request):
    return await _login_impl(body)


async def _register_impl(body: RegisterRequest):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    referred_by = None
    if body.referral_code:
        referrer = await db.users.find_one({"referral_code": body.referral_code.upper()})
        if referrer:
            referred_by = referrer["id"]
            # Award 50 XP to referrer
            await db.users.update_one({"id": referrer["id"]}, {"$inc": {"stats.xp": 50}})

    user_id = gen_id("user_")
    user_doc = {
        "id": user_id,
        "email": body.email.lower(),
        "name": body.name,
        "password_hash": hash_password(body.password),
        "role": "user",
        "language": body.language,
        "referral_code": gen_referral_code(),
        "referred_by": referred_by,
        "subscription": {"plan_id": "free", "active": True, "expires_at": None},
        "stats": {"xp": 0, "streak_days": 0, "lessons_completed": 0, "quizzes_passed": 0, "projects_completed": 0, "last_activity": now_iso()},
        "badges": [],
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)

    # Send welcome email (best-effort, mock provider logs to db)
    try:
        await send_email(db, body.email.lower(), "welcome", {"name": body.name, "referral_code": user_doc["referral_code"]}, body.language)
    except Exception:
        pass

    token = create_access_token(user_id, body.email.lower(), "user")
    user = await get_user(user_id)
    return {"token": token, "user": user}


@api.post("/auth/refresh")
async def auth_refresh(payload=Depends(get_current_user_payload)):
    """Issue a fresh access token without re-login (uses still-valid token)."""
    new_token = create_access_token(payload["sub"], payload.get("email", ""), payload.get("role", "user"))
    return {"token": new_token}


async def _login_impl(body: LoginRequest):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"], user["email"], user.get("role", "user"))
    user_clean = await get_user(user["id"])
    return {"token": token, "user": user_clean}


@api.get("/auth/me")
async def me(payload=Depends(get_current_user_payload)):
    user = await get_user(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Languages / Courses / Lessons / Quizzes / Exercises
# ---------------------------------------------------------------------------
@api.get("/languages")
async def list_languages():
    docs = await db.languages.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return docs


@api.get("/languages/{language_id}")
async def get_language(language_id: str):
    lang = await db.languages.find_one({"id": language_id}, {"_id": 0})
    if not lang:
        raise HTTPException(status_code=404, detail="Language not found")
    courses = await db.courses.find({"language_id": language_id}, {"_id": 0}).to_list(100)
    # Order by level
    order = {l: i for i, l in enumerate(LEVELS)}
    courses.sort(key=lambda c: order.get(c["level"], 999))
    return {"language": lang, "courses": courses}


@api.get("/courses/{course_id}")
async def get_course(course_id: str, payload=Depends(get_current_user_payload)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(200)
    quizzes = await db.quizzes.find({"course_id": course_id}, {"_id": 0}).to_list(50)
    exercises = await db.exercises.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(200)

    # Compute completion %
    user_id = payload["sub"]
    progress = await db.progress.find({"user_id": user_id, "course_id": course_id}).to_list(500)
    completed_lessons = {p["lesson_id"] for p in progress if p.get("type") == "lesson" and p.get("completed")}
    total_lessons = len(lessons)
    completion = round((len(completed_lessons) / total_lessons) * 100) if total_lessons else 0

    return {
        "course": course,
        "lessons": lessons,
        "quizzes": quizzes,
        "exercises": exercises,
        "completed_lesson_ids": list(completed_lessons),
        "completion_percent": completion,
    }


@api.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str, payload=Depends(get_current_user_payload)):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    user_id = payload["sub"]
    completed = await db.progress.find_one({"user_id": user_id, "lesson_id": lesson_id, "type": "lesson"})
    return {"lesson": lesson, "completed": bool(completed and completed.get("completed"))}


@api.post("/lessons/complete")
async def complete_lesson(body: LessonCompleteRequest, payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    lesson = await db.lessons.find_one({"id": body.lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing = await db.progress.find_one({"user_id": user_id, "lesson_id": body.lesson_id, "type": "lesson"})
    if existing and existing.get("completed"):
        return {"already_completed": True, "xp_gained": 0}

    if existing:
        await db.progress.update_one({"_id": existing["_id"]}, {"$set": {"completed": True, "completed_at": now_iso()}})
    else:
        await db.progress.insert_one({
            "id": gen_id("prog_"),
            "user_id": user_id,
            "type": "lesson",
            "lesson_id": body.lesson_id,
            "course_id": lesson["course_id"],
            "language_id": lesson["language_id"],
            "completed": True,
            "completed_at": now_iso(),
        })

    xp = 20
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"stats.xp": xp, "stats.lessons_completed": 1}},
    )
    await update_streak(user_id)
    await evaluate_badges(user_id)
    await increment_mission_metric(db, user_id, "lessons", 1)
    await increment_mission_metric(db, user_id, "xp_today", xp)
    await increment_challenge_metric(db, user_id, "lessons", 1)
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "stats.streak_days": 1})
    if user:
        await increment_challenge_metric(db, user_id, "streak_days", set_value=user.get("stats", {}).get("streak_days", 0))

    return {"already_completed": False, "xp_gained": xp}


@api.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str, payload=Depends(get_current_user_payload)):
    quiz = await db.quizzes.find_one({"id": quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@api.post("/quizzes/submit")
async def submit_quiz(body: QuizSubmitRequest, payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    quiz = await db.quizzes.find_one({"id": body.quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = quiz.get("questions", [])
    if len(body.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Answers count mismatch")

    correct = 0
    review = []
    for idx, q in enumerate(questions):
        is_right = body.answers[idx] == q["correct_index"]
        if is_right:
            correct += 1
        review.append({
            "question": q["question"],
            "user_answer_index": body.answers[idx],
            "correct_index": q["correct_index"],
            "is_correct": is_right,
            "explanation": q.get("explanation", {}),
        })

    score = round((correct / len(questions)) * 100) if questions else 0
    passed = score >= 60
    perfect = score == 100

    await db.progress.insert_one({
        "id": gen_id("prog_"),
        "user_id": user_id,
        "type": "quiz",
        "quiz_id": body.quiz_id,
        "course_id": quiz["course_id"],
        "language_id": quiz["language_id"],
        "score": score,
        "passed": passed,
        "completed_at": now_iso(),
    })

    if passed:
        xp = 50 + (50 if perfect else 0)
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"stats.xp": xp, "stats.quizzes_passed": 1}},
        )
        await update_streak(user_id)
        await evaluate_badges(user_id)
        if perfect:
            await award_badge(user_id, "perfect_quiz")
    else:
        xp = 10

    return {"score": score, "correct": correct, "total": len(questions), "passed": passed, "perfect": perfect, "review": review, "xp_gained": xp if passed else 10}


@api.get("/exercises/{exercise_id}")
async def get_exercise(exercise_id: str, payload=Depends(get_current_user_payload)):
    ex = await db.exercises.find_one({"id": exercise_id}, {"_id": 0})
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex


@api.post("/exercises/submit")
async def submit_exercise(body: ExerciseSubmitRequest, payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    ex = await db.exercises.find_one({"id": body.exercise_id})
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    # Simple normalization-based check
    def norm(s: str) -> str:
        s = s or ""
        s = re.sub(r"\s+", " ", s).strip().lower()
        return s

    user_norm = norm(body.code)
    sol_norm = norm(ex["solution"])
    is_correct = user_norm == sol_norm

    if not is_correct:
        # Check if all key tokens of solution are present
        # fallback: very lenient match
        starter = ex.get("starter_code", "")
        # Check if filling the blank produces solution
        for blank in ["____", "___", "__"]:
            filled = starter.replace(blank, body.code.strip(), 1)
            if norm(filled) == sol_norm:
                is_correct = True
                break

    if is_correct:
        await db.progress.insert_one({
            "id": gen_id("prog_"),
            "user_id": user_id,
            "type": "exercise",
            "exercise_id": body.exercise_id,
            "course_id": ex["course_id"],
            "completed": True,
            "completed_at": now_iso(),
        })
        await db.users.update_one({"id": user_id}, {"$inc": {"stats.xp": 30}})
        await update_streak(user_id)

    return {"is_correct": is_correct, "expected_output": ex.get("expected_output", ""), "solution": ex["solution"], "xp_gained": 30 if is_correct else 0}


# ---------------------------------------------------------------------------
# Paths & Projects
# ---------------------------------------------------------------------------
@api.get("/paths")
async def list_paths():
    docs = await db.paths.find({}, {"_id": 0}).to_list(50)
    return docs


@api.get("/paths/{path_id}")
async def get_path(path_id: str):
    p = await db.paths.find_one({"id": path_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Path not found")
    # attach languages metadata
    langs = []
    for lid in p.get("languages", []):
        ld = await db.languages.find_one({"id": lid}, {"_id": 0})
        if ld:
            langs.append(ld)
    p["languages_full"] = langs
    return p


@api.get("/projects")
async def list_projects():
    docs = await db.projects.find({}, {"_id": 0}).to_list(50)
    return docs


@api.get("/projects/{project_id}")
async def get_project(project_id: str):
    p = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p


# ---------------------------------------------------------------------------
# Progress & Profile
# ---------------------------------------------------------------------------
@api.get("/progress/me")
async def my_progress(payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    user = await get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # All completed lesson ids
    progress_docs = await db.progress.find({"user_id": user_id, "type": "lesson", "completed": True}, {"_id": 0}).to_list(2000)
    quiz_docs = await db.progress.find({"user_id": user_id, "type": "quiz"}, {"_id": 0}).to_list(2000)

    total_lessons = await db.lessons.count_documents({})
    overall = round((len(progress_docs) / total_lessons) * 100) if total_lessons else 0

    badges = await db.badges.find({"id": {"$in": user.get("badges", [])}}, {"_id": 0}).to_list(50)

    return {
        "user": user,
        "lessons_completed": len(progress_docs),
        "total_lessons": total_lessons,
        "overall_percent": overall,
        "quizzes_taken": len(quiz_docs),
        "completed_lesson_ids": [p["lesson_id"] for p in progress_docs],
        "completed_quiz_ids": [p["quiz_id"] for p in quiz_docs],
        "badges_full": badges,
    }


@api.get("/badges")
async def list_badges():
    docs = await db.badges.find({}, {"_id": 0}).to_list(50)
    return docs


@api.get("/leaderboard")
async def leaderboard(limit: int = Query(20, ge=1, le=100)):
    users = await db.users.find({"role": "user"}, {"_id": 0, "password_hash": 0, "email": 0}).to_list(500)
    users.sort(key=lambda u: u.get("stats", {}).get("xp", 0), reverse=True)
    return [
        {
            "rank": i + 1,
            "user_id": u["id"],
            "name": u["name"],
            "xp": u.get("stats", {}).get("xp", 0),
            "streak": u.get("stats", {}).get("streak_days", 0),
            "lessons": u.get("stats", {}).get("lessons_completed", 0),
            "badges_count": len(u.get("badges", [])),
        }
        for i, u in enumerate(users[:limit])
    ]


# ---------------------------------------------------------------------------
# AI Tutor
# ---------------------------------------------------------------------------
@api.post("/tutor/chat")
async def tutor_chat(body: TutorChatRequest, payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    session_id = body.session_id or gen_id("tutor_")

    # Persist user message
    await db.tutor_messages.insert_one({
        "id": gen_id("msg_"),
        "user_id": user_id,
        "session_id": session_id,
        "role": "user",
        "content": body.message,
        "created_at": now_iso(),
    })

    lang_label = {"it": "italiano", "en": "English", "es": "español", "fr": "français", "de": "Deutsch", "pt": "português"}.get(body.language, "italiano")
    system_msg = (
        f"Sei un tutor esperto di programmazione di CodeMaster Academy. "
        f"Rispondi sempre in {lang_label}. Sei amichevole, paziente e diretto. "
        f"Quando spieghi codice, usa esempi concreti. Mantieni le risposte sotto i 200 termini "
        f"a meno che l'utente non chieda dettagli. Se rilevi un errore nel codice dell'utente, "
        f"spiegalo chiaramente e proponi una correzione."
    )
    if body.context:
        system_msg += f"\n\nContesto attuale: {body.context}"

    if not HAS_LLM or not EMERGENT_LLM_KEY:
        # Fallback simulated response
        reply = f"(Tutor offline) Hai chiesto: '{body.message[:100]}'. La spiegazione completa sarà disponibile quando l'AI Tutor sarà online."
    else:
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"{user_id}_{session_id}",
                system_message=system_msg,
            ).with_model("openai", "gpt-5.2")
            user_msg = UserMessage(text=body.message)
            reply = await chat.send_message(user_msg)
        except Exception as e:
            logger.error(f"Tutor error: {e}")
            reply = f"Errore AI Tutor: {str(e)[:120]}. Riprova tra qualche istante."

    await db.tutor_messages.insert_one({
        "id": gen_id("msg_"),
        "user_id": user_id,
        "session_id": session_id,
        "role": "assistant",
        "content": reply,
        "created_at": now_iso(),
    })

    # Mission tracking
    await increment_mission_metric(db, user_id, "tutor_messages", 1)

    return {"session_id": session_id, "reply": reply}


@api.get("/tutor/history")
async def tutor_history(session_id: str, payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    msgs = await db.tutor_messages.find({"user_id": user_id, "session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return msgs


@api.get("/tutor/sessions")
async def tutor_sessions(payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$session_id", "last": {"$first": "$content"}, "updated": {"$first": "$created_at"}}},
        {"$project": {"_id": 0, "session_id": "$_id", "preview": "$last", "updated_at": "$updated"}},
        {"$sort": {"updated_at": -1}},
        {"$limit": 30},
    ]
    sessions = await db.tutor_messages.aggregate(pipeline).to_list(50)
    return sessions


# ---------------------------------------------------------------------------
# Pricing / Subscriptions (mock checkout)
# ---------------------------------------------------------------------------
@api.get("/plans")
async def list_plans():
    docs = await db.plans.find({}, {"_id": 0}).to_list(20)
    return docs


@api.post("/billing/checkout")
async def mock_checkout(body: CheckoutRequest, payload=Depends(get_current_user_payload)):
    """MOCK checkout: marks the user as subscribed without real payment."""
    user_id = payload["sub"]
    plan = await db.plans.find_one({"id": body.plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    expires = None
    if body.plan_id == "pro_monthly":
        expires = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    elif body.plan_id == "pro_yearly":
        expires = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()

    await db.users.update_one(
        {"id": user_id},
        {"$set": {"subscription": {"plan_id": body.plan_id, "active": True, "expires_at": expires, "is_mock": True}}},
    )
    await db.transactions.insert_one({
        "id": gen_id("txn_"),
        "user_id": user_id,
        "plan_id": body.plan_id,
        "amount": plan.get("price_monthly", 0) or plan.get("price_yearly", 0) or plan.get("price_lifetime", 0),
        "status": "mock_completed",
        "created_at": now_iso(),
    })
    user = await get_user(user_id)
    return {"success": True, "user": user, "is_mock": True}


# ---------------------------------------------------------------------------
# Referral
# ---------------------------------------------------------------------------
@api.get("/referral/me")
async def my_referral(payload=Depends(get_current_user_payload)):
    user_id = payload["sub"]
    user = await get_user(user_id)
    invited = await db.users.count_documents({"referred_by": user_id})
    return {
        "referral_code": user.get("referral_code"),
        "invited_count": invited,
        "xp_earned_from_referrals": invited * 50,
        "share_message": f"Iscriviti a CodeMaster Academy con il mio codice {user.get('referral_code')} e iniziamo insieme!",
    }


# ---------------------------------------------------------------------------
# Certificates
# ---------------------------------------------------------------------------
@api.get("/certificates/me-legacy")
async def my_certificates_legacy(payload=Depends(get_current_user_payload)):
    """DEPRECATED — use /api/certificates/me from certificates_pdf module."""
    user_id = payload["sub"]
    courses = await db.courses.find({}, {"_id": 0}).to_list(200)
    certificates = []
    user = await get_user(user_id)
    for c in courses:
        total = len(c.get("lesson_ids", []))
        if total == 0:
            continue
        done = await db.progress.count_documents({"user_id": user_id, "course_id": c["id"], "type": "lesson", "completed": True})
        if done >= total:
            lang = await db.languages.find_one({"id": c["language_id"]}, {"_id": 0})
            certificates.append({
                "id": f"cert_{c['id']}_{user_id}",
                "course_id": c["id"],
                "course_title": c["title"],
                "language_name": lang["name"] if lang else c["language_id"],
                "level": c["level"],
                "issued_to": user["name"],
                "issued_at": now_iso(),
                "pdf_url": f"/api/certificates/pdf/{c['id']}",  # placeholder, mocked
            })
    return certificates


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(payload=Depends(get_current_admin_payload)):
    users = await db.users.count_documents({})
    pro_users = await db.users.count_documents({"subscription.plan_id": {"$in": ["pro_monthly", "pro_yearly", "lifetime"]}, "subscription.active": True})
    languages = await db.languages.count_documents({})
    lessons = await db.lessons.count_documents({})
    quizzes = await db.quizzes.count_documents({})
    completions = await db.progress.count_documents({"type": "lesson", "completed": True})
    transactions = await db.transactions.count_documents({})

    # Top languages by completions
    pipeline = [
        {"$match": {"type": "lesson", "completed": True}},
        {"$group": {"_id": "$language_id", "completions": {"$sum": 1}}},
        {"$sort": {"completions": -1}},
        {"$limit": 5},
    ]
    top_langs = await db.progress.aggregate(pipeline).to_list(10)

    return {
        "users": users,
        "pro_users": pro_users,
        "conversion_rate": round((pro_users / users) * 100, 2) if users else 0,
        "languages": languages,
        "lessons": lessons,
        "quizzes": quizzes,
        "lesson_completions": completions,
        "transactions": transactions,
        "top_languages": top_langs,
    }


@api.get("/admin/users")
async def admin_users(payload=Depends(get_current_admin_payload)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users


@api.post("/admin/languages")
async def admin_create_language(body: AdminLanguageCreate, payload=Depends(get_current_admin_payload)):
    existing = await db.languages.find_one({"id": body.id})
    if existing:
        raise HTTPException(status_code=400, detail="Language id already exists")
    doc = body.model_dump()
    await db.languages.insert_one(doc)
    # Create empty courses for each level
    for level in LEVELS:
        course_id = f"course_{body.id}_{level}"
        await db.courses.insert_one({
            "id": course_id,
            "language_id": body.id,
            "level": level,
            "title": LEVEL_TITLES[level],
            "lesson_ids": [],
            "quiz_ids": [],
            "exercise_ids": [],
            "is_premium": level in ("advanced", "pro"),
            "created_at": now_iso(),
        })
    return {"success": True, "language_id": body.id}


@api.post("/admin/lessons")
async def admin_create_lesson(body: AdminLessonCreate, payload=Depends(get_current_admin_payload)):
    course_id = f"course_{body.language_id}_{body.level}"
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course (language+level) not found")
    lesson_id = gen_id("lesson_")
    await db.lessons.insert_one({
        "id": lesson_id,
        "course_id": course_id,
        "language_id": body.language_id,
        "level": body.level,
        "order": body.order,
        "title": body.title,
        "content": body.content,
        "code": body.code,
        "code_explanation": body.code_explanation,
        "is_premium": body.level in ("advanced", "pro"),
        "created_at": now_iso(),
    })
    await db.courses.update_one({"id": course_id}, {"$push": {"lesson_ids": lesson_id}})
    return {"success": True, "lesson_id": lesson_id}


# ---------------------------------------------------------------------------
# Stripe webhook (mounted at /api/webhook/stripe)
# ---------------------------------------------------------------------------
@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    return await handle_stripe_webhook_request(request)


# ---------------------------------------------------------------------------
# Mount router & CORS
# ---------------------------------------------------------------------------
app.include_router(api)
app.include_router(billing_router)
app.include_router(certificates_router)
app.include_router(gamification_router)
app.include_router(admin_advanced_router)
app.include_router(legal_router)
app.include_router(email_router)
app.include_router(push_router)
app.include_router(affiliate_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
