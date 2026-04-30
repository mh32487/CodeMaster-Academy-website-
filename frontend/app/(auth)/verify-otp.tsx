import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';

export default function VerifyOtp() {
  const router = useRouter();
  const { verifyOtp, lang } = useAuth();
  const { challenge_id, hint } = useLocalSearchParams<{ challenge_id: string; hint?: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const setDigit = (idx: number, v: string) => {
    const cleaned = v.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...code]; next[idx] = ''; setCode(next); return;
    }
    // If user pasted multiple digits
    if (cleaned.length > 1) {
      const arr = cleaned.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      arr.forEach((d, i) => { next[i] = d; });
      setCode(next);
      const focusIdx = Math.min(arr.length, 5);
      inputs.current[focusIdx]?.focus();
      if (arr.length === 6) onSubmit(next.join(''));
      return;
    }
    const next = [...code]; next[idx] = cleaned[0]; setCode(next);
    if (idx < 5) inputs.current[idx + 1]?.focus();
    if (idx === 5) onSubmit(next.join(''));
  };

  const onSubmit = async (codeStr?: string) => {
    const c = codeStr || code.join('');
    if (c.length !== 6) { setError(lang === 'it' ? 'Inserisci il codice di 6 cifre' : 'Enter the 6-digit code'); return; }
    if (!challenge_id) { setError('Missing challenge'); return; }
    setError(''); setLoading(true);
    try {
      await verifyOtp(String(challenge_id), c);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      setError(e?.response?.data?.detail || (lang === 'it' ? 'Codice non valido' : 'Invalid code'));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="verify-otp-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back} testID="back-btn">
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="shield-key" size={48} color={colors.primary.purple} />
          </View>

          <Text style={styles.title}>{lang === 'it' ? 'Verifica in due passaggi' : 'Two-step verification'}</Text>
          <Text style={styles.subtitle}>{lang === 'it' ? 'Per sicurezza, abbiamo inviato un codice a 6 cifre a' : 'For security, we sent a 6-digit code to'}</Text>
          <Text style={styles.email}>{hint || ''}</Text>

          <View style={styles.codeRow}>
            {code.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => { inputs.current[i] = r; }}
                value={d}
                onChangeText={(v) => setDigit(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !d && i > 0) inputs.current[i - 1]?.focus();
                }}
                style={[styles.codeInput, d && styles.codeInputFilled]}
                keyboardType="number-pad"
                maxLength={i === 0 ? 6 : 1}
                testID={`otp-digit-${i}`}
                autoFocus={i === 0}
              />
            ))}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton label={lang === 'it' ? 'Verifica' : 'Verify'} onPress={() => onSubmit()} loading={loading} testID="otp-submit" style={{ marginTop: 24 }} />

          <Text style={styles.help}>{lang === 'it' ? 'Non hai ricevuto il codice? Controlla nella spam o riprova il login.' : 'Did not receive the code? Check spam or retry login.'}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  scroll: { padding: spacing.lg, flexGrow: 1 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  iconBox: { alignSelf: 'center', marginTop: 32, width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary.purple + '15', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginTop: 8, textAlign: 'center' },
  email: { fontSize: 14, color: colors.primary.blue, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 32 },
  codeInput: { width: 44, height: 56, borderWidth: 2, borderColor: colors.border, borderRadius: radii.md, backgroundColor: '#FFF', textAlign: 'center', fontSize: 24, fontWeight: '800', color: colors.text.primary },
  codeInputFilled: { borderColor: colors.primary.purple, backgroundColor: colors.primary.purple + '10' },
  error: { color: '#EF4444', textAlign: 'center', marginTop: 16, fontSize: 13 },
  help: { fontSize: 12, color: colors.text.tertiary, textAlign: 'center', marginTop: 24 },
});
