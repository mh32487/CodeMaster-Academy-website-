"""Comprehensive backend tests for CodeMaster Academy.

Covers Phase 3 (push, email, affiliate) + regression on auth/lessons/quizzes/tutor/admin.
"""
import os
import sys
import time
import json
import uuid
import requests
from pathlib import Path

# Read backend URL
BACKEND_URL = None
env_path = Path("/app/frontend/.env")
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
            BACKEND_URL = line.split("=", 1)[1].strip().strip('"')
            break
if not BACKEND_URL:
    BACKEND_URL = "http://localhost:8001"

API = f"{BACKEND_URL}/api"
print(f"=== Testing against: {API} ===\n")

DEMO_EMAIL = "demo@codemaster.app"
DEMO_PASS = "Demo123!"
ADMIN_EMAIL = "admin@codemaster.app"
ADMIN_PASS = "Admin123!"

results = {"passed": [], "failed": []}


def log(name, ok, info=""):
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name} :: {info}")
    (results["passed"] if ok else results["failed"]).append((name, info))


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login {email} -> {r.status_code} {r.text[:200]}"
    return r.json()["token"], r.json()["user"]


def main():
    # ---- Login demo + admin
    try:
        demo_token, demo_user = login(DEMO_EMAIL, DEMO_PASS)
        log("auth.login(demo)", True, f"user_id={demo_user.get('id')}")
    except Exception as e:
        log("auth.login(demo)", False, str(e))
        return

    try:
        admin_token, admin_user = login(ADMIN_EMAIL, ADMIN_PASS)
        log("auth.login(admin)", True, f"role={admin_user.get('role')}")
    except Exception as e:
        log("auth.login(admin)", False, str(e))
        return

    H_DEMO = auth_headers(demo_token)
    H_ADMIN = auth_headers(admin_token)

    # =========================================================================
    # PRIORITY 1 — Phase 3 endpoints
    # =========================================================================

    # ---- Affiliate
    try:
        r = requests.get(f"{API}/affiliate/me/summary", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200
        if ok:
            j = r.json()
            required = ["referral_code", "invited_count", "pending_amount",
                        "paid_amount", "eligible_for_payout", "recent_commissions",
                        "payout_history"]
            missing = [k for k in required if k not in j]
            ok = len(missing) == 0
            log("affiliate.me.summary", ok,
                f"missing={missing}; referral_code={j.get('referral_code')}; pending={j.get('pending_amount')}; eligible={j.get('eligible_for_payout')}")
        else:
            log("affiliate.me.summary", False, f"{r.status_code} {r.text[:200]}")
    except Exception as e:
        log("affiliate.me.summary", False, str(e))

    try:
        r = requests.post(f"{API}/affiliate/me/payout",
                          json={"amount": 30, "payout_method": "paypal", "payout_details": "test@x.com"},
                          headers=H_DEMO, timeout=10)
        ok = r.status_code == 400
        log("affiliate.me.payout(min<50)", ok, f"got {r.status_code}: {r.text[:150]}")
    except Exception as e:
        log("affiliate.me.payout(min<50)", False, str(e))

    try:
        r = requests.get(f"{API}/affiliate/admin/all-summary", headers=H_ADMIN, timeout=10)
        ok = r.status_code == 200 and isinstance(r.json(), dict)
        log("affiliate.admin.all-summary", ok, f"{r.status_code}; keys={list(r.json().keys()) if ok else r.text[:120]}")
    except Exception as e:
        log("affiliate.admin.all-summary", False, str(e))

    # ---- Push
    try:
        body = {"expo_push_token": "ExponentPushToken[fake-test-token]", "platform": "ios"}
        r = requests.post(f"{API}/push/register", json=body, headers=H_DEMO, timeout=10)
        ok = r.status_code == 200 and r.json().get("success") is True
        log("push.register", ok, f"{r.status_code} {r.text[:120]}")
    except Exception as e:
        log("push.register", False, str(e))

    try:
        body = {"expo_push_token": "ExponentPushToken[fake-test-token]", "platform": "ios"}
        r = requests.post(f"{API}/push/unregister", json=body, headers=H_DEMO, timeout=10)
        ok = r.status_code == 200 and r.json().get("success") is True
        log("push.unregister", ok, f"{r.status_code} {r.text[:120]}")
    except Exception as e:
        log("push.unregister", False, str(e))

    try:
        r = requests.get(f"{API}/push/outbox", headers=H_ADMIN, timeout=10)
        ok = r.status_code == 200 and isinstance(r.json(), list)
        log("push.outbox(admin)", ok, f"{r.status_code}; count={len(r.json()) if ok else 'n/a'}")
    except Exception as e:
        log("push.outbox(admin)", False, str(e))

    try:
        r = requests.post(f"{API}/push/scheduler/run", headers=H_ADMIN, timeout=30)
        ok = r.status_code == 200 and "counters" in r.json()
        log("push.scheduler.run(admin)", ok, f"{r.status_code}; counters={r.json().get('counters') if ok else r.text[:200]}")
    except Exception as e:
        log("push.scheduler.run(admin)", False, str(e))

    # ---- Email
    try:
        r = requests.get(f"{API}/email/outbox", headers=H_ADMIN, timeout=10)
        ok = r.status_code == 200 and isinstance(r.json(), list)
        log("email.outbox(admin)", ok, f"{r.status_code}; count={len(r.json()) if ok else 'n/a'}")
    except Exception as e:
        log("email.outbox(admin)", False, str(e))

    try:
        body = {"to": "test@example.com", "template_id": "welcome", "lang": "it"}
        r = requests.post(f"{API}/email/test", json=body, headers=H_ADMIN, timeout=10)
        j = r.json() if r.status_code == 200 else {}
        ok = r.status_code == 200 and j.get("sent") is True and j.get("provider") == "mock"
        log("email.test(admin)", ok, f"{r.status_code} {j}")
    except Exception as e:
        log("email.test(admin)", False, str(e))

    # ---- Welcome email side-effect
    try:
        new_email = f"qa.user.{uuid.uuid4().hex[:8]}@codemaster-test.app"
        reg = requests.post(f"{API}/auth/register",
                            json={"email": new_email, "password": "TestPass123!", "name": "QA User", "language": "it"},
                            timeout=15)
        if reg.status_code != 200:
            log("auth.register(new)", False, f"{reg.status_code} {reg.text[:200]}")
        else:
            log("auth.register(new)", True, f"created {new_email}")
            # Wait briefly then check outbox
            time.sleep(0.5)
            r = requests.get(f"{API}/email/outbox", headers=H_ADMIN, timeout=10)
            outbox = r.json() if r.status_code == 200 else []
            found = any(e.get("to") == new_email and e.get("template_id") == "welcome" for e in outbox)
            log("email.welcome.side-effect", found, f"new_email={new_email}; outbox_size={len(outbox)}; found={found}")
    except Exception as e:
        log("email.welcome.side-effect", False, str(e))

    # =========================================================================
    # PRIORITY 2 — Regression
    # =========================================================================

    # auth/me
    try:
        r = requests.get(f"{API}/auth/me", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200 and r.json().get("email") == DEMO_EMAIL
        log("auth.me", ok, f"{r.status_code}")
    except Exception as e:
        log("auth.me", False, str(e))

    # auth/refresh
    try:
        r = requests.post(f"{API}/auth/refresh", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200 and "token" in r.json()
        log("auth.refresh", ok, f"{r.status_code}")
    except Exception as e:
        log("auth.refresh", False, str(e))

    # languages
    try:
        r = requests.get(f"{API}/languages", timeout=10)
        ok = r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) == 17
        log("languages.list (17)", ok, f"{r.status_code}; count={len(r.json()) if r.status_code==200 else 'n/a'}")
    except Exception as e:
        log("languages.list (17)", False, str(e))

    # languages/python
    try:
        r = requests.get(f"{API}/languages/python", timeout=10)
        ok = r.status_code == 200 and "language" in r.json() and "courses" in r.json()
        log("languages.python", ok, f"{r.status_code}; courses={len(r.json().get('courses', []))}")
    except Exception as e:
        log("languages.python", False, str(e))

    # courses/course_python_base
    try:
        r = requests.get(f"{API}/courses/course_python_base", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200 and "course" in r.json()
        log("courses.course_python_base", ok, f"{r.status_code}; lessons={len(r.json().get('lessons', []))}")
    except Exception as e:
        log("courses.course_python_base", False, str(e))

    # lessons/lesson_python_base_0
    try:
        r = requests.get(f"{API}/lessons/lesson_python_base_0", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200 and "lesson" in r.json()
        log("lessons.lesson_python_base_0", ok, f"{r.status_code}")
    except Exception as e:
        log("lessons.lesson_python_base_0", False, str(e))

    # POST lessons/complete
    try:
        r = requests.post(f"{API}/lessons/complete",
                          json={"lesson_id": "lesson_python_base_0"}, headers=H_DEMO, timeout=10)
        ok = r.status_code == 200
        log("lessons.complete", ok, f"{r.status_code} {r.text[:120]}")
    except Exception as e:
        log("lessons.complete", False, str(e))

    # quizzes/quiz_python_base
    quiz = None
    try:
        r = requests.get(f"{API}/quizzes/quiz_python_base", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200 and "questions" in r.json()
        if ok:
            quiz = r.json()
        log("quizzes.quiz_python_base", ok, f"{r.status_code}; q_count={len(quiz['questions']) if quiz else 0}")
    except Exception as e:
        log("quizzes.quiz_python_base", False, str(e))

    # POST quizzes/submit (correct answers)
    if quiz:
        try:
            answers = [q["correct_index"] for q in quiz["questions"]]
            r = requests.post(f"{API}/quizzes/submit",
                              json={"quiz_id": "quiz_python_base", "answers": answers},
                              headers=H_DEMO, timeout=10)
            ok = r.status_code == 200 and r.json().get("passed") is True
            log("quizzes.submit(correct)", ok, f"{r.status_code}; score={r.json().get('score') if r.status_code==200 else 'n/a'}")
        except Exception as e:
            log("quizzes.submit(correct)", False, str(e))

    # tutor/chat — accept any 200
    try:
        r = requests.post(f"{API}/tutor/chat",
                          json={"message": "Cos'è una variabile?", "language": "it"},
                          headers=H_DEMO, timeout=60)
        ok = r.status_code == 200 and "reply" in r.json()
        log("tutor.chat", ok, f"{r.status_code}; reply_len={len(r.json().get('reply','')) if r.status_code==200 else 'n/a'}")
    except Exception as e:
        log("tutor.chat", False, str(e))

    # missions/me
    try:
        r = requests.get(f"{API}/missions/me", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200
        log("missions.me", ok, f"{r.status_code}")
    except Exception as e:
        log("missions.me", False, str(e))

    # certificates/me
    try:
        r = requests.get(f"{API}/certificates/me", headers=H_DEMO, timeout=10)
        ok = r.status_code == 200
        log("certificates.me", ok, f"{r.status_code}")
    except Exception as e:
        log("certificates.me", False, str(e))

    # admin/stats
    try:
        r = requests.get(f"{API}/admin/stats", headers=H_ADMIN, timeout=10)
        ok = r.status_code == 200 and "users" in r.json()
        log("admin.stats", ok, f"{r.status_code}; users={r.json().get('users') if r.status_code==200 else 'n/a'}")
    except Exception as e:
        log("admin.stats", False, str(e))

    # admin/users
    try:
        r = requests.get(f"{API}/admin/users", headers=H_ADMIN, timeout=10)
        ok = r.status_code == 200 and isinstance(r.json(), list)
        log("admin.users", ok, f"{r.status_code}; count={len(r.json()) if r.status_code==200 else 'n/a'}")
    except Exception as e:
        log("admin.users", False, str(e))

    # ---- Summary
    print("\n" + "=" * 70)
    print(f"PASSED: {len(results['passed'])}")
    print(f"FAILED: {len(results['failed'])}")
    if results["failed"]:
        print("\n-- Failed cases --")
        for n, info in results["failed"]:
            print(f"  - {n} :: {info}")
    print("=" * 70)
    return 0 if not results["failed"] else 1


if __name__ == "__main__":
    sys.exit(main())
