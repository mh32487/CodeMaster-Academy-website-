import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { tokenStore } from './api';
import type { Lang } from './i18n';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  language: Lang;
  referral_code: string;
  subscription: { plan_id: string; active: boolean; expires_at: string | null };
  stats: {
    xp: number;
    streak_days: number;
    lessons_completed: number;
    quizzes_passed: number;
    projects_completed: number;
    last_activity: string;
  };
  badges: string[];
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  login: (email: string, password: string) => Promise<{ requires_otp?: boolean; challenge_id?: string; email_hint?: string }>;
  verifyOtp: (challenge_id: string, code: string) => Promise<void>;
  register: (email: string, password: string, name: string, refCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Lang>('it');

  const setLang = (l: Lang) => setLangState(l);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      if (data?.language) setLangState(data.language as Lang);
    } catch {
      setUser(null);
      await tokenStore.clear();
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await tokenStore.get();
      if (token) await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data?.requires_otp) {
      // Don't store token; caller will navigate to OTP screen
      return { requires_otp: true, challenge_id: data.challenge_id, email_hint: data.email_hint };
    }
    await tokenStore.set(data.token);
    setUser(data.user);
    if (data.user?.language) setLangState(data.user.language as Lang);
    import('./push').then(m => m.registerPushToken().catch(() => {}));
    return {};
  };

  const verifyOtp = async (challenge_id: string, code: string) => {
    const { data } = await api.post('/auth/verify-otp', { challenge_id, code });
    await tokenStore.set(data.token);
    setUser(data.user);
    if (data.user?.language) setLangState(data.user.language as Lang);
    import('./push').then(m => m.registerPushToken().catch(() => {}));
  };

  const register = async (email: string, password: string, name: string, refCode?: string) => {
    const { data } = await api.post('/auth/register', {
      email, password, name, language: lang,
      referral_code: refCode || undefined,
    });
    await tokenStore.set(data.token);
    setUser(data.user);
    import('./push').then(m => m.registerPushToken().catch(() => {}));
  };

  const logout = async () => {
    await tokenStore.clear();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, lang, setLang, login, verifyOtp, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
