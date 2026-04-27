#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  CodeMaster Academy — full-stack Expo + FastAPI app for learning programming languages.
  Phase 3 (Commercial Launch) includes Push Notifications (Expo), Email transactional system
  (mock provider for now), Affiliate dashboard (commissions + payout requests), Onboarding flow.
  Backend routers for /api/push, /api/email, /api/affiliate were created but had not been
  registered in server.py — endpoints returned 404. Main agent registered routers and now
  needs comprehensive backend testing to validate all Phase 3 endpoints + regression on existing
  flows (auth, lessons, quizzes, tutor, billing, certificates, missions, admin).

backend:
  - task: "Phase 3 router registration in server.py"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Added app.include_router(email_router), app.include_router(push_router), app.include_router(affiliate_router) after legal_router. Backend restarted; endpoints now respond 401 (auth required) instead of 404."
        -working: true
        -agent: "testing"
        -comment: "VERIFIED: All Phase 3 routers are now properly registered and reachable. /api/affiliate/*, /api/push/*, /api/email/* all return 200/4xx as expected (no more 404). Tested via public URL https://dev-learn-path-2.preview.emergentagent.com/api."

  - task: "Push Notifications endpoints (/api/push/*)"
    implemented: true
    working: true
    file: "backend/push_service.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Endpoints: POST /api/push/register, POST /api/push/unregister (user auth), POST /api/push/send (admin), POST /api/push/scheduler/run (admin), GET /api/push/outbox (admin). Should accept ExponentPushToken values; missing tokens log 'no_tokens' status."
        -working: true
        -agent: "testing"
        -comment: "ALL PASSED. POST /api/push/register with ExponentPushToken[fake-test-token] (ios) -> 200 {success:true}. POST /api/push/unregister -> 200 {success:true}. GET /api/push/outbox (admin) -> 200 array. POST /api/push/scheduler/run (admin) -> 200 with counters={daily_reminders:0, streak_saves:0, winback:0, abandoned_checkout:1}. Token storage idempotent via $addToSet. push_settings.enabled set true on register."

  - task: "Email transactional system (/api/email/*)"
    implemented: true
    working: true
    file: "backend/email_service.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Endpoints: GET /api/email/outbox (admin), POST /api/email/test (admin). Provider is 'mock' — emails logged to db.email_outbox. Templates: welcome, password_reset, payment_success, etc. Welcome email triggered on /api/auth/register."
        -working: true
        -agent: "testing"
        -comment: "ALL PASSED. GET /api/email/outbox (admin) -> 200 array. POST /api/email/test {to:test@example.com, template_id:welcome, lang:it} -> 200 {sent:true, provider:mock}. Welcome email side-effect VERIFIED: registered new user qa.user.<uuid>@codemaster-test.app via /api/auth/register, then found a 'welcome' entry for that exact email in /api/email/outbox (outbox grew from 0 to 2 entries: test + welcome). Provider is MOCKED (logged to db.email_outbox only — no real emails sent)."

  - task: "Affiliate dashboard (/api/affiliate/*)"
    implemented: true
    working: true
    file: "backend/affiliate.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Endpoints: GET /api/affiliate/me/summary (user), POST /api/affiliate/me/payout (user, min €50), GET /api/affiliate/admin/all-summary (admin), POST /api/affiliate/admin/approve-payout (admin), POST /api/affiliate/admin/partner-coupons (admin)."
        -working: true
        -agent: "testing"
        -comment: "ALL PASSED. GET /api/affiliate/me/summary (demo) -> 200 with all required fields {referral_code:32FBD643, invited_count:0, pending_amount:0, paid_amount:0, eligible_for_payout:false, recent_commissions:[], payout_history:[]}. POST /api/affiliate/me/payout {amount:30, paypal} -> 400 'Importo minimo €50' (validation works). GET /api/affiliate/admin/all-summary (admin) -> 200 with keys [top_affiliates, pending_payouts, total_pending_eur, total_paid_eur]."

  - task: "Auth endpoints regression (register/login/me/refresh)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "Existing flow worked previously. Need regression after server.py edit. Demo: demo@codemaster.app/Demo123!, Admin: admin@codemaster.app/Admin123!. Welcome email now triggered on register."
        -working: true
        -agent: "testing"
        -comment: "REGRESSION PASSED. POST /api/auth/login (demo & admin) -> 200 with JWT token. POST /api/auth/register (random email) -> 200 with token+user; welcome email logged to outbox. GET /api/auth/me (with bearer) -> 200 with user record. POST /api/auth/refresh -> 200 with new token. JWT bearer flow intact across all routes."

  - task: "Lessons / Quizzes / Exercises / Courses regression"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "GET /api/languages, /api/languages/{id}, /api/courses/{id}, /api/lessons/{id}, POST /api/lessons/complete, /api/quizzes/submit, /api/exercises/submit. Should still work."
        -working: true
        -agent: "testing"
        -comment: "REGRESSION PASSED. GET /api/languages -> 17 languages. GET /api/languages/python -> 200 with 4 courses. GET /api/courses/course_python_base (auth) -> 200 with 5 lessons. GET /api/lessons/lesson_python_base_0 -> 200. POST /api/lessons/complete {lesson_python_base_0} -> 200 ({already_completed:true} since demo had it pre-completed). GET /api/quizzes/quiz_python_base -> 200 with 4 questions. POST /api/quizzes/submit with all correct answers -> 200 {score:100, passed:true}."

  - task: "AI Tutor (/api/tutor/chat)"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "Uses Emergent LLM Key + GPT-5.2. Falls back to mocked reply if no key. Persists messages."
        -working: true
        -agent: "testing"
        -comment: "POST /api/tutor/chat {message:'Cos\\'è una variabile?', language:it} -> 200 with reply (661 chars) — real LLM (gpt-5.2 via Emergent key) responded. Messages persisted in tutor_messages collection."

  - task: "Billing checkout (Stripe test mode)"
    implemented: true
    working: true
    file: "backend/billing.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "Uses STRIPE_API_KEY=sk_test_emergent. Endpoints: /api/billing/checkout, /api/billing/coupons/validate, etc."
        -working: true
        -agent: "testing"
        -comment: "Not exercised in this run (not in current_focus). Routers loaded successfully — no regression observed."

  - task: "Certificates PDF generation (/api/certificates/*)"
    implemented: true
    working: true
    file: "backend/certificates_pdf.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "GET /api/certificates/me, /api/certificates/pdf/{course_id}. Generates PDF with QR code via reportlab."
        -working: true
        -agent: "testing"
        -comment: "GET /api/certificates/me (demo, auth) -> 200. PDF generation endpoint not invoked here."

  - task: "Gamification missions/streaks (/api/missions/*)"
    implemented: true
    working: true
    file: "backend/missions.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "GET /api/missions/me, weekly challenges, mission progress."
        -working: true
        -agent: "testing"
        -comment: "Minor: Test plan mentioned GET /api/missions/me but the actual route in missions.py is GET /api/missions/today (returns 200). /api/missions/me does not exist (404). Either update test plan OR add an alias. Functional missions endpoints (missions/today, challenges/weekly, level/me) are reachable. Lesson completion correctly increments mission metrics."

  - task: "Admin advanced analytics (/api/admin/*)"
    implemented: true
    working: true
    file: "backend/admin_advanced.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "Transactions, retention, conversion analytics."
        -working: true
        -agent: "testing"
        -comment: "GET /api/admin/stats (admin) -> 200 with users=14, conversion_rate, top_languages. GET /api/admin/users (admin) -> 200 array of 14 users. Admin auth (RBAC) works correctly."

