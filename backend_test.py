"""
Stripe E2E backend tests for CodeMaster Academy (TEST MODE).
"""
import os
import sys
import uuid
import requests

BASE = os.environ.get("BASE_URL", "http://localhost:8001")
API = f"{BASE}/api"

DEMO_EMAIL = "demo@codemaster.app"
DEMO_PASSWORD = "Demo123!"
ADMIN_EMAIL = "admin@codemaster.app"
ADMIN_PASSWORD = "Admin123!"

results = []


def record(name, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name} :: {detail}")
    results.append({"name": name, "ok": ok, "detail": detail})


def login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    r.raise_for_status()
    data = r.json()
    return data["token"], data["user"]


def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def test_health():
    try:
        r = requests.get(f"{API}/", timeout=10)
        record("API health", r.status_code == 200, f"status={r.status_code} body={r.text[:80]}")
    except Exception as e:
        record("API health", False, str(e))


def test_coupon_check():
    try:
        r = requests.get(f"{API}/billing/coupons/check", params={"code": "WELCOME20"}, timeout=15)
        ok = r.status_code == 200 and r.json().get("discount_percent") == 20 and r.json().get("valid") is True
        record("Coupon WELCOME20 -> 200 (20%)", ok, f"status={r.status_code} body={r.text[:120]}")
    except Exception as e:
        record("Coupon WELCOME20", False, str(e))

    try:
        r = requests.get(f"{API}/billing/coupons/check", params={"code": "STUDENT50"}, timeout=15)
        ok = r.status_code == 200 and r.json().get("discount_percent") == 50
        record("Coupon STUDENT50 -> 200 (50%)", ok, f"status={r.status_code} body={r.text[:120]}")
    except Exception as e:
        record("Coupon STUDENT50", False, str(e))

    try:
        r = requests.get(f"{API}/billing/coupons/check", params={"code": "INVALID"}, timeout=15)
        ok = r.status_code == 404
        record("Coupon INVALID -> 404", ok, f"status={r.status_code} body={r.text[:120]}")
    except Exception as e:
        record("Coupon INVALID", False, str(e))


