import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';

export default function PaymentSuccess() {
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const router = useRouter();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<'polling' | 'paid' | 'failed'>('polling');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!session_id) { setStatus('failed'); return; }
    let cancelled = false;

    const poll = async (n: number) => {
      if (cancelled) return;
      if (n >= 8) { setStatus('failed'); return; }
      try {
        const { data } = await api.get(`/billing/stripe/status/${session_id}`);
        if (data.payment_status === 'paid') {
          await refresh();
          setStatus('paid');
          return;
        }
        if (data.status === 'expired') { setStatus('failed'); return; }
      } catch (e) { /* keep polling */ }
      setAttempts(n + 1);
      setTimeout(() => poll(n + 1), 2500);
    };
    poll(0);
    return () => { cancelled = true; };
  }, [session_id, refresh]);

  return (
    <View style={styles.container} testID="payment-success-screen">
      <Stack.Screen options={{ title: 'Pagamento' }} />
      {status === 'polling' && (
        <>
          <ActivityIndicator size="large" color={colors.primary.blue} />
          <Text style={styles.title}>Stiamo verificando il pagamento...</Text>
          <Text style={styles.sub}>Tentativo {attempts + 1}/8</Text>
        </>
      )}
      {status === 'paid' && (
        <>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="check-circle" size={80} color={colors.status.success} />
          </View>
          <Text style={styles.title}>🎉 Pagamento riuscito!</Text>
          <Text style={styles.sub}>Il tuo abbonamento Pro è attivo. Inizia a esplorare tutti i contenuti.</Text>
          <PrimaryButton label="Vai alla home" onPress={() => router.replace('/(tabs)/home')} testID="success-home-btn" style={{ marginTop: 24 }} />
        </>
      )}
      {status === 'failed' && (
        <>
          <View style={[styles.iconBox, { backgroundColor: colors.status.error + '15' }]}>
            <MaterialCommunityIcons name="alert-circle" size={80} color={colors.status.error} />
          </View>
          <Text style={styles.title}>Pagamento non confermato</Text>
          <Text style={styles.sub}>Se l'addebito è avvenuto, riceverai conferma via email entro pochi minuti.</Text>
          <PrimaryButton label="Riprova" variant="ghost" onPress={() => router.replace('/pricing')} testID="failed-retry-btn" style={{ marginTop: 24 }} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg.main },
  iconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.status.success + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginTop: 16, textAlign: 'center' },
  sub: { fontSize: 15, color: colors.text.secondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 16 },
});
