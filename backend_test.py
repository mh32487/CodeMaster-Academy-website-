"""Backend tests for CodeMaster Academy — Security/Auth hardening module.

Tests all /api/auth/* endpoints under security.py plus regression on existing endpoints.
"""
import os
import sys
import time
import json
import asyncio
from pathlib import Path

import requests
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / "backend" / ".env")

BASE = os.environ.get("TEST_BASE_URL", "http://localhost:8001")
API = f"{BASE}/api"

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

results = {"passed": [], "failed": []}


def log_pass(name, detail=""):
    msg = f"{GREEN}[PASS]{RESET} {name}"
    if detail:
        msg += f" — {detail}"
    print(msg)
    results["passed"].append(name)


def log_fail(name, detail=""):
    msg = f"{RED}[FAIL]{RESET} {name}"
    if detail:
        msg += f" — {detail}"
    print(msg)
    results["failed"].append((name, detail))


def section(title):
    print(f"\n{YELLOW}{'=' * 75}{RESET}")
    print(f"{YELLOW}  {title}{RESET}")
    print(f"{YELLOW}{'=' * 75}{RESET}")


async def mongo():
    return AsyncIOMotorClient(MONGO_URL)[DB_NAME]


def post(path, json_data=None, headers=None):
    return requests.post(f"{API}{path}", json=json_data, headers=headers or {}, timeout=30)


def get(path, headers=None):
    return requests.get(f"{API}{path}", headers=headers or {}, timeout=30)


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


# 1. STRONG PASSWORD VALIDATION
def test_password_validation():
    section("1. Strong password validation on /auth/register")
    ts = int(time.time())

    email = f"test_w_{ts}@x.com"
    r = post("/auth/register", {"email": email, "name": "T", "password": "weak", "language": "it"})
    if r.status_code == 400 and ("8 caratteri" in r.text or "almeno 8" in r.text):
        log_pass("register 'weak' (<8) -> 400 IT message")
    else:
        log_fail("register weak", f"status={r.status_code} body={r.text[:200]}")

    # no-upper: use 8-char lowercase "weakpwdx"
    email = f"test_wp2_{ts}@x.com"
    r = post("/auth/register", {"email": email, "name": "T", "password": "weakpwdx", "language": "it"})
    if r.status_code == 400 and "maiuscola" in r.text.lower():
        log_pass("register no-upper -> 400 mentioning maiuscola")
    else:
        log_fail("register no-upper", f"status={r.status_code} body={r.text[:200]}")

    # no-digit
    email = f"test_wd_{ts}@x.com"
    r = post("/auth/register", {"email": email, "name": "T", "password": "WeakPwdA", "language": "it"})
    if r.status_code == 400 and "numero" in r.text.lower():
        log_pass("register no-digit -> 400 mentioning numero")
    else:
        log_fail("register no-digit", f"status={r.status_code} body={r.text[:200]}")

    # no-symbol
    email = f"test_ws_{ts}@x.com"
    r = post("/auth/register", {"email": email, "name": "T", "password": "WeakPwd1", "language": "it"})
    if r.status_code == 400 and "simbolo" in r.text.lower():
        log_pass("register no-symbol -> 400 mentioning simbolo")
    else:
        log_fail("register no-symbol", f"status={r.status_code} body={r.text[:200]}")

    # Strong
    email = f"test_ok_{ts}@x.com"
    r = post("/auth/register", {"email": email, "name": "T", "password": "Strong123!", "language": "it"})
    if r.status_code == 200:
        body = r.json()
        user = body.get("user") or {}
        email_verified = user.get("email_verified", False)
        if body.get("token") and email_verified is False:
            log_pass("register Strong123! -> 200 token, email_verified=false")
        else:
            log_fail("register Strong123! shape", f"token={bool(body.get('token'))} ev={email_verified}")
    else:
        log_fail("register Strong123!", f"status={r.status_code} body={r.text[:200]}")


