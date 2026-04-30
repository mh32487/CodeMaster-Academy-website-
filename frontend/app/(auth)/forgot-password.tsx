import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';
import api from '../../src/api';

export default function ForgotPassword() {
  const router = useRouter();
  const { lang } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!email.trim()) { setError(lang === 'it' ? 'Inserisci la tua email' : 'Enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase(), lang });
      setDone(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || (lang === 'it' ? 'Errore. Riprova.' : 'Error. Please retry.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="forgot-password-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back} testID="back-btn">
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="lock-reset" size={48} color={colors.primary.blue} />
          </View>

          <Text style={styles.title}>{lang === 'it' ? 'Password dimenticata?' : 'Forgot password?'}</Text>
          <Text style={styles.subtitle}>{lang === 'it' ? 'Inserisci la tua email. Ti invieremo un link per reimpostare la password (valido 1 ora).' : 'Enter your email. We will send you a reset link (valid 1 hour).'}</Text>

          {done ? (
            <View style={styles.successBox} testID="forgot-success">
              <MaterialCommunityIcons name="email-check" size={48} color="#22C55E" />
              <Text style={styles.successTitle}>{lang === 'it' ? 'Controlla la tua email!' : 'Check your email!'}</Text>
              <Text style={styles.successText}>{lang === 'it' ? 'Se l\'indirizzo è registrato, riceverai un link per reimpostare la password.' : 'If this email is registered, you will receive a reset link.'}</Text>
              <PrimaryButton label={lang === 'it' ? 'Torna al login' : 'Back to login'} onPress={() => router.replace('/(auth)/login')} testID="back-to-login" style={{ marginTop: 24 }} />
            </View>
          ) : (
            <>
              <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  testID="forgot-email"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
              {!!error && <Text style={styles.error}>{error}</Text>}
              <PrimaryButton label={lang === 'it' ? 'Invia link di reset' : 'Send reset link'} onPress={onSubmit} loading={loading} testID="forgot-submit" style={{ marginTop: 24 }} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  scroll: { padding: spacing.lg, flexGrow: 1 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  iconBox: { alignSelf: 'center', marginTop: 32, width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text.primary, marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.text.secondary, marginTop: 8, textAlign: 'center', lineHeight: 22 },
  form: { marginTop: 32 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFF', height: 52, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, paddingHorizontal: 16, fontSize: 16, color: colors.text.primary },
  error: { color: '#EF4444', marginTop: 8, fontSize: 13 },
  successBox: { marginTop: 32, padding: 24, alignItems: 'center', backgroundColor: '#22C55E15', borderRadius: radii.lg, borderWidth: 2, borderColor: '#22C55E40' },
  successTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginTop: 12 },
  successText: { color: colors.text.secondary, marginTop: 8, textAlign: 'center', lineHeight: 22 },
});
