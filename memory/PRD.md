# CodeMaster Academy - Production-Grade SaaS Platform

## Overview
Mobile Expo React Native app + FastAPI backend for learning programming. Italian-first multilingual (IT/EN/ES/FR/DE/PT). Production-grade SaaS architecture targeting Stripe + IAP, advanced AI tutor, gamification, admin dashboard, retention analytics.

## v2 Production Upgrade (current)

### Real Payments — Stripe
- POST /api/billing/stripe/checkout: real Stripe Checkout with server-side amounts (PACKAGES dict prevents client tampering)
- Coupons: WELCOME20 (20%), STUDENT50 (50%), BLACKFRIDAY (35%) + admin-created
- POST /api/webhook/stripe (idempotent)
- GET /api/billing/stripe/status/{session_id} polling endpoint
- Test card: 4242 4242 4242 4242
- Referral commissions: 10% of paid txns automatically tracked → `referral_commissions` collection + 200 XP to referrer

### IAP Architecture (scaffold)
- POST /api/billing/iap/verify accepts ios/android receipts, stored in `iap_receipts`. **MOCKED**: real validation against Apple/Google requires production keys (documented in code).

### PDF Certificates with QR
- ReportLab + qrcode generate landscape A4 certificates with student name, course, level, blue/purple theme, QR linking to /api/certificates/verify/{cert_id}
- Public verification endpoint validates authenticity
- Auto-generated when course 100% completed

### Advanced AI Tutor (GPT-5.2)
- Original chat (`/api/tutor/chat`)
- POST /api/tutor/analyze-code: structured JSON analysis (feedback, errors, suggestions, fixed_code, difficulty_estimate)
- POST /api/tutor/study-plan: generates personalized 4-week study plan based on goal + weekly hours, stored in `study_plans`
- All multilingual (IT/EN/ES/FR/DE/PT)

### Gamification (full system)
- Daily missions (3/day rotating from 4 templates: lessons, quizzes, tutor, XP)
- Weekly challenges (1/week, deterministic per user+week)
- Auto-incremented on lesson complete / quiz pass / tutor message
- User levels (formula: 100·n·(n+1)) with progress bar
- Streak system with auto-update on activity
- 8 badges auto-awarded

### Admin Dashboard Advanced
- KPIs + retention analytics (active 24h/7d/30d, ARPU, total revenue, paid txns)
- Conversion funnel (registered → first lesson → first quiz → Pro)
- CRUD: PUT/DELETE /api/admin/lessons/{id}, POST/DELETE /api/admin/quizzes
- User management: PUT /api/admin/users/{id}/subscription, DELETE
- Coupon management: GET/POST /api/admin/coupons
- Transactions: GET /api/admin/transactions

### Security
- JWT refresh: POST /api/auth/refresh
- Rate limiting: 10/min on /api/auth/login (slowapi)
- bcrypt 12 rounds for password hashing
- RBAC enforced on all admin endpoints (403 for non-admin)

### Legal
- GET /api/legal/privacy & /api/legal/terms
- Italian law, GDPR-compliant; placeholders for company name (CodeMaster Academy SRL)
- Frontend renders at /legal/[slug]

### Frontend new screens
- /missions — daily missions + weekly challenge with claim buttons
- /study-plan — AI-generated 4-week study plan
- /legal/privacy & /legal/terms
- /payment/success — Stripe redirect handler with polling (8 attempts × 2.5s)
- pricing.tsx redesigned with coupon input, Stripe button, legal links
- certificates.tsx now downloads real PDF (web blob / native Linking)
- Profile and Home updated with new menu entries

## Known Mocked Items
- IAP validation (architecture ready, needs prod keys)
- Stripe webhook signature: relies on emergentintegrations Stripe wrapper, real signing secret needed for production

## Demo Accounts (in /app/memory/test_credentials.md)
- Student: demo@codemaster.app / Demo123!
- Admin: admin@codemaster.app / Admin123!

## Coupons (test)
- WELCOME20 (20% off)
- STUDENT50 (50% off)
- BLACKFRIDAY (35% off)

## Architecture
Backend (`/app/backend/`): server.py, auth.py, seed_data.py, billing.py, certificates_pdf.py, missions.py, admin_advanced.py, legal.py
Frontend (`/app/frontend/app/`): file-based Expo Router; AuthContext for token; src/api.ts axios with secure-store; localized strings via src/i18n.ts