# 2. FORGOT / RESET
async def test_forgot_reset_password():
    section("2. Forgot/Reset password")
    db = await mongo()
    ts = int(time.time())

    pr_before = await db.password_resets.count_documents({})
    outbox_before = await db.email_outbox.count_documents({"template_id": "password_reset"})

    r = post("/auth/forgot-password", {"email": "demo@codemaster.app", "lang": "it"})
    if r.status_code == 200 and r.json().get("success") is True:
        log_pass("forgot-password demo -> 200")
    else:
        log_fail("forgot-password demo", f"status={r.status_code} body={r.text[:200]}")

    r = post("/auth/forgot-password", {"email": f"unknown_{ts}@x.com", "lang": "it"})
    if r.status_code == 200 and r.json().get("success") is True:
        log_pass("forgot-password unknown -> 200 (anti-enumeration)")
    else:
        log_fail("forgot-password unknown", f"status={r.status_code} body={r.text[:200]}")

    await asyncio.sleep(0.3)

    pr_after = await db.password_resets.count_documents({})
    outbox_after = await db.email_outbox.count_documents({"template_id": "password_reset"})
    if pr_after > pr_before:
        log_pass(f"db.password_resets +{pr_after - pr_before}")
    else:
        log_fail("db.password_resets", f"before={pr_before} after={pr_after}")

    if outbox_after > outbox_before:
        log_pass(f"db.email_outbox password_reset +{outbox_after - outbox_before}")
    else:
        log_fail("db.email_outbox password_reset", f"before={outbox_before} after={outbox_after}")

    r = post("/auth/reset-password", {"token": "bogus", "new_password": "NewStrong1!", "lang": "it"})
    if r.status_code == 400:
        log_pass("reset-password bogus+strong -> 400")
    else:
        log_fail("reset-password bogus+strong", f"status={r.status_code} body={r.text[:200]}")

    r = post("/auth/reset-password", {"token": "bogus", "new_password": "weak", "lang": "it"})
    if r.status_code in (400, 422):
        log_pass("reset-password bogus+weak -> 400/422")
    else:
        log_fail("reset-password bogus+weak", f"status={r.status_code} body={r.text[:200]}")


# 3. EMAIL VERIFICATION
async def test_email_verification():
    section("3. Email verification side-effect")
    db = await mongo()
    ts = int(time.time())
    email = f"emailver_{ts}@x.com"

    ev_before = await db.email_verifications.count_documents({})
    outbox_before = await db.email_outbox.count_documents({"template_id": "email_verification"})

    r = post("/auth/register", {"email": email, "name": "EV User", "password": "Strong123!", "language": "it"})
    if r.status_code != 200:
        log_fail("register for email verification", f"status={r.status_code}")
        return

    await asyncio.sleep(0.4)
    ev_after = await db.email_verifications.count_documents({})
    outbox_after = await db.email_outbox.count_documents({"template_id": "email_verification"})

    if ev_after > ev_before:
        log_pass(f"db.email_verifications +{ev_after - ev_before}")
    else:
        log_fail("db.email_verifications", f"before={ev_before} after={ev_after}")

    if outbox_after > outbox_before:
        log_pass(f"db.email_outbox email_verification +{outbox_after - outbox_before}")
    else:
        log_fail("db.email_outbox email_verification", f"before={outbox_before} after={outbox_after}")

    r = post("/auth/verify-email", {"token": "bogus"})
    if r.status_code == 400:
        log_pass("verify-email bogus -> 400")
    else:
        log_fail("verify-email bogus", f"status={r.status_code} body={r.text[:200]}")


