/**
 * Simple i18n strings for UI labels.
 * Content (lessons, quizzes) is localized server-side.
 */
export type Lang = 'it' | 'en' | 'es' | 'fr' | 'de' | 'pt';

export const SUPPORTED_LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'it', label: 'Italiano', flag: 'IT' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'pt', label: 'Português', flag: 'PT' },
];

const STRINGS: Record<string, Record<Lang, string>> = {
  app_name: { it: 'CodeMaster Academy', en: 'CodeMaster Academy', es: 'CodeMaster Academy', fr: 'CodeMaster Academy', de: 'CodeMaster Academy', pt: 'CodeMaster Academy' },
  start_now: { it: 'Inizia ora', en: 'Get started', es: 'Empieza ya', fr: 'Commencer', de: 'Loslegen', pt: 'Começar agora' },
  hero_subtitle: { it: 'Impara a programmare da zero. 17 linguaggi, 4 livelli.', en: 'Learn to code from scratch. 17 languages, 4 levels.', es: 'Aprende a programar desde cero. 17 lenguajes.', fr: 'Apprenez à coder de zéro. 17 langages.', de: 'Lerne Programmieren. 17 Sprachen.', pt: 'Aprenda a programar do zero. 17 linguagens.' },
  login: { it: 'Accedi', en: 'Login', es: 'Acceder', fr: 'Connexion', de: 'Anmelden', pt: 'Entrar' },
  register: { it: 'Registrati', en: 'Register', es: 'Registrarse', fr: 'S\'inscrire', de: 'Registrieren', pt: 'Cadastrar' },
  email: { it: 'Email', en: 'Email', es: 'Email', fr: 'Email', de: 'E-Mail', pt: 'Email' },
  password: { it: 'Password', en: 'Password', es: 'Contraseña', fr: 'Mot de passe', de: 'Passwort', pt: 'Senha' },
  name: { it: 'Nome', en: 'Name', es: 'Nombre', fr: 'Nom', de: 'Name', pt: 'Nome' },
  referral_code_optional: { it: 'Codice referral (opzionale)', en: 'Referral code (optional)', es: 'Código referido (opcional)', fr: 'Code parrainage (facultatif)', de: 'Empfehlungscode (optional)', pt: 'Código indicação (opcional)' },
  no_account: { it: 'Non hai un account?', en: "Don't have an account?", es: '¿No tienes cuenta?', fr: "Pas de compte?", de: 'Kein Konto?', pt: 'Não tem conta?' },
  have_account: { it: 'Hai già un account?', en: 'Already have account?', es: '¿Ya tienes cuenta?', fr: 'Déjà un compte?', de: 'Schon ein Konto?', pt: 'Já tem conta?' },
  home: { it: 'Home', en: 'Home', es: 'Inicio', fr: 'Accueil', de: 'Start', pt: 'Início' },
  languages: { it: 'Linguaggi', en: 'Languages', es: 'Lenguajes', fr: 'Langages', de: 'Sprachen', pt: 'Linguagens' },
  paths: { it: 'Percorsi', en: 'Paths', es: 'Rutas', fr: 'Parcours', de: 'Pfade', pt: 'Trilhas' },
  tutor: { it: 'Tutor AI', en: 'AI Tutor', es: 'Tutor IA', fr: 'Tutor IA', de: 'KI-Tutor', pt: 'Tutor IA' },
  profile: { it: 'Profilo', en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil', pt: 'Perfil' },
  welcome_back: { it: 'Bentornato', en: 'Welcome back', es: 'Bienvenido', fr: 'Bon retour', de: 'Willkommen zurück', pt: 'Bem-vindo' },
  total_progress: { it: 'Progresso totale', en: 'Total progress', es: 'Progreso total', fr: 'Progrès total', de: 'Gesamtfortschritt', pt: 'Progresso total' },
  lessons_completed: { it: 'Lezioni completate', en: 'Lessons completed', es: 'Lecciones', fr: 'Leçons', de: 'Lektionen', pt: 'Lições' },
  badges: { it: 'Badge', en: 'Badges', es: 'Insignias', fr: 'Badges', de: 'Abzeichen', pt: 'Selos' },
  recommended: { it: 'Consigliati', en: 'Recommended', es: 'Recomendados', fr: 'Recommandés', de: 'Empfohlen', pt: 'Recomendados' },
  streak: { it: 'Streak', en: 'Streak', es: 'Racha', fr: 'Série', de: 'Streak', pt: 'Sequência' },
  xp: { it: 'XP', en: 'XP', es: 'XP', fr: 'XP', de: 'XP', pt: 'XP' },
  levels: { it: 'Livelli', en: 'Levels', es: 'Niveles', fr: 'Niveaux', de: 'Level', pt: 'Níveis' },
  base: { it: 'Base', en: 'Beginner', es: 'Básico', fr: 'Débutant', de: 'Grundlagen', pt: 'Básico' },
  intermediate: { it: 'Intermedio', en: 'Intermediate', es: 'Intermedio', fr: 'Intermédiaire', de: 'Fortgeschritten', pt: 'Intermediário' },
  advanced: { it: 'Avanzato', en: 'Advanced', es: 'Avanzado', fr: 'Avancé', de: 'Profi', pt: 'Avançado' },
  pro: { it: 'Pro', en: 'Pro', es: 'Pro', fr: 'Pro', de: 'Pro', pt: 'Pro' },
  complete_lesson: { it: 'Completa lezione', en: 'Complete lesson', es: 'Completar', fr: 'Terminer', de: 'Lektion abschließen', pt: 'Concluir' },
  start_quiz: { it: 'Inizia quiz', en: 'Start quiz', es: 'Comenzar quiz', fr: 'Démarrer quiz', de: 'Quiz starten', pt: 'Iniciar quiz' },
  next: { it: 'Avanti', en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', pt: 'Próximo' },
  submit: { it: 'Invia', en: 'Submit', es: 'Enviar', fr: 'Envoyer', de: 'Senden', pt: 'Enviar' },
  retry: { it: 'Riprova', en: 'Retry', es: 'Reintentar', fr: 'Réessayer', de: 'Wiederholen', pt: 'Tentar de novo' },
  premium_locked: { it: 'Contenuto Premium - Aggiorna a Pro', en: 'Premium content - Upgrade to Pro', es: 'Premium - Actualiza a Pro', fr: 'Premium - Passez à Pro', de: 'Premium - Auf Pro upgraden', pt: 'Premium - Vá para Pro' },
  pricing: { it: 'Piani', en: 'Pricing', es: 'Planes', fr: 'Tarifs', de: 'Preise', pt: 'Planos' },
  leaderboard: { it: 'Classifica', en: 'Leaderboard', es: 'Clasificación', fr: 'Classement', de: 'Rangliste', pt: 'Ranking' },
  certificates: { it: 'Certificati', en: 'Certificates', es: 'Certificados', fr: 'Certificats', de: 'Zertifikate', pt: 'Certificados' },
  settings: { it: 'Impostazioni', en: 'Settings', es: 'Ajustes', fr: 'Réglages', de: 'Einstellungen', pt: 'Configurações' },
  logout: { it: 'Esci', en: 'Logout', es: 'Salir', fr: 'Déconnexion', de: 'Abmelden', pt: 'Sair' },
  ask_tutor: { it: 'Chiedi al tutor...', en: 'Ask the tutor...', es: 'Pregunta al tutor...', fr: 'Demande au tutor...', de: 'Frag den Tutor...', pt: 'Pergunte ao tutor...' },
  send: { it: 'Invia', en: 'Send', es: 'Enviar', fr: 'Envoyer', de: 'Senden', pt: 'Enviar' },
  refer_friends: { it: 'Invita amici', en: 'Refer friends', es: 'Invitar amigos', fr: 'Inviter des amis', de: 'Freunde einladen', pt: 'Convidar amigos' },
  admin_panel: { it: 'Pannello Admin', en: 'Admin Panel', es: 'Panel Admin', fr: 'Panel Admin', de: 'Admin-Panel', pt: 'Painel Admin' },
  projects: { it: 'Progetti pratici', en: 'Practical projects', es: 'Proyectos', fr: 'Projets', de: 'Projekte', pt: 'Projetos' },
  quiz_score: { it: 'Punteggio', en: 'Score', es: 'Puntaje', fr: 'Score', de: 'Punktzahl', pt: 'Pontuação' },
  passed: { it: 'Superato!', en: 'Passed!', es: '¡Aprobado!', fr: 'Réussi!', de: 'Bestanden!', pt: 'Aprovado!' },
  failed: { it: 'Non superato', en: 'Not passed', es: 'No aprobado', fr: 'Non réussi', de: 'Nicht bestanden', pt: 'Não aprovado' },
  exercise: { it: 'Esercizio', en: 'Exercise', es: 'Ejercicio', fr: 'Exercice', de: 'Übung', pt: 'Exercício' },
  view_solution: { it: 'Vedi soluzione', en: 'View solution', es: 'Ver solución', fr: 'Voir solution', de: 'Lösung anzeigen', pt: 'Ver solução' },
  upgrade_now: { it: 'Aggiorna ora', en: 'Upgrade now', es: 'Actualiza ya', fr: 'Mettre à niveau', de: 'Jetzt upgraden', pt: 'Fazer upgrade' },
  current_plan: { it: 'Piano attuale', en: 'Current plan', es: 'Plan actual', fr: 'Plan actuel', de: 'Aktueller Plan', pt: 'Plano atual' },
  free_plan: { it: 'Free', en: 'Free', es: 'Free', fr: 'Free', de: 'Free', pt: 'Free' },
  most_popular: { it: 'Più popolare', en: 'Most popular', es: 'Más popular', fr: 'Plus populaire', de: 'Am beliebtesten', pt: 'Mais popular' },
  per_month: { it: '/mese', en: '/mo', es: '/mes', fr: '/mois', de: '/Monat', pt: '/mês' },
  per_year: { it: '/anno', en: '/yr', es: '/año', fr: '/an', de: '/Jahr', pt: '/ano' },
  one_time: { it: 'una tantum', en: 'one-time', es: 'único pago', fr: 'paiement unique', de: 'einmalig', pt: 'pagamento único' },
};

export function t(key: keyof typeof STRINGS | string, lang: Lang = 'it'): string {
  const entry = STRINGS[key as string];
  if (!entry) return key as string;
  return entry[lang] || entry.it || (key as string);
}

export function localized(field: any, lang: Lang = 'it'): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.it || field.en || Object.values(field)[0] || '';
}
