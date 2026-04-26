# CodeMaster Academy - PRD

## Overview
Mobile app (Expo React Native) for learning programming languages from beginner to advanced. Frontend in Italian primary, supports IT/EN/ES/FR/DE/PT for UI labels and lesson content. Backend in FastAPI + MongoDB.

## Features delivered (MVP v1.0)

### Auth (JWT custom)
- Register / Login / Me endpoints
- bcrypt password hashing
- Admin role
- Referral code on registration (+50 XP to referrer)

### Content (17 languages, 4 levels)
- Languages: Python, JavaScript, HTML/CSS, Java, C++, C#, PHP, SQL, Kotlin, Swift, TypeScript, Go, Rust, Ruby, Dart, R, Bash
- Full content for **Python, JavaScript, HTML/CSS** (lessons + quizzes + exercises across base/intermediate/advanced/pro)
- Placeholder structure for the other 14 languages
- Multilingual content (IT/EN/ES/FR/DE/PT)

### Learning experience
- Splash with "Inizia ora"
- Bottom tab nav: Home / Languages / Paths / Tutor / Profile
- Course detail with completion %
- Lesson page (text + code block + complete button)
- Quiz with multiple choice + score + corrections
- Exercise (fill-in-the-blank code)
- 5 Learning Paths (Web/Python/App/Backend/Data)
- 6 Practical Projects
- Badges (8 types) auto-awarded
- Streak tracking
- XP system

### AI Tutor
- GPT-5.2 via Emergent LLM Key (multi-turn)
- Multilingual responses
- Session persistence in MongoDB

### Monetization (mock)
- 4 pricing plans: Free / Pro Monthly (€9.99) / Pro Yearly (€79.99) / Lifetime (€199)
- Mock checkout updates user.subscription
- Architecture ready for Stripe + IAP

### Engagement features
- Leaderboard (top 50 by XP, podium UI for top 3)
- Referral system (8-char code, +50 XP per invite)
- Certificates page (auto-generated when course 100% done; mock PDF)
- Daily streak system

### Admin
- Dashboard with KPIs (users, pro_users, conversion, completions, transactions, top languages)
- User list
- Endpoints: POST /api/admin/languages, /api/admin/lessons (add content without code changes)

### Multilingual UI
- 6 languages supported in Profile settings
- Content + UI strings localized

## Backend endpoints
- /api/auth/{register,login,me}
- /api/languages, /api/languages/{id}
- /api/courses/{id}
- /api/lessons/{id}, /api/lessons/complete
- /api/quizzes/{id}, /api/quizzes/submit
- /api/exercises/{id}, /api/exercises/submit
- /api/paths, /api/paths/{id}
- /api/projects, /api/projects/{id}
- /api/progress/me, /api/badges, /api/leaderboard
- /api/tutor/chat, /api/tutor/history, /api/tutor/sessions
- /api/plans, /api/billing/checkout (mock)
- /api/referral/me
- /api/certificates/me
- /api/admin/{stats,users,languages,lessons}

## Mocked / Future
- **Payments MOCKED**: no real Stripe / IAP. Architecture ready (transactions collection, plan_id on user.subscription).
- **PDF certificates MOCKED**: returns placeholder URL. Will wire reportlab/wkhtmltopdf in v1.1.
- **Push notifications**: permission declared in app.json; integration deferred.
- **Affiliate program**: not yet built; planned for v1.2 with separate `affiliates` collection.

## Demo Accounts (in /app/memory/test_credentials.md)
- Student: demo@codemaster.app / Demo123!
- Admin: admin@codemaster.app / Admin123!