# 4. 2FA OTP
async def test_2fa_otp():
    section("4. 2FA OTP for new device")
    db = await mongo()
    ts = int(time.time())
    email = f"otp_{ts}@x.com"
    pwd = "Strong123!"

    r = requests.post(f"{API}/auth/register",
                      json={"email": email, "name": "OTP User", "password": pwd, "language": "it"},
                      headers={"User-Agent": "Test/1.0"}, timeout=30)
    if r.status_code != 200:
        log_fail("otp: register", f"status={r.status_code} body={r.text[:200]}")
        return
    log_pass("otp: registered user with UA Test/1.0")

    otps_before = await db.auth_otps.count_documents({})

    r = requests.post(f"{API}/auth/login",
                      json={"email": email, "password": pwd},
                      headers={"User-Agent": "TestBot/2.0"}, timeout=30)
    if r.status_code != 200:
        log_fail("otp: login new-device", f"status={r.status_code} body={r.text[:200]}")
        return
    body = r.json()
    if body.get("requires_otp") is True and body.get("challenge_id") and body.get("email_hint") and body.get("message"):
        log_pass(f"otp: new-device login -> requires_otp=true (hint={body['email_hint']})")
        challenge_id = body["challenge_id"]
    else:
        log_fail("otp: new-device shape", f"body={json.dumps(body)[:300]}")
        return

    await asyncio.sleep(0.3)
    rec = await db.auth_otps.find_one({"challenge_id": challenge_id})
    if rec:
        log_pass("otp: db.auth_otps has entry for challenge_id")
    else:
        otps_after = await db.auth_otps.count_documents({})
        log_fail("otp: db.auth_otps missing record", f"before={otps_before} after={otps_after}")

    r = post("/auth/verify-otp", {"challenge_id": challenge_id, "code": "000000"})
    if r.status_code == 400:
        log_pass("otp: verify-otp 000000 -> 400")
    else:
        log_fail("otp: verify-otp 000000", f"status={r.status_code} body={r.text[:200]}")

    r = requests.post(f"{API}/auth/login",
                      json={"email": email, "password": pwd},
                      headers={"User-Agent": "Test/1.0"}, timeout=30)
    if r.status_code == 200:
        body = r.json()
        if not body.get("requires_otp") and body.get("token"):
            log_pass("otp: login with original UA -> token directly (no OTP)")
        else:
            log_fail("otp: original UA should not require OTP", f"body={json.dumps(body)[:200]}")
    else:
        log_fail("otp: login original UA", f"status={r.status_code} body={r.text[:200]}")


# 5. SESSIONS
async def test_sessions_management():
    section("5. Sessions management")

    r = requests.post(f"{API}/auth/login",
                      json={"email": "demo@codemaster.app", "password": "Demo123!"},
                      headers={"User-Agent": "SessTest1/1.0"}, timeout=30)
    if r.status_code != 200 or r.json().get("requires_otp"):
        log_fail("sessions: demo 1st login", f"status={r.status_code} body={r.text[:200]}")
        return
    token1 = r.json()["token"]
    log_pass("sessions: demo 1st login -> token")

    r = get("/auth/sessions", bearer(token1))
    if r.status_code == 200 and isinstance(r.json(), list):
        sess_list = r.json()
        current = [s for s in sess_list if s.get("is_current")]
        if current and current[0].get("ip") and current[0].get("device_label"):
            log_pass(f"sessions: GET list shows current w/ ip+device_label (n={len(sess_list)})")
        else:
            log_fail("sessions: current session incomplete", f"current={current}")
    else:
        log_fail("sessions: GET /auth/sessions", f"status={r.status_code} body={r.text[:200]}")

    r = post("/auth/sessions/nonexistent/revoke", headers=bearer(token1))
    if r.status_code == 404:
        log_pass("sessions: revoke nonexistent -> 404")
    else:
        log_fail("sessions: revoke nonexistent", f"status={r.status_code} body={r.text[:200]}")

    # 2nd login, then revoke-all-others from token1
    r2 = requests.post(f"{API}/auth/login",
                       json={"email": "demo@codemaster.app", "password": "Demo123!"},
                       headers={"User-Agent": "SessTest2/2.0"}, timeout=30)
    if r2.status_code != 200 or r2.json().get("requires_otp"):
        log_fail("sessions: 2nd login", f"status={r2.status_code}")
        return
    token2 = r2.json()["token"]

    r = post("/auth/sessions/revoke-all-others", headers=bearer(token1))
    if r.status_code == 200 and r.json().get("success") is True and "revoked_count" in r.json():
        log_pass(f"sessions: revoke-all-others -> success (n={r.json()['revoked_count']})")
    else:
        log_fail("sessions: revoke-all-others", f"status={r.status_code} body={r.text[:200]}")

    r = get("/auth/me", bearer(token2))
    if r.status_code == 401 and "session revoked" in r.text.lower():
        log_pass("sessions: revoked token2 /auth/me -> 401 Session revoked")
    else:
        log_fail("sessions: token2 /auth/me post-revoke", f"status={r.status_code} body={r.text[:200]}")

    # 3rd login to test specific session revoke
    r3 = requests.post(f"{API}/auth/login",
                       json={"email": "demo@codemaster.app", "password": "Demo123!"},
                       headers={"User-Agent": "SessTest3/3.0"}, timeout=30)
    if r3.status_code != 200 or r3.json().get("requires_otp"):
        log_fail("sessions: 3rd login", f"status={r3.status_code}")
        return
    token3 = r3.json()["token"]

    r = get("/auth/sessions", bearer(token1))
    second_sid = None
    if r.status_code == 200:
        for s in r.json():
            if not s.get("is_current"):
                second_sid = s["id"]
                break

    if not second_sid:
        log_fail("sessions: cannot find non-current session")
    else:
        r = post(f"/auth/sessions/{second_sid}/revoke", headers=bearer(token1))
        if r.status_code == 200 and r.json().get("success") is True:
            log_pass(f"sessions: revoke specific {second_sid[:20]}... -> 200")
        else:
            log_fail("sessions: revoke specific", f"status={r.status_code} body={r.text[:200]}")

        r = get("/auth/me", bearer(token3))
        if r.status_code == 401 and "session revoked" in r.text.lower():
            log_pass("sessions: revoked token3 /auth/me -> 401 Session revoked")
        else:
            log_fail("sessions: token3 /auth/me post-revoke", f"status={r.status_code} body={r.text[:200]}")


