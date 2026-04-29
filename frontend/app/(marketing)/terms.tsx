import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, useMarketingLang } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';

const LAST_UPDATED = '24 Aprile 2025';

const TOS_IT = `
**1. Accettazione**

Utilizzando l'app o il sito CodeMaster Academy ("Servizio") accetti integralmente questi Termini di Servizio. Se non accetti, non utilizzare il Servizio.

**2. Descrizione del Servizio**

CodeMaster Academy fornisce contenuti didattici di programmazione (lezioni, quiz, esercizi, progetti pratici), un assistente AI Tutor (powered by GPT-5.2) e funzionalità di gamification, certificati e abbonamenti.

**3. Account**

Devi avere almeno 13 anni (16 in alcune giurisdizioni UE) per registrarti. Sei responsabile della riservatezza delle credenziali. Notificaci immediatamente in caso di accesso non autorizzato.

**4. Abbonamenti e Pagamenti**

• Pro Mensile: €9.99/mese, rinnovo automatico mensile.
• Pro Annuale: €79.99/anno, rinnovo automatico annuale.
• Lifetime: €199 una tantum, accesso a vita ai contenuti attualmente disponibili.

I pagamenti sono gestiti da Stripe. L'abbonamento si rinnova automaticamente fino a disdetta. Puoi disdire in qualsiasi momento dalle impostazioni del tuo account; manterrai l'accesso fino alla fine del periodo già pagato.

**5. Diritto di Recesso (consumatori UE)**

Hai 14 giorni dall'attivazione per recedere e ottenere il rimborso completo, salvo che tu abbia espressamente richiesto e iniziato la fruizione del Servizio (in tal caso, perdi il diritto di recesso una volta che il Servizio è completamente fornito; per contenuti digitali, il diritto si estingue all'inizio del download/streaming previo tuo esplicito consenso).

**6. Coupon e Promozioni**

I coupon hanno usi limitati e date di scadenza. Non sono cumulabili con altre promozioni. Ci riserviamo il diritto di disabilitare coupon abusivi.

**7. Programma Affiliati**

Gli utenti possono guadagnare il 10% di commissione sui pagamenti generati da referral. Soglia minima per payout: €50. I payout sono processati entro 7 giorni lavorativi via PayPal o bonifico bancario. CodeMaster Academy si riserva il diritto di rigettare commissioni fraudolente.

**8. Uso accettabile**

Non puoi:
• Riprodurre, vendere o ridistribuire i contenuti;
• Effettuare reverse engineering del Servizio;
• Utilizzare bot o scraping automatizzato;
• Condividere il tuo account con terzi (gli abbonamenti sono individuali);
• Inserire contenuti illegali, offensivi o lesivi tramite AI Tutor o moduli di contatto.

**9. Proprietà intellettuale**

Tutti i contenuti del Servizio (testi, video, codice esempio, design, marchi) sono di proprietà esclusiva di CodeMaster Academy o concessi in licenza. Non puoi copiarli senza autorizzazione scritta.

**10. AI Tutor**

Il tutor AI è uno strumento di apprendimento generato automaticamente. Le risposte possono contenere errori. Non sostituisce un insegnante umano qualificato. Non assumiamo responsabilità per decisioni basate esclusivamente sull'AI Tutor.

**11. Limitazione di responsabilità**

Nei limiti consentiti dalla legge, CodeMaster Academy non è responsabile per danni indiretti, incidentali o consequenziali. La responsabilità totale è limitata all'importo pagato negli ultimi 12 mesi.

**12. Sospensione e cancellazione**

Possiamo sospendere o cancellare account che violano questi Termini, senza preavviso e senza rimborso (oltre i diritti di legge).

**13. Legge applicabile**

Questi Termini sono regolati dalla legge italiana. Foro competente esclusivo: Tribunale di Roma, salvo diritto inderogabile del consumatore.

**14. Modifiche**

Possiamo modificare questi Termini. Le modifiche sostanziali ti saranno notificate via email almeno 30 giorni prima. L'uso continuato del Servizio dopo le modifiche costituisce accettazione.

**15. Contatti**

legal@codemaster.app — per questioni legali e contrattuali.
`;

const TOS_EN = `
**1. Acceptance**

By using the CodeMaster Academy app or website ("Service") you fully accept these Terms of Service. If you do not accept, do not use the Service.

**2. Service description**

CodeMaster Academy provides programming educational content (lessons, quizzes, exercises, hands-on projects), an AI Tutor assistant (powered by GPT-5.2), gamification features, certificates and subscription plans.

**3. Account**

You must be at least 13 years old (16 in some EU jurisdictions). You are responsible for keeping your credentials confidential. Notify us immediately of any unauthorized access.

**4. Subscriptions and Payments**

• Pro Monthly: €9.99/mo, auto-renewing monthly.
• Pro Yearly: €79.99/yr, auto-renewing yearly.
• Lifetime: €199 one-time, lifetime access to currently available content.

Payments are processed by Stripe. Subscriptions auto-renew until cancellation. You can cancel anytime from account settings; you will retain access until the end of the paid period.

**5. Right of withdrawal (EU consumers)**

You have 14 days from activation to withdraw and obtain a full refund, unless you have expressly requested and started using the Service (in which case the withdrawal right ends once the Service is fully provided; for digital content, the right ends upon download/streaming start with your explicit consent).

**6. Coupons and promotions**

Coupons have limited uses and expiration dates. They cannot be combined with other promotions. We reserve the right to disable abusive coupons.

**7. Affiliate program**

Users can earn 10% commission on payments from referrals. Minimum payout threshold: €50. Payouts are processed within 7 business days via PayPal or bank transfer. We reserve the right to reject fraudulent commissions.

**8. Acceptable use**

You may not:
• Reproduce, sell or redistribute the content;
• Reverse-engineer the Service;
• Use bots or automated scraping;
• Share your account with third parties (subscriptions are individual);
• Submit illegal, offensive or harmful content via AI Tutor or contact forms.

**9. Intellectual property**

All Service content (texts, videos, sample code, design, trademarks) is owned by or licensed to CodeMaster Academy. You may not copy without written permission.

**10. AI Tutor**

The AI tutor is an automatically-generated learning tool. Responses may contain errors. It does not replace a qualified human teacher. We disclaim liability for decisions based solely on AI Tutor output.

**11. Limitation of liability**

To the extent permitted by law, CodeMaster Academy is not liable for indirect, incidental or consequential damages. Total liability is capped at the amount paid in the last 12 months.

**12. Suspension and termination**

We may suspend or terminate accounts that violate these Terms, without notice and without refund (beyond statutory rights).

**13. Governing law**

These Terms are governed by Italian law. Exclusive jurisdiction: Court of Rome, unless mandatory consumer rights apply.

**14. Changes**

We may modify these Terms. Material changes will be notified via email at least 30 days in advance. Continued use after changes means acceptance.

**15. Contact**

legal@codemaster.app — for legal and contractual matters.
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

export default function Terms() {
  const [lang, setLang] = useMarketingLang();
  const text = lang === 'it' ? TOS_IT : TOS_EN;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="terms-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'Terms of Service - CodeMaster Academy', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />
      <Section>
        <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
          <H1>{mt('terms_title', lang)}</H1>
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
