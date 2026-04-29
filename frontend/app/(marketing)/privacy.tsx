import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { colors, radii } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, useMarketingLang, MAX_W } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';

const LAST_UPDATED = '24 Aprile 2025';

const PRIVACY_IT = `
**1. Titolare del Trattamento**

CodeMaster Academy (di seguito "noi", "nostro", "Servizio") opera l'applicazione mobile e il sito web disponibili all'indirizzo codemaster.app. Il titolare del trattamento dei dati personali è CodeMaster Academy. Per qualsiasi richiesta puoi contattarci all'indirizzo privacy@codemaster.app.

**2. Dati raccolti**

Raccogliamo le seguenti categorie di dati:
• Dati di registrazione: nome, email, password (memorizzata in forma cifrata bcrypt).
• Dati di utilizzo: progresso lezioni, quiz, esercizi, streak, badge, sessioni con AI Tutor.
• Dati tecnici: indirizzo IP, tipo dispositivo, sistema operativo, log errori, eventi anonimi di analytics.
• Dati di pagamento: solo riferimento Stripe Checkout Session ID e ultimi 4 numeri della carta. Non memorizziamo MAI i dati completi della carta sui nostri server.
• Token push notification (Expo) — facoltativi, revocabili da impostazioni.
• Messaggi inviati al modulo di contatto.

**3. Finalità del trattamento**

Utilizziamo i dati per:
(a) fornire e personalizzare il Servizio educativo;
(b) gestire pagamenti, abbonamenti e fatturazione tramite Stripe;
(c) inviare email transazionali (benvenuto, ricevute, reset password);
(d) inviare notifiche push opzionali (reminder studio, nuovi contenuti);
(e) prevenire frodi e abusi;
(f) adempiere a obblighi legali (tasse, antiriciclaggio).

**4. Base giuridica (GDPR Art. 6)**

• Esecuzione del contratto (registrazione, abbonamento) — Art. 6(1)(b)
• Consenso (notifiche push, marketing) — Art. 6(1)(a) — revocabile in qualsiasi momento
• Obbligo legale (fatturazione) — Art. 6(1)(c)
• Legittimo interesse (sicurezza, prevenzione frodi) — Art. 6(1)(f)

**5. Conservazione dei dati**

Conserviamo i tuoi dati per la durata dell'account. Dopo la richiesta di cancellazione, eliminiamo i dati personali entro 30 giorni, fatta eccezione per i dati richiesti per obblighi legali (es. fatturazione: 10 anni come da normativa fiscale italiana).

**6. Trasferimento dati a terze parti**

Utilizziamo i seguenti fornitori (sub-responsabili del trattamento):
• Stripe (Irlanda/USA) — pagamenti — Privacy Shield + SCC
• Emergent LLM Provider (OpenAI, USA) — AI Tutor — SCC GDPR
• Resend / SendGrid (USA) — email transazionali — SCC GDPR
• Expo (USA) — push notifications — SCC GDPR
• MongoDB Atlas (UE) — database

Non vendiamo MAI i tuoi dati a inserzionisti.

**7. I tuoi diritti (GDPR)**

Hai diritto di:
• Accedere ai tuoi dati personali;
• Richiederne la rettifica o cancellazione;
• Opporti al trattamento;
• Limitare il trattamento;
• Ricevere i dati in formato portabile (JSON);
• Revocare il consenso in qualsiasi momento;
• Proporre reclamo al Garante Privacy (www.garanteprivacy.it).

Per esercitare questi diritti, scrivici a privacy@codemaster.app.

**8. Cookie**

Usiamo cookie tecnici essenziali (autenticazione, sessione) e cookie analitici anonimizzati. Non utilizziamo cookie pubblicitari o di profilazione di terze parti senza consenso.

**9. Minori**

Il Servizio è destinato a persone di età pari o superiore a 13 anni (16 in alcune giurisdizioni UE). Non raccogliamo consapevolmente dati da minori senza consenso parentale.

**10. Modifiche**

Potremmo aggiornare questa Privacy Policy. Le modifiche sostanziali ti saranno comunicate via email. La data di ultimo aggiornamento è in cima al documento.

**11. Contatti**

Per qualsiasi domanda relativa alla privacy: privacy@codemaster.app.
Responsabile Protezione Dati (DPO): dpo@codemaster.app.
`;