# 6. LOGIN HISTORY
def test_login_history():
    section("6. Login history")

    r = requests.post(f"{API}/auth/login",
                      json={"email": "demo@codemaster.app", "password": "Demo123!"},
                      headers={"User-Agent": "LoginHist/1.0"}, timeout=30)
    if r.status_code != 200 or r.json().get("requires_otp"):
        log_fail("login-history: demo login prereq", f"status={r.status_code}")
        return
    token = r.json()["token"]

    r = get("/auth/login-history", bearer(token))
    if r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) > 0:
        entry = r.json()[0]
        required = ["device_label", "ip", "success", "reason", "created_at"]
        missing = [k for k in required if k not in entry]
        if not missing:
            log_pass(f"login-history: {len(r.json())} entries with required keys")
        else:
            log_fail("login-history: missing keys", f"missing={missing}")
    else:
        log_fail("login-history: GET", f"status={r.status_code} body={r.text[:200]}")


# 7. RATE LIMIT
def test_rate_limit():
    section("7. Rate limit login (per ip+email)")
    ts = int(time.time())
    email = f"ratelimit_{ts}@x.com"

    statuses = []
    got_429 = False
    for i in range(8):
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": "WrongPass123!"},
                          headers={"User-Agent": "RateLimitTest/1.0"}, timeout=30)
        statuses.append(r.status_code)
        if r.status_code == 429 and "troppi tentativi" in r.text.lower():
            got_429 = True
            log_pass(f"rate-limit: attempt #{i+1} -> 429 'Troppi tentativi' (statuses={statuses})")
            break

    if not got_429:
        log_fail("rate-limit: no 429 within 8 attempts", f"statuses={statuses}")


# 8. CHANGE PASSWORD
def test_change_password():
    section("8. Change password")

    r = requests.post(f"{API}/auth/login",
                      json={"email": "demo@codemaster.app", "password": "Demo123!"},
                      headers={"User-Agent": "ChangePwd/1.0"}, timeout=30)
    if r.status_code != 200 or r.json().get("requires_otp"):
        log_fail("change-password: prereq login", f"status={r.status_code}")
        return
    token = r.json()["token"]

    r = post("/auth/change-password",
             {"current_password": "WRONG", "new_password": "NewStrong1!", "lang": "it"},
             headers=bearer(token))
    if r.status_code == 400:
        log_pass("change-password: wrong current -> 400")
    else:
        log_fail("change-password: wrong current", f"status={r.status_code} body={r.text[:200]}")

    r = post("/auth/change-password",
             {"current_password": "Demo123!", "new_password": "weak", "lang": "it"},
             headers=bearer(token))
    if r.status_code in (400, 422):
        log_pass("change-password: weak new -> 400/422")
    else:
        log_fail("change-password: weak new", f"status={r.status_code} body={r.text[:200]}")