def test_checkout(demo_token):
    sessions = {}

    try:
        r = requests.post(
            f"{API}/billing/stripe/checkout",
            json={"plan_id": "pro_monthly", "origin_url": "http://localhost:3000"},
            headers=headers(demo_token), timeout=60,
        )
        body = r.json() if r.status_code == 200 else {}
        ok = (
            r.status_code == 200
            and body.get("amount") == 9.99
            and body.get("discount") == 0
            and body.get("session_id", "").startswith("cs_")
            and "url" in body
        )
        sessions["pro_monthly"] = body.get("session_id")
        record("Checkout pro_monthly (€9.99, no coupon)", ok, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        record("Checkout pro_monthly", False, str(e))

    try:
        r = requests.post(
            f"{API}/billing/stripe/checkout",
            json={"plan_id": "pro_yearly", "origin_url": "http://localhost:3000", "coupon_code": "WELCOME20"},
            headers=headers(demo_token), timeout=60,
        )
        body = r.json() if r.status_code == 200 else {}
        ok = (
            r.status_code == 200
            and abs(body.get("amount", 0) - 63.99) < 0.01
            and body.get("discount") == 20
        )
        sessions["pro_yearly"] = body.get("session_id")
        record("Checkout pro_yearly + WELCOME20 -> €63.99", ok, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        record("Checkout pro_yearly", False, str(e))

    try:
        r = requests.post(
            f"{API}/billing/stripe/checkout",
            json={"plan_id": "lifetime", "origin_url": "http://localhost:3000", "coupon_code": "STUDENT50"},
            headers=headers(demo_token), timeout=60,
        )
        body = r.json() if r.status_code == 200 else {}
        ok = (
            r.status_code == 200
            and abs(body.get("amount", 0) - 99.50) < 0.01
            and body.get("discount") == 50
        )
        sessions["lifetime"] = body.get("session_id")
        record("Checkout lifetime + STUDENT50 -> €99.50", ok, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        record("Checkout lifetime", False, str(e))

    try:
        r = requests.post(
            f"{API}/billing/stripe/checkout",
            json={"plan_id": "bogus_plan", "origin_url": "http://localhost:3000"},
            headers=headers(demo_token), timeout=30,
        )
        record("Checkout invalid plan -> 400", r.status_code == 400, f"status={r.status_code} body={r.text[:120]}")
    except Exception as e:
        record("Checkout invalid plan", False, str(e))

    return sessions


def test_payment_transactions_in_db(admin_token, sessions):
    try:
        r = requests.get(f"{API}/admin/transactions", headers=headers(admin_token), timeout=30)
        if r.status_code != 200 or not isinstance(r.json(), list):
            record("payment_transactions list", False, f"status={r.status_code}")
            return
        txns = r.json()
        session_ids_in_db = {t.get("session_id") for t in txns}
        target_sessions = [v for v in sessions.values() if v]
        missing = [v for v in target_sessions if v not in session_ids_in_db]
        pending_for_test = [t for t in txns if t.get("session_id") in target_sessions and t.get("payment_status") == "pending"]
        ok = len(missing) == 0 and len(pending_for_test) == len(target_sessions)
        record(
            "payment_transactions records (3 sessions, payment_status=pending)",
            ok,
            f"missing={missing} pending_count={len(pending_for_test)}/{len(target_sessions)} total_txns={len(txns)}",
        )
    except Exception as e:
        record("payment_transactions list", False, str(e))


def test_status_polling(demo_token, sessions):
    sid = sessions.get("pro_monthly")
    if not sid:
        record("Status polling valid session", False, "no session_id from checkout step")
    else:
        try:
            r = requests.get(f"{API}/billing/stripe/status/{sid}", headers=headers(demo_token), timeout=60)
            body = r.json() if r.status_code == 200 else {}
            payment_status = body.get("payment_status")
            ok = r.status_code == 200 and payment_status in ("unpaid", "pending", "no_payment_required", None)
            record(
                "Status polling valid session -> 200 unpaid/pending",
                ok,
                f"status={r.status_code} payment_status={payment_status} body={r.text[:200]}",
            )
        except Exception as e:
            record("Status polling valid session", False, str(e))

    try:
        r = requests.get(f"{API}/billing/stripe/status/cs_test_unknown_zzzzz", headers=headers(demo_token), timeout=30)
        record("Status polling unknown session -> 404", r.status_code == 404, f"status={r.status_code} body={r.text[:120]}")
    except Exception as e:
        record("Status polling unknown session", False, str(e))

    try:
        new_email = f"qa.foreigner.{uuid.uuid4().hex[:8]}@codemaster-test.app"
        rreg = requests.post(
            f"{API}/auth/register",
            json={"email": new_email, "password": "Qa12345!", "name": "QA Foreigner", "language": "it"},
            timeout=30,
        )
        if rreg.status_code != 200:
            record("Status polling other user -> 403", False, f"register failed status={rreg.status_code}")
        else:
            other_token = rreg.json()["token"]
            sid2 = sessions.get("pro_monthly") or sessions.get("pro_yearly")
            r = requests.get(f"{API}/billing/stripe/status/{sid2}", headers=headers(other_token), timeout=30)
            record("Status polling other user -> 403", r.status_code == 403, f"status={r.status_code} body={r.text[:120]}")
    except Exception as e:
        record("Status polling other user", False, str(e))


def test_webhook_bad_sig():
    try:
        r = requests.post(
            f"{API}/webhook/stripe",
            data=b'{"bogus":"payload"}',
            headers={"Stripe-Signature": "t=1,v1=invalidhash", "Content-Type": "application/json"},
            timeout=30,
        )
        record("Webhook bogus body -> 400", r.status_code == 400, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        record("Webhook bogus body", False, str(e))


def test_admin_analytics(admin_token):
    try:
        r = requests.get(f"{API}/admin/analytics/retention", headers=headers(admin_token), timeout=30)
        body = r.json() if r.status_code == 200 else {}
        required = ["total_revenue_eur", "paid_transactions", "arpu", "plan_distribution",
                    "retention_7d_percent", "retention_30d_percent", "active_24h",
                    "active_7d", "active_30d", "streak_buckets"]
        missing = [k for k in required if k not in body]
        record(
            "Admin /analytics/retention has all required keys",
            r.status_code == 200 and not missing,
            f"status={r.status_code} missing={missing}",
        )
    except Exception as e:
        record("Admin /analytics/retention", False, str(e))

    try:
        r = requests.get(f"{API}/admin/analytics/conversion-funnel", headers=headers(admin_token), timeout=30)
        body = r.json() if r.status_code == 200 else {}
        required = ["registered", "completed_first_lesson", "passed_first_quiz",
                    "subscribed_pro", "conversion_to_pro_percent"]
        missing = [k for k in required if k not in body]
        record(
            "Admin /analytics/conversion-funnel has all required keys",
            r.status_code == 200 and not missing,
            f"status={r.status_code} missing={missing} body={body}",
        )
    except Exception as e:
        record("Admin /analytics/conversion-funnel", False, str(e))

    try:
        r = requests.get(f"{API}/admin/transactions", headers=headers(admin_token), timeout=30)
        ok = r.status_code == 200 and isinstance(r.json(), list)
        record("Admin /transactions returns array", ok, f"status={r.status_code} count={len(r.json()) if ok else 'n/a'}")
    except Exception as e:
        record("Admin /transactions", False, str(e))

    try:
        coupon_code = f"TESTCPN{uuid.uuid4().hex[:4].upper()}"
        r = requests.post(
            f"{API}/admin/coupons",
            json={"code": coupon_code, "discount_percent": 10, "uses_left": 5},
            headers=headers(admin_token), timeout=30,
        )
        ok = r.status_code == 200 and r.json().get("success") is True
        record(f"Admin POST /coupons {coupon_code}", ok, f"status={r.status_code} body={r.text[:200]}")

        rg = requests.get(f"{API}/admin/coupons", headers=headers(admin_token), timeout=30)
        codes_in_list = [c.get("code") for c in (rg.json() if rg.status_code == 200 else [])]
        record(
            f"Admin GET /coupons includes {coupon_code}",
            coupon_code in codes_in_list,
            f"codes={codes_in_list[:10]}",
        )

        r2 = requests.post(
            f"{API}/admin/coupons",
            json={"code": "TESTCPN10", "discount_percent": 10, "uses_left": 5},
            headers=headers(admin_token), timeout=30,
        )
        ok2 = r2.status_code in (200, 400)
        record("Admin POST /coupons TESTCPN10 (created or already exists)", ok2, f"status={r2.status_code} body={r2.text[:120]}")
    except Exception as e:
        record("Admin POST/GET coupons", False, str(e))


def test_premium_flow(admin_token):
    try:
        email = f"qa.premium.{uuid.uuid4().hex[:8]}@codemaster-test.app"
        rreg = requests.post(
            f"{API}/auth/register",
            json={"email": email, "password": "Qa12345!", "name": "QA Premium", "language": "it"},
            timeout=30,
        )
        if rreg.status_code != 200:
            record("Premium flow: register new user", False, f"status={rreg.status_code}")
            return
        new_token = rreg.json()["token"]
        new_user_id = rreg.json()["user"]["id"]
        record("Premium flow: register new user", True, f"user_id={new_user_id}")

        r = requests.put(
            f"{API}/admin/users/{new_user_id}/subscription",
            json={"plan_id": "pro_monthly", "active": True, "expires_at": None},
            headers=headers(admin_token), timeout=30,
        )
        record(
            "Premium flow: admin PUT subscription -> 200",
            r.status_code == 200 and r.json().get("success") is True,
            f"status={r.status_code} body={r.text[:160]}",
        )

        rme = requests.get(f"{API}/auth/me", headers=headers(new_token), timeout=30)
        sub = rme.json().get("subscription", {}) if rme.status_code == 200 else {}
        ok = rme.status_code == 200 and sub.get("plan_id") == "pro_monthly" and sub.get("active") is True
        record(
            "Premium flow: GET /auth/me shows pro_monthly",
            ok,
            f"status={rme.status_code} subscription={sub}",
        )
    except Exception as e:
        record("Premium flow", False, str(e))


def test_referral(demo_user):
    try:
        ref_code = demo_user.get("referral_code")
        if not ref_code:
            record("Referral flow", False, "no referral_code on demo user")
            return

        email = f"qa.referred.{uuid.uuid4().hex[:8]}@codemaster-test.app"
        rreg = requests.post(
            f"{API}/auth/register",
            json={
                "email": email,
                "password": "Qa12345!",
                "name": "QA Referred",
                "language": "it",
                "referral_code": ref_code,
            },
            timeout=30,
        )
        if rreg.status_code != 200:
            record("Referral: register with referral_code", False, f"status={rreg.status_code} body={rreg.text[:120]}")
            return
        new_token = rreg.json()["token"]

        rme = requests.get(f"{API}/auth/me", headers=headers(new_token), timeout=30)
        body = rme.json() if rme.status_code == 200 else {}
        referred_by = body.get("referred_by")
        ok = rme.status_code == 200 and referred_by == demo_user["id"]
        record(
            f"Referral: new user.referred_by == demo.id ({demo_user['id']})",
            ok,
            f"referred_by={referred_by}",
        )
    except Exception as e:
        record("Referral flow", False, str(e))


def main():
    print(f"Base URL: {BASE}")
    print("=" * 70)
    test_health()

    try:
        demo_token, demo_user = login(DEMO_EMAIL, DEMO_PASSWORD)
        record("Login as demo", True, f"user_id={demo_user['id']} ref_code={demo_user.get('referral_code')}")
    except Exception as e:
        record("Login as demo", False, str(e))
        return

    try:
        admin_token, admin_user = login(ADMIN_EMAIL, ADMIN_PASSWORD)
        record("Login as admin", True, f"role={admin_user.get('role')}")
    except Exception as e:
        record("Login as admin", False, str(e))
        return

    test_coupon_check()
    sessions = test_checkout(demo_token)
    test_payment_transactions_in_db(admin_token, sessions)
    test_status_polling(demo_token, sessions)
    test_webhook_bad_sig()
    test_admin_analytics(admin_token)
    test_premium_flow(admin_token)
    test_referral(demo_user)

    print("=" * 70)
    passed = sum(1 for r in results if r["ok"])
    failed = sum(1 for r in results if not r["ok"])
    print(f"TOTAL: {passed} PASSED / {failed} FAILED out of {len(results)}")
    if failed:
        print("\nFAILED:")
        for r in results:
            if not r["ok"]:
                print(f"  - {r['name']}: {r['detail']}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
