import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';
import { t } from '../../src/i18n';
import { notify } from '../../src/notify';

export default function Login() {
  const router = useRouter();
  const { login, lang } = useAuth();
  const [email, setEmail] = useState('demo@codemaster.app');
  const [password, setPassword] = useState('Demo123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError(lang === 'it' ? 'Compila email e password' : 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res?.requires_otp && res.challenge_id) {
        router.push(`/(auth)/verify-otp?challenge_id=${res.challenge_id}&hint=${encodeURIComponent(res.email_hint || email)}` as any);
        return;
      }
      router.replace('/(tabs)/home');
    } catch (e: any) {
      console.error('[login] error', e);
      let msg = '';
      const detail = e?.response?.data?.detail;
      const status = e?.response?.status;
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail)) msg = detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      else if (status === 429) msg = lang === 'it' ? 'Troppi tentativi. Riprova tra 15 minuti.' : 'Too many attempts. Try again in 15 minutes.';
      else if (status === 401) msg = lang === 'it' ? 'Email o password non corretti' : 'Invalid email or password';
      else if (e?.message && /Network Error|timeout/i.test(e.message)) msg = lang === 'it' ? '⚠️ Impossibile contattare il server.' : '⚠️ Unable to reach server.';
      else msg = e?.message || (lang === 'it' ? 'Errore sconosciuto' : 'Unknown error');
      setError(msg);
      notify(lang === 'it' ? 'Login fallito' : 'Login failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="login-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back} testID="back-btn">
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>{t('login', lang)}</Text>
          <Text style={styles.subtitle}>Bentornato! Continua a imparare.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>{t('email', lang)}</Text>
            <TextInput
              testID="login-email"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={[styles.label, { marginTop: 16 }]}>{t('password', lang)}</Text>
            <TextInput
              testID="login-password"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          {!!error && (
            <View style={styles.errorBox} testID="login-error">
              <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PrimaryButton label={t('login', lang)} onPress={onSubmit} loading={loading} testID="login-submit" style={{ marginTop: 24 }} />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'center', marginTop: 12 }} testID="forgot-password-link">
            <Text style={styles.link}>{lang === 'it' ? 'Password dimenticata?' : 'Forgot password?'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('no_account', lang)} </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity testID="go-register">
                <Text style={styles.link}>{t('register', lang)}</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Account demo</Text>
            <Text style={styles.demoText}>Studente: demo@codemaster.app / Demo123!</Text>
            <Text style={styles.demoText}>Admin: admin@codemaster.app / Admin123!</Text>
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
  input: {
    backgroundColor: '#FFF',
    height: 52, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border,
    paddingHorizontal: 16, fontSize: 16, color: colors.text.primary,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.text.secondary },
  link: { color: colors.primary.blue, fontWeight: '700' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 12, borderRadius: radii.md, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { flex: 1, color: '#B91C1C', fontSize: 14, fontWeight: '600' },
  demoBox: { marginTop: 32, padding: 16, backgroundColor: colors.primary.blue + '10', borderRadius: radii.md, borderWidth: 1, borderColor: colors.primary.blue + '30' },
  demoTitle: { fontWeight: '700', color: colors.primary.blueDark, marginBottom: 6 },
  demoText: { fontSize: 13, color: colors.text.secondary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});