# 9. REGRESSION — existing users login
def test_regression_existing_users():
    section("9. Regression — existing users login (no OTP)")

    for email, pwd in [("demo@codemaster.app", "Demo123!"), ("admin@codemaster.app", "Admin123!")]:
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": pwd},
                          headers={"User-Agent": "Regression/1.0"}, timeout=30)
        if r.status_code != 200:
            log_fail(f"regression: {email} login", f"status={r.status_code} body={r.text[:200]}")
            continue
        body = r.json()
        if body.get("requires_otp"):
            log_fail(f"regression: {email} requires OTP", "demo/admin should NOT require OTP")
            continue
        token = body.get("token")
        if not token:
            log_fail(f"regression: {email} no token")
            continue
        log_pass(f"regression: {email} login -> token directly")

        r = get("/auth/me", bearer(token))
        if r.status_code == 200 and r.json().get("email") == email:
            log_pass(f"regression: {email} /auth/me -> 200")
        else:
            log_fail(f"regression: {email} /auth/me", f"status={r.status_code}")


# 10. REGRESSION — other endpoints
def test_regression_other_endpoints():
    section("10. Regression — existing endpoints")

    r = requests.post(f"{API}/auth/login",
                      json={"email": "demo@codemaster.app", "password": "Demo123!"},
                      headers={"User-Agent": "OtherReg/1.0"}, timeout=30)
    if r.status_code != 200 or r.json().get("requires_otp"):
        log_fail("regression: demo login prereq", f"status={r.status_code}")
        return
    token = r.json()["token"]

    r = get("/languages")
    if r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) > 0:
        log_pass(f"regression: GET /languages -> {len(r.json())} langs")
    else:
        log_fail("regression: GET /languages", f"status={r.status_code}")

    r = get("/missions/today", bearer(token))
    if r.status_code == 200:
        log_pass("regression: GET /missions/today -> 200")
    else:
        log_fail("regression: GET /missions/today", f"status={r.status_code} body={r.text[:200]}")

    r = get("/affiliate/me/summary", bearer(token))
    if r.status_code == 200 and "referral_code" in r.json():
        log_pass("regression: GET /affiliate/me/summary -> 200")
    else:
        log_fail("regression: GET /affiliate/me/summary", f"status={r.status_code} body={r.text[:200]}")


async def run_all():
    print(f"\n{BLUE}Testing at: {API}{RESET}\n")
    try:
        r = get("/")
        if r.status_code != 200:
            print(f"{RED}Backend not reachable at {API}{RESET}")
            sys.exit(1)
    except Exception as e:
        print(f"{RED}Backend not reachable: {e}{RESET}")
        sys.exit(1)

    test_password_validation()
    await test_forgot_reset_password()
    await test_email_verification()
    await test_2fa_otp()
    await test_sessions_management()
    test_login_history()
    test_rate_limit()
    test_change_password()
    test_regression_existing_users()
    test_regression_other_endpoints()

    print(f"\n{YELLOW}{'=' * 75}{RESET}")
    print(f"{YELLOW}  SUMMARY{RESET}")
    print(f"{YELLOW}{'=' * 75}{RESET}")
    print(f"{GREEN}PASSED: {len(results['passed'])}{RESET}")
    print(f"{RED}FAILED: {len(results['failed'])}{RESET}")
    if results["failed"]:
        print(f"\n{RED}Failures:{RESET}")
        for name, detail in results["failed"]:
            print(f"  - {name}: {detail}")
    sys.exit(0 if not results["failed"] else 1)


if __name__ == "__main__":
    asyncio.run(run_all())