const PRIVACY_EN = `
**1. Data Controller**

CodeMaster Academy ("we", "our", "Service") operates the mobile app and website at codemaster.app. The data controller is CodeMaster Academy. For any request, contact us at privacy@codemaster.app.

**2. Data we collect**

We collect the following categories of data:
• Account data: name, email, password (stored bcrypt-hashed).
• Usage data: lesson progress, quizzes, exercises, streaks, badges, AI Tutor sessions.
• Technical data: IP address, device type, OS, error logs, anonymized analytics events.
• Payment data: only Stripe Checkout Session ID and last 4 digits of card. We NEVER store full card details on our servers.
• Push notification tokens (Expo) — optional, revocable from settings.
• Contact form messages.

**3. Purpose of processing**

We use data to:
(a) provide and personalize the educational Service;
(b) handle payments, subscriptions and billing via Stripe;
(c) send transactional emails (welcome, receipts, password reset);
(d) send optional push notifications (study reminders, new content);
(e) prevent fraud and abuse;
(f) comply with legal obligations (taxes, anti-money-laundering).

**4. Legal basis (GDPR Art. 6)**

• Performance of contract — Art. 6(1)(b)
• Consent (push notifications, marketing) — Art. 6(1)(a) — revocable anytime
• Legal obligation (billing) — Art. 6(1)(c)
• Legitimate interest (security, fraud prevention) — Art. 6(1)(f)

**5. Data retention**

We keep your data for the duration of your account. After deletion request, we remove personal data within 30 days, except data required by legal obligations (e.g. invoices: 10 years per Italian tax law).

**6. Third-party processors**

• Stripe (IE/USA) — payments — SCC GDPR
• Emergent LLM Provider (OpenAI, USA) — AI Tutor — SCC GDPR
• Resend / SendGrid (USA) — transactional emails — SCC GDPR
• Expo (USA) — push notifications — SCC GDPR
• MongoDB Atlas (EU) — database

We NEVER sell your data to advertisers.

**7. Your rights (GDPR)**

You have the right to:
• Access your personal data;
• Request rectification or deletion;
• Object to processing;
• Restrict processing;
• Receive data in portable format (JSON);
• Withdraw consent anytime;
• File a complaint with the Italian Data Protection Authority (www.garanteprivacy.it) or your local DPA.

To exercise these rights, email privacy@codemaster.app.

**8. Cookies**

We use essential technical cookies (authentication, session) and anonymized analytics cookies. We do not use third-party advertising or profiling cookies without consent.

**9. Minors**

The Service is intended for users 13+ (16+ in some EU jurisdictions). We do not knowingly collect data from minors without parental consent.

**10. Changes**

We may update this Privacy Policy. Material changes will be communicated via email. The last-updated date is at the top of this document.

**11. Contact**

For any privacy-related questions: privacy@codemaster.app.
Data Protection Officer (DPO): dpo@codemaster.app.
`;

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <View key={i} style={{ height: 12 }} />;
    if (line.startsWith('**') && line.endsWith('**')) {
      return <Text key={i} style={styles.h3}>{line.replace(/\*\*/g, '')}</Text>;
    }
    if (line.startsWith('•')) {
      return <Text key={i} style={styles.bullet}>{line}</Text>;
    }
    return <Text key={i} style={styles.para}>{line}</Text>;
  });
}

export default function Privacy() {
  const [lang, setLang] = useMarketingLang();
  const text = lang === 'it' ? PRIVACY_IT : PRIVACY_EN;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="privacy-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'Privacy Policy - CodeMaster Academy', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />
      <Section>
        <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
          <H1>{mt('privacy_title', lang)}</H1>
          <Text style={styles.updated}>{mt('privacy_updated', lang)}: {LAST_UPDATED}</Text>
          <View style={{ marginTop: 24 }}>
            {renderMarkdown(text)}
          </View>
        </View>
      </Section>
      <WebFooter lang={lang} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  updated: { color: colors.text.tertiary, fontSize: 13, marginTop: 8 },
  h3: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginTop: 24, marginBottom: 8 },
  para: { fontSize: 15, color: colors.text.primary, lineHeight: 26, marginBottom: 4 },
  bullet: { fontSize: 15, color: colors.text.primary, lineHeight: 26, marginLeft: 12, marginBottom: 4 },
});
