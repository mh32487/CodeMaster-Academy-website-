"""End-to-end backend API tests for CodeMaster Academy."""
import os
import time
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://dev-learn-path-2.preview.emergentagent.com").rstrip("/")


# --- Health ---
class TestHealth:
    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"


# --- Auth ---
class TestAuth:
    def test_login_demo(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json={"email": "demo@codemaster.app", "password": "Demo123!"})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and "user" in data
        assert data["user"]["email"] == "demo@codemaster.app"
        assert data["user"]["role"] == "user"

    def test_login_admin(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@codemaster.app", "password": "Admin123!"})
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"

    def test_login_invalid(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json={"email": "demo@codemaster.app", "password": "wrong"})
        assert r.status_code == 401

    def test_me(self, api_client, demo_headers):
        r = api_client.get(f"{BASE_URL}/api/auth/me", headers=demo_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "demo@codemaster.app"

    def test_register_and_login(self, api_client):
        email = f"TEST_user_{int(time.time())}@codemaster.app"
        r = api_client.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Pass1234!", "name": "TEST User"})
        assert r.status_code == 200
        token = r.json()["token"]
        # login again
        r2 = api_client.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "Pass1234!"})
        assert r2.status_code == 200
        assert token  # not empty


# --- Languages ---
class TestLanguages:
    def test_list_languages(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/languages")
        assert r.status_code == 200
        langs = r.json()
        assert isinstance(langs, list)
        assert len(langs) == 17, f"Expected 17 languages, got {len(langs)}"
        ids = [l["id"] for l in langs]
        for must in ("python", "javascript"):
            assert must in ids
        # has_full_content for python/js/html-css
        full = [l for l in langs if l.get("has_full_content")]
        assert len(full) >= 3

    def test_get_python(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/languages/python")
        assert r.status_code == 200
        data = r.json()
        assert data["language"]["id"] == "python"
        assert len(data["courses"]) == 4
        levels = [c["level"] for c in data["courses"]]
        assert levels == ["base", "intermediate", "advanced", "pro"]


# --- Courses / Lessons / Quizzes / Exercises ---
class TestCourses:
    def test_get_python_base_course(self, api_client, demo_headers):
        r = api_client.get(f"{BASE_URL}/api/courses/course_python_base", headers=demo_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["course"]["id"] == "course_python_base"
        assert len(data["lessons"]) >= 1
        assert "completion_percent" in data

    def test_lesson_get_and_complete(self, api_client, demo_headers):
        # get course
        c = api_client.get(f"{BASE_URL}/api/courses/course_python_base", headers=demo_headers).json()
        lesson_id = c["lessons"][0]["id"]
        # get lesson
        r = api_client.get(f"{BASE_URL}/api/lessons/{lesson_id}", headers=demo_headers)
        assert r.status_code == 200
        # complete
        r2 = api_client.post(f"{BASE_URL}/api/lessons/complete", headers=demo_headers, json={"lesson_id": lesson_id})
        assert r2.status_code == 200
        body = r2.json()
        assert "xp_gained" in body and "already_completed" in body

    def test_quiz_submit(self, api_client, demo_headers):
        c = api_client.get(f"{BASE_URL}/api/courses/course_python_base", headers=demo_headers).json()
        if not c["quizzes"]:
            return
        quiz = c["quizzes"][0]
        # Submit all-zeros answers (count must match)
        answers = [0] * len(quiz["questions"])
        r = api_client.post(f"{BASE_URL}/api/quizzes/submit", headers=demo_headers, json={"quiz_id": quiz["id"], "answers": answers})
        assert r.status_code == 200
        body = r.json()
        assert "score" in body and "review" in body
        assert len(body["review"]) == len(quiz["questions"])

    def test_exercise_submit(self, api_client, demo_headers):
        c = api_client.get(f"{BASE_URL}/api/courses/course_python_base", headers=demo_headers).json()
        if not c["exercises"]:
            return
        ex = c["exercises"][0]
        # submit solution -> should be correct
        r = api_client.post(f"{BASE_URL}/api/exercises/submit", headers=demo_headers, json={"exercise_id": ex["id"], "code": ex["solution"] if "solution" not in ex else ""})
        # We don't know solution without GET endpoint; use GET
        ex_full = api_client.get(f"{BASE_URL}/api/exercises/{ex['id']}", headers=demo_headers).json()
        r2 = api_client.post(f"{BASE_URL}/api/exercises/submit", headers=demo_headers, json={"exercise_id": ex["id"], "code": ex_full["solution"]})
        assert r2.status_code == 200
        assert r2.json()["is_correct"] is True


# --- Paths / Projects ---
class TestPaths:
    def test_list_paths(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/paths")
        assert r.status_code == 200
        paths = r.json()
        assert len(paths) == 5

    def test_list_projects(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/projects")
        assert r.status_code == 200
        assert len(r.json()) == 6


# --- Progress / Profile / Leaderboard / Badges ---
class TestProgressAndProfile:
    def test_my_progress(self, api_client, demo_headers):
        r = api_client.get(f"{BASE_URL}/api/progress/me", headers=demo_headers)
        assert r.status_code == 200
        d = r.json()
        assert "user" in d and "lessons_completed" in d and "total_lessons" in d

    def test_leaderboard(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/leaderboard")
        assert r.status_code == 200
        lb = r.json()
        assert isinstance(lb, list) and len(lb) >= 3
        assert lb[0]["rank"] == 1

    def test_badges(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/badges")
        assert r.status_code == 200
        assert len(r.json()) > 0

    def test_referral(self, api_client, demo_headers):
        r = api_client.get(f"{BASE_URL}/api/referral/me", headers=demo_headers)
        assert r.status_code == 200
        assert "referral_code" in r.json()

    def test_certificates(self, api_client, demo_headers):
        r = api_client.get(f"{BASE_URL}/api/certificates/me", headers=demo_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# --- Tutor ---
class TestTutor:
    def test_tutor_chat(self, api_client, demo_headers):
        r = api_client.post(f"{BASE_URL}/api/tutor/chat", headers=demo_headers, json={"message": "Cosa è una variabile?", "language": "it"}, timeout=60)
        assert r.status_code == 200
        d = r.json()
        assert "reply" in d and "session_id" in d
        assert len(d["reply"]) > 0


# --- Plans / Billing ---
class TestBilling:
    def test_list_plans(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/plans")
        assert r.status_code == 200
        plans = r.json()
        assert len(plans) == 4

    def test_mock_checkout(self, api_client, demo_headers):
        r = api_client.post(f"{BASE_URL}/api/billing/checkout", headers=demo_headers, json={"plan_id": "pro_monthly"})
        assert r.status_code == 200
        assert r.json()["is_mock"] is True
        # revert to free
        api_client.post(f"{BASE_URL}/api/billing/checkout", headers=demo_headers, json={"plan_id": "free"})


# --- Admin ---
class TestAdmin:
    def test_admin_stats(self, api_client, admin_headers):
        r = api_client.get(f"{BASE_URL}/api/admin/stats", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        assert "users" in d and "languages" in d and d["languages"] == 17

    def test_admin_users(self, api_client, admin_headers):
        r = api_client.get(f"{BASE_URL}/api/admin/users", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_forbidden_for_user(self, api_client, demo_headers):
        r = api_client.get(f"{BASE_URL}/api/admin/stats", headers=demo_headers)
        assert r.status_code in (401, 403)