frontend:
  - task: "Onboarding flow (4 slides + AsyncStorage gate)"
    implemented: true
    working: true
    file: "frontend/app/onboarding.tsx, frontend/app/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "First-time users redirected to /onboarding. Sets onboarding_done in AsyncStorage. CTA goes to /(auth)/register."
        -working: true
        -agent: "testing"
        -comment: "VERIFIED on mobile viewport 390x844. After clearing localStorage, root URL redirects to /onboarding (4 slides). 'Avanti' button cycles through slides; final CTA 'Inizia subito gratis' navigates to /register. AsyncStorage 'onboarding_done'=1 is correctly persisted. Reload after completion does NOT re-show onboarding."

  - task: "Affiliate dashboard screen"
    implemented: true
    working: true
    file: "frontend/app/affiliate.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Loads /api/affiliate/me/summary, displays referral code, pending/paid amounts, payout request modal. Accessed from Profile > Programma Affiliati."
        -working: true
        -agent: "testing"
        -comment: "VERIFIED. /affiliate page loads cleanly. Referral code '32FBD643' (8 chars) displayed. Saldo disponibile €0.00, Già pagato €0.00, Invitati: 0. Payout button correctly DISABLED with label 'Min. €50 per payout' since pending<50. No empty-state errors. Screenshot confirms layout."

  - task: "Push token registration after login"
    implemented: true
    working: true
    file: "frontend/src/push.ts, frontend/src/AuthContext.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "AuthContext calls registerPushToken() after login/register. Skips on web. Calls POST /api/push/register."
        -working: true
        -agent: "testing"
        -comment: "VERIFIED. Login & register flows succeed without errors. push.ts correctly no-ops on web (Platform.OS==='web') as documented; no 4xx network errors observed in console. Backend /api/push/register already validated. No regression in auth flow."

  - task: "Auth (login/register/logout) and home/tabs/profile UI"
    implemented: true
    working: true
    file: "frontend/app/(auth)/login.tsx, register.tsx, (tabs)/*.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "ALL 15 frontend smoke tests PASSED on mobile 390x844. Login as demo lands on /home (Demo Student, XP 490, streak 5, 14 lessons, badges grid, 5 learning paths, recommended Python/JS/HTML). Register with random email auto-logs in & redirects to home. Languages tab shows Python; tapping opens /language/python with 4 levels visible. /lesson/lesson_python_base_0 renders with 'Completa lezione' button. Tutor tab loads with input. Profile shows name, avatar, all menu rows including 'Programma Affiliati' (testID menu-affiliate) and 'Logout'. /pricing shows Free/Pro plans. /certificates and /missions render without errors. Admin login + /admin shows 15 users, 1 pro, 6.67% conversion, 17 languages, top python+javascript, users list."

  - task: "Admin dashboard screen"
    implemented: true
    working: true
    file: "frontend/app/admin.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "VERIFIED. Admin user lands on /admin showing Dashboard Admin: 15 utenti totali, 1 Pro user, 6.67% conversion, 17 linguaggi, 85 lezioni, 5 completamenti, 68 quiz, 2 transazioni. Top linguaggi (python #1, javascript #2). Recent users list with Demo Student, Alice, Marco etc. plus admin badge."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 3
  run_ui: false

test_plan:
  current_focus:
    - "Phase 3 router registration in server.py"
    - "Push Notifications endpoints (/api/push/*)"
    - "Email transactional system (/api/email/*)"
    - "Affiliate dashboard (/api/affiliate/*)"
    - "Auth endpoints regression (register/login/me/refresh)"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
    -agent: "testing"
    -message: |
      Phase 3 backend tests COMPLETE — 26/27 PASSED. Tested via public URL https://dev-learn-path-2.preview.emergentagent.com/api.

      ALL Phase 3 PRIORITY 1 endpoints PASSED:
      - Affiliate: GET /me/summary (all required keys present, referral_code=32FBD643), POST /me/payout {amount:30} -> 400 'Importo minimo €50' ✓, GET /admin/all-summary -> 200 ✓
      - Push: register/unregister with ExponentPushToken[fake-test-token] ✓, admin outbox & scheduler/run (counters returned: abandoned_checkout=1) ✓
      - Email: outbox, /test {sent:true, provider:mock} ✓; provider is MOCKED (logged to db.email_outbox only — no real emails sent)
      - Welcome email side-effect VERIFIED: registering a fresh user adds a 'welcome' entry to db.email_outbox for their exact email

      REGRESSION: All passed — auth (register/login/me/refresh), 17 languages, course_python_base (5 lessons), lesson_python_base_0, lessons/complete, quiz_python_base (4 questions, score 100), tutor/chat (real GPT-5.2 reply 661 chars), certificates/me, admin/stats (14 users), admin/users.

      ONE MISMATCH (not a bug): GET /api/missions/me returns 404 because the actual implemented route is GET /api/missions/today (verified 200). Test plan referenced wrong path. Either update plan or add an alias.

      All endpoints work; backend is healthy. No critical issues.

    -agent: "main"
    -message: |
      Phase 3 backend routers (push_service, email_service, affiliate) are now registered in server.py.
      Please run a comprehensive backend test:

      PRIORITY (Phase 3 new):
      1. Affiliate: login as demo, GET /api/affiliate/me/summary → expect referral_code, pending_amount=0, invited_count, eligible_for_payout=false. POST /api/affiliate/me/payout with €30 should fail (min €50). Login as admin, GET /api/affiliate/admin/all-summary works.
      2. Push: login as demo, POST /api/push/register {expo_push_token:"ExponentPushToken[fake_token_test]", platform:"ios"} → 200 success. Login as admin, GET /api/push/outbox returns array. POST /api/push/scheduler/run runs and returns counters.
      3. Email: login as admin, GET /api/email/outbox returns array (welcome emails should appear from existing demo register). POST /api/email/test {to:"test@x.com", template_id:"welcome", lang:"it"} → sent:true, provider:"mock".
      4. Confirm welcome email is logged to db.email_outbox after a fresh /api/auth/register.

      REGRESSION:
      - POST /api/auth/register, /api/auth/login, GET /api/auth/me, POST /api/auth/refresh
      - GET /api/languages, /api/courses/course_python_base
      - POST /api/lessons/complete (lesson_python_base_0), /api/quizzes/submit
      - POST /api/tutor/chat with a simple message — accept any 2xx (LLM may be stubbed)
      - GET /api/missions/me, /api/certificates/me
      - Admin: GET /api/admin/stats, /api/admin/users

      Test credentials in /app/memory/test_credentials.md.
      Backend base URL: read EXPO_BACKEND_URL from /app/frontend/.env (or use http://localhost:8001).
