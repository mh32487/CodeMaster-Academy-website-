import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii } from '../../src/theme';
import { WebHeader, WebFooter, Section, useMarketingLang } from '../../src/marketing-components';
import api from '../../src/api';

export default function VerifyEmail() {
  const [lang, setLang] = useMarketingLang();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setError(lang === 'it' ? 'Token mancante' : 'Missing token'); return; }
    (async () => {
      try {
        await api.post('/auth/verify-email', { token: String(token) });
        setStatus('success');
      } catch (e: any) {
        setStatus('error');
        setError(e?.response?.data?.detail || 'Token non valido o scaduto');
      }
    })();
  }, [token, lang]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="verify-email-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'Verify Email - CodeMaster Academy', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />
      <Section>
        <View style={styles.box}>
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color={colors.primary.blue} />
              <Text style={styles.title}>{lang === 'it' ? 'Verifica in corso...' : 'Verifying...'}</Text>
            </>
          )}
          {status === 'success' && (
            <>
              <MaterialCommunityIcons name="email-check" size={64} color="#22C55E" />
              <Text style={styles.title}>{lang === 'it' ? 'Email verificata!' : 'Email verified!'}</Text>
              <Text style={styles.text}>{lang === 'it' ? 'Grazie per aver confermato la tua email. Ora puoi accedere a tutte le funzionalità di CodeMaster.' : 'Thanks for confirming your email. You can now access all CodeMaster features.'}</Text>
              <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.btn} testID="verify-email-cta">
                <Text style={styles.btnText}>{lang === 'it' ? 'Vai al login' : 'Go to login'}</Text>
              </Pressable>
            </>
          )}
          {status === 'error' && (
            <>
              <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
              <Text style={styles.title}>{lang === 'it' ? 'Verifica fallita' : 'Verification failed'}</Text>
              <Text style={styles.text}>{error}</Text>
              <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.btn}>
                <Text style={styles.btnText}>{lang === 'it' ? 'Torna al login' : 'Back to login'}</Text>
              </Pressable>
            </>
          )}
        </View>
      </Section>
      <WebFooter lang={lang} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: { maxWidth: 600, alignSelf: 'center', width: '100%', alignItems: 'center', padding: 32, backgroundColor: '#F8FAFC', borderRadius: radii.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginTop: 16, textAlign: 'center' },
  text: { fontSize: 15, color: colors.text.secondary, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  btn: { backgroundColor: colors.primary.blue, paddingHorizontal: 24, paddingVertical: 14, borderRadius: radii.pill, marginTop: 24 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
