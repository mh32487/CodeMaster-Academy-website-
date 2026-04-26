# 🚀 Production Release Checklist — CodeMaster Academy

## Backend Production Switches

### Stripe (currently TEST mode)
- [ ] Replace `STRIPE_API_KEY=sk_test_emergent` with **live key** `sk_live_...` in `/app/backend/.env`
- [ ] Configure webhook endpoint in Stripe Dashboard: `https://your-domain.com/api/webhook/stripe`
- [ ] Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` env var (currently relies on emergentintegrations wrapper)
- [ ] Test with real card on live mode before promoting

### Email (currently MOCK)
- [ ] Choose provider: Resend (recommended) or SendGrid
- [ ] Add `EMAIL_PROVIDER=resend` (or `sendgrid`) to `/app/backend/.env`
- [ ] Add API key: `RESEND_API_KEY=re_...` or `SENDGRID_API_KEY=SG....`
- [ ] Update `FROM_EMAIL` to verified domain (e.g. noreply@codemaster.app)
- [ ] Verify sending domain in provider dashboard (DNS records)

### IAP — Apple App Store
- [ ] Create products in App Store Connect (Auto-Renewable Subscriptions):
  - `pro_monthly_codemaster` (€9.99/month)
  - `pro_yearly_codemaster` (€79.99/year)
  - `lifetime_codemaster` (€199, non-consumable)
- [ ] Generate **App-Specific Shared Secret** in App Store Connect
- [ ] Add to `.env`: `APPLE_SHARED_SECRET=...`
- [ ] In `billing.py` → `verify_iap`, replace TODO with: POST to `https://buy.itunes.apple.com/verifyReceipt` with shared_secret. Production endpoint; test endpoint for sandbox.
- [ ] Validate `latest_receipt_info[0]['expires_date_ms']` for subscriptions

### IAP — Google Play
- [ ] Create products in Google Play Console (Subscriptions)
- [ ] Create Service Account in Google Cloud Console with **Pub/Sub Publisher** + **Android Publisher** roles
- [ ] Download service account JSON, add to backend container
- [ ] Add `.env`: `GOOGLE_PLAY_SA_JSON_PATH=/app/backend/secrets/google-play-sa.json`
- [ ] In `billing.py` → `verify_iap`, replace TODO with: `androidpublisher_v3.purchases.subscriptions.get(packageName, productId, token)` from `google-api-python-client`
- [ ] Set up RTDN (Real-time Developer Notifications) for renewals/cancellations

### Push Notifications
- [ ] Production: build app with EAS (`eas build --platform all`)
- [ ] iOS: upload APN auth key to Expo (`eas credentials`)
- [ ] Android: Firebase Cloud Messaging is auto-configured by Expo
- [ ] Schedule cron to call `POST /api/push/scheduler/run` daily (e.g., GitHub Actions, AWS EventBridge, Render Cron)

### Security hardening
- [x] Rate limiting on /auth/login (10/min)
- [ ] Set strong `JWT_SECRET` (256-bit random hex) in production
- [ ] Enable HTTPS only (already done by emergent ingress)
- [ ] Audit log: enable MongoDB audit log for production cluster
- [ ] Set up Sentry for error tracking: `pip install sentry-sdk[fastapi]` + init in server.py
- [ ] Restrict CORS `allow_origins` to your real domains (currently `*`)
- [ ] Add rate limits to other sensitive endpoints (/api/billing/stripe/checkout, /api/tutor/*)

### Database
- [ ] Migrate from local MongoDB to **MongoDB Atlas** (M10+ for production)
- [ ] Enable automatic daily backups
- [ ] Set up replica set for HA
- [ ] Add indexes:
  ```
  db.users.createIndex({email: 1}, {unique: true})
  db.users.createIndex({referral_code: 1})
  db.progress.createIndex({user_id: 1, course_id: 1})
  db.payment_transactions.createIndex({session_id: 1})
  db.tutor_messages.createIndex({user_id: 1, session_id: 1, created_at: -1})
  ```

## Frontend Production Build

### App Store Connect (iOS)
- [ ] Apple Developer account ($99/year)
- [ ] Generate `eas build --platform ios --profile production`
- [ ] Upload to App Store Connect via Transporter
- [ ] Fill in app metadata using `/app/store_assets/STORE_LISTINGS.md`
- [ ] Upload screenshots (use real device frames or Screenshot Maker)
- [ ] Set up TestFlight for beta
- [ ] Submit for review

### Google Play Console (Android)
- [ ] Google Play Developer account ($25 one-time)
- [ ] `eas build --platform android --profile production`
- [ ] Upload AAB to internal testing track
- [ ] Fill metadata using STORE_LISTINGS.md (multilingua)
- [ ] Upload screenshots + feature graphic (`feature_graphic_android.png`)
- [ ] Configure data safety form (we collect: account, usage, payments)
- [ ] Submit for review

### Configuration
- [ ] Update `app.json` `version` to 1.0.0 and `ios.buildNumber`/`android.versionCode` to 1
- [ ] Replace placeholder `bundleIdentifier` if needed (currently `com.codemaster.academy`)
- [ ] Add Privacy URL: `https://your-domain.com/legal/privacy`
- [ ] Add Terms URL: `https://your-domain.com/legal/terms`

## Pre-launch Testing
- [ ] Run testing agent end-to-end on production build
- [ ] Test real payment with €0.01 product (or refund test)
- [ ] Test push notification delivery on real iOS + Android devices
- [ ] Verify GDPR cookie banner / consent flow on web
- [ ] Verify email deliverability with Mail Tester (mail-tester.com)
- [ ] Load test backend: 100 concurrent users on /api/auth/login (use locust or k6)

## Marketing assets in `/app/store_assets/`
- ✅ icon 1024x1024 (App Store)
- ✅ icon 512x512 (Google Play)
- ✅ feature graphic 1024x500 (Google Play)
- ✅ Multilingua listings (IT/EN/ES/FR/DE/PT)
- ⏳ Screenshots — produrre con tool quando build pronta (vedi STORE_LISTINGS.md)
- ⏳ Promotional video (opzionale, +30% conversioni)

## Demo accounts (per tester)
- Studente: demo@codemaster.app / Demo123!
- Admin: admin@codemaster.app / Admin123!
- Coupons: WELCOME20, STUDENT50, BLACKFRIDAY

## Post-launch monitoring
- Sentry per errori
- Stripe Dashboard per metriche revenue
- Admin `/admin/analytics/retention` per retention/ARPU
- App Store Connect / Google Play Console per crash + reviews
