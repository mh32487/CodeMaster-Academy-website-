# 🚀 Deployment guide — Vercel (Web) + Backend (Emergent/Railway/Render)

## ❗ Problema tipico: "Il bottone Registrati non fa nulla su Vercel"

La causa al 99% è che `EXPO_PUBLIC_BACKEND_URL` **non è configurata** nelle env
di Vercel. Senza quella variabile, il frontend tenta le chiamate `POST /api/auth/register`
sullo stesso dominio Vercel (che è un sito statico) e riceve 404, ma l'`Alert.alert` di
React Native non è visibile nei browser, quindi l'utente vede "nulla succede".

Dalla versione corrente abbiamo aggiunto:
- ✅ **Alert cross-platform** (`src/notify.ts`) che usa `window.alert` su web
- ✅ **Banner errore inline** visibile sempre (testID `register-error`, `login-error`)
- ✅ **Warning in console** se `EXPO_PUBLIC_BACKEND_URL` manca
- ✅ **Validazione password forte** (8+char, maiusc, numero, simbolo) con `<PasswordStrength>`

## 📋 Step-by-step: Deploy su Vercel

### 1. Build del sito (Expo web export)

```bash
cd /app/frontend
yarn install
npx expo export --platform web --output-dir dist
```

Questo crea `dist/` pronto per essere deployato come sito statico.

### 2. Connetti a Vercel

Su [vercel.com/new](https://vercel.com/new):
- Importa il repository GitHub
- **Build command**: `cd frontend && yarn install && npx expo export --platform web --output-dir dist`
- **Output directory**: `frontend/dist`

### 3. ⚠️ VARIABILE AMBIENTE CRITICA

In **Settings → Environment Variables** aggiungi:

| Nome variabile | Valore | Ambienti |
|---|---|---|
| `EXPO_PUBLIC_BACKEND_URL` | `https://api.codemaster.app` (o il tuo backend URL) | Production, Preview, Development |

Il valore deve essere l'URL completo del tuo backend FastAPI (senza `/api` finale).

Esempi validi:
- `https://api.codemaster.app` ← produzione
- `https://codemaster-backend.onrender.com` ← se usi Render
- `https://codemaster-backend.railway.app` ← se usi Railway
- `https://<tuo-dominio-emergent>.emergentagent.com` ← se usi Emergent

### 4. Configura CORS sul backend

Il tuo FastAPI deve accettare richieste dal dominio Vercel. In `/app/backend/server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://codemaster-academy-website.vercel.app",  # il tuo dominio Vercel
        "https://codemaster.app",                          # dominio custom futuro
        "http://localhost:3000",                           # dev locale
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Se vuoi accettare tutto temporaneamente (sconsigliato in produzione):
```python
allow_origins=["*"]
```

### 5. Redeploy

Dopo aver aggiunto la variabile, **redeploy manualmente** da Vercel:
- Deployments → ... → Redeploy

## 🧪 Come verificare che tutto funzioni

1. Apri `https://codemaster-academy-website.vercel.app/register`
2. Apri DevTools → Console. Se vedi `⚠️ EXPO_PUBLIC_BACKEND_URL is not set` → aggiorna env su Vercel
3. Apri DevTools → Network. Compila nome/email/password e premi "Registrati"
4. Cerca la chiamata `POST /api/auth/register`:
   - URL: deve puntare a `<EXPO_PUBLIC_BACKEND_URL>/api/auth/register`, NON al dominio Vercel
   - Status: 200 se OK, 4xx con messaggio JSON se errore (mostrato nel banner rosso)

## 🔐 Password requirements

Le password ora devono contenere:
- ✅ Almeno 8 caratteri
- ✅ Almeno 1 lettera maiuscola
- ✅ Almeno 1 numero
- ✅ Almeno 1 simbolo (es. `!` `@` `#` `$`)

Esempi validi: `Strong123!`, `MyPassword1#`, `CodeMaster99@`

## 🆘 Errori comuni e soluzioni

| Sintomo | Causa | Soluzione |
|---|---|---|
| Button non fa nulla | `EXPO_PUBLIC_BACKEND_URL` mancante | Aggiungila su Vercel + redeploy |
| Errore rosso "Impossibile contattare server" | Backend offline o CORS bloccante | Verifica backend vivo + CORS allow_origins |
| Errore "Email already registered" | Email già in uso | Usa email diversa o login |
| Errore password weak | Non rispetta i criteri | Vedi PasswordStrength meter sotto il campo |
| Si registra ma non reindirizza | Token non salvato in localStorage | Verifica browser localStorage abilitato |

## 📱 Differenza WEB vs APP mobile

- **Stessi endpoint** `/api/auth/register`, `/api/auth/login`, etc.
- **Stesso database** MongoDB
- **Stesso JWT token** — registrati da web, logga da app o viceversa
- Le uniche differenze: push notifications solo mobile, IAP solo mobile

## 🔗 Link utili

- [Vercel Environment Variables docs](https://vercel.com/docs/projects/environment-variables)
- [Expo Web deployment](https://docs.expo.dev/distribution/publishing-websites/)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
