import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, P, useMarketingLang } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';

const FAQS_IT = [
  { q: 'CodeMaster Academy è davvero gratis?', a: 'Sì, il piano Free ti dà accesso alle lezioni base di un linguaggio, quiz illimitati e community. Per i contenuti avanzati, AI Tutor illimitato e tutti i 17 linguaggi serve un piano Pro.' },
  { q: 'Come funziona l\'AI Tutor?', a: 'L\'AI Tutor è alimentato da GPT-5.2 di OpenAI tramite la nostra integrazione Emergent. Può spiegarti concetti, debuggare il tuo codice e creare percorsi di studio personalizzati. Puoi farti spiegare lo stesso concetto in 10 modi diversi se necessario.' },
  { q: 'I certificati sono riconosciuti?', a: 'I certificati CodeMaster Academy sono certificati di completamento corso. Hanno un QR code verificabile online che attesta l\'autenticità. Sono utili per il tuo portfolio e LinkedIn, ma non sostituiscono certificazioni vendor ufficiali (es. AWS, Microsoft).' },
  { q: 'Posso disdire l\'abbonamento in qualsiasi momento?', a: 'Sì. Vai in Profilo → Abbonamento → Gestisci e clicca Disdici. Manterrai l\'accesso fino al termine del periodo già pagato. Nessuna penale.' },
  { q: 'Cosa include il piano Lifetime?', a: 'Il piano Lifetime (€199 una tantum) ti dà accesso a vita ai contenuti attualmente disponibili e a tutte le nuove lezioni che pubblicheremo per i linguaggi già esistenti. Non include eventuali nuovi prodotti separati.' },
  { q: 'Avete uno sconto per studenti?', a: 'Sì! Usa il coupon STUDENT50 al checkout per il 50% di sconto sul piano Pro Annuale. Ci riserviamo il diritto di richiedere prova dell\'iscrizione (es. email .edu).' },
  { q: 'Come funziona il programma affiliati?', a: 'Quando un amico si registra usando il tuo codice referral e si abbona, guadagni il 10% di commissione. Soglia minima per payout: €50. Pagamenti via PayPal o bonifico entro 7 giorni lavorativi.' },
  { q: 'L\'app è disponibile per iPhone e Android?', a: 'Stiamo finalizzando il deploy su App Store e Google Play. Per testare ora la versione beta, scarica Expo Go e scansiona il QR code dalla pagina Download.' },
  { q: 'I miei dati sono al sicuro?', a: 'Sì. Le password sono cifrate con bcrypt, i pagamenti gestiti da Stripe (mai memorizziamo i dati della carta). Server in UE. Conformi GDPR. Vedi la Privacy Policy per i dettagli.' },
  { q: 'Posso usare CodeMaster offline?', a: 'L\'app mobile permette di scaricare le lezioni per consultarle offline (in arrivo nella prossima release). Quiz ed esercizi richiedono connessione per validazione e tracking progressi.' },
  { q: 'Posso ottenere un rimborso?', a: 'Sì, entro 14 giorni dall\'attivazione, secondo il diritto di recesso UE. Scrivi a billing@codemaster.app con il tuo numero ordine.' },
  { q: 'Aggiungerete altri linguaggi?', a: 'Sì! Stiamo lavorando per aggiungere R, Lua, Bash e altri framework specifici (React, Vue, Django, Spring) entro fine anno.' },
];

const FAQS_EN = [
  { q: 'Is CodeMaster Academy really free?', a: 'Yes, the Free plan gives you access to basic lessons of one language, unlimited quizzes and community. For advanced content, unlimited AI Tutor and all 17 languages, you need a Pro plan.' },
  { q: 'How does the AI Tutor work?', a: 'The AI Tutor is powered by OpenAI GPT-5.2 via our Emergent integration. It can explain concepts, debug your code and create personalized study paths. You can have the same concept explained 10 different ways if needed.' },
  { q: 'Are certificates recognized?', a: 'CodeMaster Academy certificates are course-completion certificates with a verifiable online QR code. They are useful for your portfolio and LinkedIn, but do not replace official vendor certifications (e.g. AWS, Microsoft).' },
  { q: 'Can I cancel anytime?', a: 'Yes. Go to Profile → Subscription → Manage and click Cancel. You will keep access until the end of the paid period. No penalties.' },
  { q: 'What does Lifetime include?', a: 'The Lifetime plan (€199 one-time) gives you lifetime access to currently available content and all new lessons we publish for existing languages. It does not include any future separate products.' },
  { q: 'Do you offer student discount?', a: 'Yes! Use coupon STUDENT50 at checkout for 50% off Pro Yearly. We reserve the right to ask for proof of enrollment (e.g. .edu email).' },
  { q: 'How does the affiliate program work?', a: 'When a friend signs up with your referral code and subscribes, you earn 10% commission. Minimum payout: €50. Payments via PayPal or bank transfer within 7 business days.' },
  { q: 'Is the app available for iPhone and Android?', a: 'We are finalizing the App Store and Google Play deployment. To test the beta now, download Expo Go and scan the QR code from the Download page.' },
  { q: 'Is my data safe?', a: 'Yes. Passwords bcrypt-hashed, payments handled by Stripe (we never store card data). EU servers. GDPR compliant. See Privacy Policy for details.' },
  { q: 'Can I use CodeMaster offline?', a: 'The mobile app will allow downloading lessons for offline use (coming in next release). Quizzes and exercises require connection for validation and progress tracking.' },
  { q: 'Can I get a refund?', a: 'Yes, within 14 days of activation per EU withdrawal rights. Email billing@codemaster.app with your order number.' },
  { q: 'Will you add more languages?', a: 'Yes! We are working on adding R, Lua, Bash and specific frameworks (React, Vue, Django, Spring) by end of year.' },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.item}>
      <Pressable onPress={() => setOpen(!open)} style={styles.qRow} testID={`faq-${q.slice(0, 20)}`}>
        <Text style={styles.q}>{q}</Text>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={colors.text.secondary} />
      </Pressable>
      {open && <Text style={styles.a}>{a}</Text>}
    </View>
  );
}

export default function FAQ() {
  const [lang, setLang] = useMarketingLang();
  const items = lang === 'it' ? FAQS_IT : FAQS_EN;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="faq-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'FAQ - CodeMaster Academy', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />
      <Section>
        <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%' }}>
          <H1>{mt('faq_title', lang)}</H1>
          <View style={{ marginTop: 12 }}><P large>{mt('support_subtitle', lang)}</P></View>
          <View style={{ marginTop: 32, gap: 8 }}>
            {items.map((it, i) => <Item key={i} q={it.q} a={it.a} />)}
          </View>
        </View>
      </Section>
      <WebFooter lang={lang} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: '#FFF' },
  qRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  q: { fontSize: 15, fontWeight: '700', color: colors.text.primary, flex: 1, marginRight: 12 },
  a: { fontSize: 14, color: colors.text.secondary, paddingHorizontal: 16, paddingBottom: 16, lineHeight: 22 },
});
