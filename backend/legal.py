"""Privacy Policy & Terms of Service text endpoints."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/legal", tags=["legal"])

PRIVACY_POLICY_IT = """# Informativa Privacy
**Ultimo aggiornamento:** 1 Gennaio 2026

CodeMaster Academy SRL (di seguito "noi") rispetta la tua privacy. Questa informativa descrive come raccogliamo, usiamo e proteggiamo i tuoi dati personali.

## 1. Titolare del trattamento
- **CodeMaster Academy SRL**
- Email: info@codemaster.app
- Sede legale: Italia

## 2. Dati raccolti
- **Account**: nome, email, password (hash bcrypt)
- **Utilizzo**: lezioni completate, quiz, progresso, badge, streak
- **Pagamenti**: gestiti tramite Stripe (PCI-DSS compliant). Non memorizziamo dati carta.
- **Comunicazioni con AI Tutor**: messaggi conservati per migliorare il servizio

## 3. Base giuridica
- Esecuzione del contratto (art. 6.1.b GDPR) per fornire il servizio
- Consenso (art. 6.1.a GDPR) per comunicazioni marketing
- Interesse legittimo per analytics aggregate

## 4. Diritti dell'utente
Hai diritto a: accesso, rettifica, cancellazione, limitazione, portabilità, opposizione. Contattaci a info@codemaster.app per esercitarli.

## 5. Conservazione
- Dati account: per la durata dell'iscrizione + 12 mesi
- Dati di pagamento: 10 anni (obblighi fiscali)
- Log di sicurezza: 12 mesi

## 6. Trasferimenti
I dati possono essere trasferiti a:
- Stripe (USA) — pagamenti, con clausole contrattuali standard UE
- OpenAI (USA) — AI Tutor, con DPA in essere
- MongoDB / hosting cloud — UE

## 7. Sicurezza
Crittografia in transito (TLS 1.2+) e a riposo. Password hashate con bcrypt. Token JWT firmati. Rate limiting su endpoint sensibili.

## 8. Cookie
Utilizziamo solo cookie tecnici essenziali per l'autenticazione. Nessun cookie di profilazione di terze parti.

## 9. Modifiche
Possiamo aggiornare questa informativa. Ti notificheremo via email per cambiamenti sostanziali.

## 10. Reclami
Puoi rivolgerti al Garante Privacy italiano: www.gpdp.it
"""

TERMS_IT = """# Termini di Servizio
**Ultimo aggiornamento:** 1 Gennaio 2026

Benvenuto su CodeMaster Academy. Utilizzando l'app accetti questi Termini.

## 1. Servizio
CodeMaster Academy ("Servizio") è una piattaforma educativa di programmazione fornita da **CodeMaster Academy SRL** (Italia, info@codemaster.app).

## 2. Account
- Devi avere almeno 16 anni (o consenso del genitore se minore)
- Sei responsabile della sicurezza del tuo account e password
- Un account per persona fisica
- Vietato condividere credenziali

## 3. Abbonamenti
- **Free**: accesso ai contenuti base
- **Pro Mensile** (€9.99/mese), **Pro Annuale** (€79.99/anno), **Lifetime** (€199 una tantum)
- Pagamenti elaborati da Stripe in EUR
- I rinnovi annuali/mensili sono automatici fino alla disdetta dal pannello cliente Stripe
- Diritto di recesso: 14 giorni dall'acquisto, salvo se hai iniziato a fruire del contenuto digitale (art. 59 Codice del Consumo)

## 4. Coupon e referral
- I coupon hanno un numero limitato di usi e possono scadere
- Il programma referral attribuisce XP e commissioni del 10% sui primi pagamenti dell'invitato
- Pagamento commissioni: bonifico al raggiungimento di €50 di saldo

## 5. Uso accettabile
È vietato:
- Distribuire i contenuti senza autorizzazione
- Reverse engineering del software
- Tentativi di accesso non autorizzato
- Uso dell'AI Tutor per generare contenuto offensivo o illegale

## 6. Proprietà intellettuale
Tutti i contenuti (lezioni, esercizi, codice di esempio) sono di proprietà di CodeMaster Academy SRL salvo diversa indicazione. Hai una licenza personale, non esclusiva e non trasferibile.

## 7. AI Tutor
L'AI Tutor utilizza OpenAI GPT-5.2 e fornisce risposte che potrebbero contenere imprecisioni. **Le risposte non costituiscono consulenza professionale**.

## 8. Limitazione di responsabilità
Il Servizio è fornito "as-is". Non garantiamo continuità ininterrotta. La responsabilità massima è limitata all'importo pagato negli ultimi 12 mesi.

## 9. Risoluzione
Possiamo sospendere o terminare account che violano questi Termini.

## 10. Legge applicabile
Legge italiana. Foro competente: Tribunale di Milano (Italia).

## 11. Contatti
- Email: info@codemaster.app
- Privacy: privacy@codemaster.app
"""


@router.get("/privacy")
async def privacy():
    return {"language": "it", "title": "Informativa Privacy", "content": PRIVACY_POLICY_IT, "updated_at": "2026-01-01"}


@router.get("/terms")
async def terms():
    return {"language": "it", "title": "Termini di Servizio", "content": TERMS_IT, "updated_at": "2026-01-01"}
