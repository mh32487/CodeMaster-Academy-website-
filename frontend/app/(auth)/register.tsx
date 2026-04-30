import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';
import { t } from '../../src/i18n';
import PasswordStrength from '../../src/PasswordStrength';
import { notify } from '../../src/notify';

function validateStrong(pwd: string, lang: 'it' | 'en' = 'it'): string | null {
  const IT = {
    len: 'La password deve contenere almeno 8 caratteri',
    upper: 'La password deve contenere almeno una maiuscola',
    digit: 'La password deve contenere almeno un numero',
    symbol: 'La password deve contenere almeno un simbolo',
  };
  const EN = {
    len: 'Password must be at least 8 characters',
    upper: 'Password must contain at least one uppercase letter',
    digit: 'Password must contain at least one number',
    symbol: 'Password must contain at least one symbol',
  };
  const M = lang === 'it' ? IT : EN;
  if (pwd.length < 8) return M.len;
  if (!/[A-Z]/.test(pwd)) return M.upper;
  if (!/[0-9]/.test(pwd)) return M.digit;
  if (!/[^A-Za-z0-9]/.test(pwd)) return M.symbol;
  return null;
}

export default function Register() {
  const router = useRouter();
  const { register, lang } = useAuth();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode] = useState(String(ref || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    // Field presence
    if (!name.trim() || !email.trim() || !password) {
      setError(lang === 'it' ? 'Compila tutti i campi obbligatori' : 'Please fill all required fields');
      return;
    }
    // Email basic validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(lang === 'it' ? 'Email non valida' : 'Invalid email');
      return;
    }
    // Strong password
    const pwdErr = validateStrong(password, lang as any);
    if (pwdErr) {
      setError(pwdErr);
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim(), refCode.trim() || undefined);
      // Success → go to home
      router.replace('/(tabs)/home');
    } catch (e: any) {
      console.error('[register] error', e);
      const detail = e?.response?.data?.detail;
      const status = e?.response?.status;
      let msg = '';
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail)) msg = detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      else if (e?.message) msg = e.message;
      else msg = lang === 'it' ? 'Errore sconosciuto. Riprova.' : 'Unknown error. Please retry.';

      if (!status && /Network Error|timeout/i.test(e?.message || '')) {
        msg = lang === 'it'
          ? '⚠️ Impossibile contattare il server. Verifica la connessione o riprova tra poco.'
          : '⚠️ Unable to reach server. Check your connection or try again shortly.';
      }

      setError(msg);
      notify(lang === 'it' ? 'Registrazione fallita' : 'Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="register-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back} testID="back-btn">
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>{t('register', lang)}</Text>
          <Text style={styles.subtitle}>{lang === 'it' ? 'Crea il tuo account in 30 secondi.' : 'Create your account in 30 seconds.'}</Text>

          <View style={styles.form}>
            <Text style={styles.label}>{t('name', lang)}</Text>
            <TextInput testID="register-name" style={styles.input} value={name} onChangeText={setName} placeholder="Mario Rossi" placeholderTextColor={colors.text.tertiary} />

            <Text style={[styles.label, { marginTop: 16 }]}>{t('email', lang)}</Text>
            <TextInput testID="register-email" style={styles.input} autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} placeholder="tu@email.com" placeholderTextColor={colors.text.tertiary} />

            <Text style={[styles.label, { marginTop: 16 }]}>{t('password', lang)}</Text>
            <TextInput
              testID="register-password"
              style={styles.input}
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
              placeholder={lang === 'it' ? 'Min 8 char, 1 MAIUSC, 1 numero, 1 simbolo' : 'Min 8 chars, 1 UPPER, 1 number, 1 symbol'}
              placeholderTextColor={colors.text.tertiary}
            />
            <PasswordStrength password={password} lang={lang as any} />

            <Text style={[styles.label, { marginTop: 16 }]}>{t('referral_code_optional', lang)}</Text>
            <TextInput testID="register-referral" style={styles.input} autoCapitalize="characters" value={refCode} onChangeText={setRefCode} placeholder="ABCD1234" placeholderTextColor={colors.text.tertiary} />
          </View>

          {!!error && (
            <View style={styles.errorBox} testID="register-error">
              <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PrimaryButton label={t('register', lang)} onPress={onSubmit} loading={loading} testID="register-submit" style={{ marginTop: 24 }} variant="purple" />

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('have_account', lang)} </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity testID="go-login">
                <Text style={styles.link}>{t('login', lang)}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  scroll: { padding: spacing.lg, flexGrow: 1 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: colors.text.primary, marginTop: 24 },
  subtitle: { fontSize: 16, color: colors.text.secondary, marginTop: 8 },
  form: { marginTop: 32 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFF', height: 52, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, paddingHorizontal: 16, fontSize: 16, color: colors.text.primary },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 12, borderRadius: radii.md, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { flex: 1, color: '#B91C1C', fontSize: 14, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.text.secondary },
  link: { color: colors.primary.purple, fontWeight: '700' },
});
