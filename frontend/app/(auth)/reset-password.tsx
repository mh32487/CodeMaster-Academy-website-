import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';
import api from '../../src/api';
import PasswordStrength from '../../src/PasswordStrength';

export default function ResetPassword() {
  const router = useRouter();
  const { lang } = useAuth();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!token) { setError(lang === 'it' ? 'Token mancante' : 'Missing token'); return; }
    if (password !== confirm) { setError(lang === 'it' ? 'Le password non coincidono' : 'Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: String(token), new_password: password, lang });
      setDone(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || (lang === 'it' ? 'Errore' : 'Error'));
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.scroll, { alignItems: 'center', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.title}>Token mancante</Text>
          <PrimaryButton label="Torna al login" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="reset-password-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="lock-reset" size={48} color={colors.primary.purple} />
          </View>
          <Text style={styles.title}>{lang === 'it' ? 'Nuova password' : 'New password'}</Text>
          <Text style={styles.subtitle}>{lang === 'it' ? 'Scegli una password forte. Min 8 caratteri, 1 maiuscola, 1 numero, 1 simbolo.' : 'Choose a strong password. Min 8 chars, 1 uppercase, 1 number, 1 symbol.'}</Text>

          {done ? (
            <View style={styles.successBox} testID="reset-success">
              <MaterialCommunityIcons name="check-circle" size={48} color="#22C55E" />
              <Text style={styles.successTitle}>{lang === 'it' ? 'Password aggiornata!' : 'Password updated!'}</Text>
              <Text style={styles.successText}>{lang === 'it' ? 'Per sicurezza tutte le sessioni attive sono state revocate. Effettua di nuovo il login.' : 'For security all sessions have been revoked. Please log in again.'}</Text>
              <PrimaryButton label={lang === 'it' ? 'Vai al login' : 'Go to login'} onPress={() => router.replace('/(auth)/login')} testID="go-login" style={{ marginTop: 20 }} />
            </View>
          ) : (
            <>
              <View style={styles.form}>
                <Text style={styles.label}>{lang === 'it' ? 'Nuova password' : 'New password'}</Text>
                <TextInput testID="new-password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.text.tertiary} />
                <PasswordStrength password={password} />
                <Text style={[styles.label, { marginTop: 16 }]}>{lang === 'it' ? 'Conferma password' : 'Confirm password'}</Text>
                <TextInput testID="confirm-password" style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="••••••••" placeholderTextColor={colors.text.tertiary} />
              </View>
              {!!error && <Text style={styles.error}>{error}</Text>}
              <PrimaryButton label={lang === 'it' ? 'Aggiorna password' : 'Update password'} onPress={onSubmit} loading={loading} testID="reset-submit" style={{ marginTop: 24 }} />
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
  iconBox: { alignSelf: 'center', marginTop: 32, width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary.purple + '15', alignItems: 'center', justifyContent: 'center' },
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
