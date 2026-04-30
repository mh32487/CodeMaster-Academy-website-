import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ENV_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Defensive: if deployed on Vercel/Netlify etc without EXPO_PUBLIC_BACKEND_URL,
// relative /api would POST to the static host (404). Fall back to current origin
// on web only as a LAST resort so the user sees a meaningful error instead of
// a silent fail, and log a clear warning.
let BASE_URL = ENV_BASE_URL;
if (!BASE_URL) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    BASE_URL = window.location.origin; // will likely 404 on Vercel → meaningful error
    // eslint-disable-next-line no-console
    console.warn(
      '[CodeMaster] ⚠️ EXPO_PUBLIC_BACKEND_URL is not set. Using current origin as fallback (likely wrong in production).',
      'Please set EXPO_PUBLIC_BACKEND_URL in your Vercel/Netlify environment variables and redeploy.',
    );
  }
}

const TOKEN_KEY = 'cm_token';

async function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null; }
    catch { return null; }
  }
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
}
async function storageSet(key: string, val: string) {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(key, val); }
    catch { /* noop */ }
    return;
  }
  try { await SecureStore.setItemAsync(key, val); } catch { /* noop */ }
}
async function storageDelete(key: string) {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); }
    catch { /* noop */ }
    return;
  }
  try { await SecureStore.deleteItemAsync(key); } catch { /* noop */ }
}

export const tokenStore = {
  get: () => storageGet(TOKEN_KEY),
  set: (v: string) => storageSet(TOKEN_KEY, v),
  clear: () => storageDelete(TOKEN_KEY),
};

const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.get();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
