/**
 * Marketing site i18n - IT + EN only.
 * Heavy strings (privacy/terms) kept here for centralization.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';

export type MktLang = 'it' | 'en';

export const MKT_LANGS: { code: MktLang; label: string; flag: string }[] = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

type Dict = Record<string, { it: string; en: string }>;

export const MKT: Dict = {
  // Brand
  brand: { it: 'CodeMaster Academy', en: 'CodeMaster Academy' },
  tagline: {
    it: "Impara a programmare. Ovunque. A qualunque livello.",
    en: 'Learn to code. Anywhere. At any level.',
  },

  // Header
  nav_features: { it: 'Funzionalità', en: 'Features' },
  nav_pricing: { it: 'Prezzi', en: 'Pricing' },
  nav_download: { it: 'Scarica', en: 'Download' },
  nav_support: { it: 'Supporto', en: 'Support' },
  nav_login: { it: 'Accedi', en: 'Log in' },
  nav_signup: { it: 'Inizia gratis', en: 'Get started' },

  // Hero
  hero_title: {
    it: 'Diventa sviluppatore con il tuo tutor AI personale',
    en: 'Become a developer with your personal AI tutor',
  },
  hero_subtitle: {
    it: '17 linguaggi di programmazione, 4 livelli (Base → Pro), AI Tutor GPT-5.2 24/7, certificati con QR code. Da zero al primo lavoro tech.',
    en: '17 programming languages, 4 levels (Beginner → Pro), GPT-5.2 AI Tutor 24/7, certificates with QR code. From zero to your first tech job.',
  },
  hero_cta_primary: { it: 'Inizia gratis', en: 'Start free' },
  hero_cta_secondary: { it: 'Scopri i piani', en: 'See pricing' },
  hero_trust: {
    it: '⭐⭐⭐⭐⭐ 4.8/5 da migliaia di studenti • Nessuna carta richiesta',
    en: '⭐⭐⭐⭐⭐ 4.8/5 from thousands of students • No card required',
  },

  // Features section
  features_title: { it: 'Tutto quello che ti serve per imparare', en: 'Everything you need to learn' },
  features_subtitle: {
    it: 'Una piattaforma completa, progettata per portarti dal tuo primo "Hello World" a un ruolo da sviluppatore reale.',
    en: 'A complete platform built to take you from "Hello World" to a real developer role.',
  },

  feat1_title: { it: 'AI Tutor GPT-5.2', en: 'GPT-5.2 AI Tutor' },
  feat1_desc: {
    it: 'Spiegazioni personalizzate, debug del tuo codice e domande infinite, 24 ore al giorno.',
    en: 'Personalized explanations, code debugging and unlimited questions, 24/7.',
  },

  feat2_title: { it: 'Lezioni interattive', en: 'Interactive lessons' },
  feat2_desc: {
    it: 'Spiegazioni concise, esempi reali e quiz dopo ogni lezione. Pensato per chi vuole capire davvero.',
    en: 'Concise explanations, real examples and quizzes after every lesson. Designed for true understanding.',
  },

  feat3_title: { it: 'Progetti pratici', en: 'Hands-on projects' },
  feat3_desc: {
    it: 'Costruisci un calcolator, un blog, un\'API REST: tutto ciò che ti serve per il portfolio.',
    en: 'Build a calculator, a blog, a REST API: everything you need for your portfolio.',
  },

  feat4_title: { it: 'Certificati condivisibili', en: 'Shareable certificates' },
  feat4_desc: {
    it: 'PDF con QR code verificabile. Aggiungili a LinkedIn e mostra le tue competenze.',
    en: 'PDF with verifiable QR code. Add them to LinkedIn and showcase your skills.',
  },

  feat5_title: { it: 'Gamification che motiva', en: 'Motivating gamification' },
  feat5_desc: {
    it: 'Streak giornalieri, missioni, sfide settimanali, badge e classifica per non mollare mai.',
    en: 'Daily streaks, missions, weekly challenges, badges and leaderboard to keep you going.',
  },

  feat6_title: { it: 'Multi-piattaforma', en: 'Multi-platform' },
  feat6_desc: {
    it: 'Studia da web, iPhone o Android. Il tuo progresso è sempre sincronizzato.',
    en: 'Study from web, iPhone or Android. Your progress is always synced.',
  },

  // Languages section
  langs_title: { it: '17 linguaggi, 4 livelli, infinite possibilità', en: '17 languages, 4 levels, endless possibilities' },
  langs_subtitle: {
    it: 'Da Python e JavaScript a Rust e Go: scegli il tuo percorso e inizia oggi.',
    en: 'From Python and JavaScript to Rust and Go: pick your path and start today.',
  },

  // Pricing section
  pricing_title: { it: 'Piani semplici, nessuna sorpresa', en: 'Simple pricing, no surprises' },
  pricing_subtitle: {
    it: 'Inizia gratis. Aggiorna a Pro quando sei pronto. Disdici quando vuoi.',
    en: 'Start free. Upgrade to Pro when you are ready. Cancel anytime.',
  },
  plan_free: { it: 'Free', en: 'Free' },
  plan_free_price: { it: '€0', en: '$0' },
  plan_free_features: {
    it: 'Lezioni base · Quiz illimitati · Community · 1 linguaggio',
    en: 'Beginner lessons · Unlimited quizzes · Community · 1 language',
  },
  plan_monthly: { it: 'Pro Mensile', en: 'Pro Monthly' },
  plan_monthly_price: { it: '€9.99/mese', en: '€9.99/mo' },
  plan_yearly: { it: 'Pro Annuale', en: 'Pro Yearly' },
  plan_yearly_price: { it: '€79.99/anno', en: '€79.99/yr' },
  plan_yearly_save: { it: 'Risparmia 33%', en: 'Save 33%' },
  plan_lifetime: { it: 'Lifetime', en: 'Lifetime' },
  plan_lifetime_price: { it: '€199 una tantum', en: '€199 one-time' },
  plan_pro_features: {
    it: 'Tutti i 17 linguaggi · AI Tutor illimitato · Tutti i progetti · Certificati PDF · Niente pubblicità',
    en: 'All 17 languages · Unlimited AI Tutor · All projects · PDF certificates · No ads',
  },
  cta_buy_now: { it: 'Acquista ora', en: 'Buy now' },
  cta_choose_plan: { it: 'Scegli piano', en: 'Choose plan' },
  pricing_legal: {
    it: 'Pagamenti sicuri Stripe. IVA inclusa. 14 giorni di garanzia rimborso.',
    en: 'Secure Stripe payments. VAT included. 14-day money-back guarantee.',
  },

  // Testimonials
  testimonials_title: { it: 'Cosa dicono i nostri studenti', en: 'What our students say' },

  // Download section
  download_title: { it: 'Scarica l\'app', en: 'Get the app' },
  download_subtitle: {
    it: 'Studia ovunque dal tuo smartphone. Il tuo progresso è sempre sincronizzato col web.',
    en: 'Study anywhere from your phone. Progress always synced with the web.',
  },
  download_appstore: { it: 'Scarica su App Store', en: 'Download on App Store' },
  download_playstore: { it: 'Scarica su Google Play', en: 'Get it on Google Play' },
  download_web: { it: 'Inizia subito sul web', en: 'Start now on the web' },
  download_coming: { it: 'In arrivo', en: 'Coming soon' },
  download_qr: { it: 'Scansiona con Expo Go per provare la beta', en: 'Scan with Expo Go to try the beta' },

  // CTA banner
  cta_title: { it: 'Pronto a iniziare la tua carriera tech?', en: 'Ready to start your tech career?' },
  cta_subtitle: {
    it: 'Iscriviti gratis oggi. Senza carta di credito.',
    en: 'Sign up free today. No credit card needed.',
  },
  cta_btn: { it: 'Crea account gratis', en: 'Create free account' },

  // Footer
  footer_product: { it: 'Prodotto', en: 'Product' },
  footer_company: { it: 'Azienda', en: 'Company' },
  footer_legal: { it: 'Legale', en: 'Legal' },
  footer_resources: { it: 'Risorse', en: 'Resources' },
  footer_about: { it: 'Chi siamo', en: 'About' },
  footer_blog: { it: 'Blog', en: 'Blog' },
  footer_careers: { it: 'Lavora con noi', en: 'Careers' },
  footer_privacy: { it: 'Privacy Policy', en: 'Privacy Policy' },
  footer_terms: { it: 'Termini di Servizio', en: 'Terms of Service' },
  footer_cookies: { it: 'Cookie Policy', en: 'Cookie Policy' },
  footer_support: { it: 'Supporto', en: 'Support' },
  footer_faq: { it: 'FAQ', en: 'FAQ' },
  footer_contact: { it: 'Contatti', en: 'Contact' },
  footer_status: { it: 'Stato sistemi', en: 'System status' },
  footer_rights: { it: 'Tutti i diritti riservati.', en: 'All rights reserved.' },

  // Support / FAQ page
  support_title: { it: 'Centro Supporto', en: 'Support Center' },
  support_subtitle: {
    it: 'Hai bisogno di aiuto? Trova le risposte alle domande più frequenti o contattaci.',
    en: 'Need help? Find answers to the most common questions or reach out to us.',
  },
  faq_title: { it: 'Domande frequenti', en: 'Frequently Asked Questions' },

  // Contact
  contact_title: { it: 'Contattaci', en: 'Contact us' },
  contact_subtitle: {
    it: 'Siamo qui per aiutarti. Rispondiamo entro 24 ore lavorative.',
    en: 'We are here to help. We reply within 24 business hours.',
  },
  contact_name: { it: 'Il tuo nome', en: 'Your name' },
  contact_email: { it: 'La tua email', en: 'Your email' },
  contact_subject: { it: 'Oggetto', en: 'Subject' },
  contact_message: { it: 'Messaggio', en: 'Message' },
  contact_send: { it: 'Invia messaggio', en: 'Send message' },
  contact_success: {
    it: '✅ Messaggio inviato! Ti risponderemo a breve.',
    en: '✅ Message sent! We will get back to you soon.',
  },
  contact_email_label: { it: 'Email', en: 'Email' },
  contact_response_time: { it: 'Tempo medio di risposta', en: 'Average response time' },
  contact_24h: { it: '< 24 ore lavorative', en: '< 24 business hours' },

  // Privacy
  privacy_title: { it: 'Privacy Policy', en: 'Privacy Policy' },
  privacy_updated: { it: 'Ultimo aggiornamento', en: 'Last updated' },

  // Terms
  terms_title: { it: 'Termini di Servizio', en: 'Terms of Service' },

  // Lang switcher
  lang_label: { it: 'Lingua', en: 'Language' },
};

export function mt(key: keyof typeof MKT | string, lang: MktLang = 'it'): string {
  const e = MKT[key];
  if (!e) return key;
  return e[lang] || e.it || key;
}

export function useMarketingLang(): [MktLang, (l: MktLang) => void] {
  const [lang, setLang] = useState<MktLang>('it');
  useEffect(() => {
    AsyncStorage.getItem('marketing_lang')
      .then((v) => { if (v === 'it' || v === 'en') setLang(v as MktLang); })
      .catch(() => {});
  }, []);
  const change = useCallback((l: MktLang) => {
    setLang(l);
    AsyncStorage.setItem('marketing_lang', l).catch(() => {});
  }, []);
  return [lang, change];
}
