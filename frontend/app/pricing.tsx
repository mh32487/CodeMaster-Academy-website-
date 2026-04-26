import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { t, Lang } from '../src/i18n';

export default function Pricing() {
  const router = useRouter();
  const { lang, user, refresh } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/plans'); setPlans(data); }
      finally { setLoading(false); }
    })();
  }, []);

  const onChoose = async (planId: string) => {
    if (planId === 'free') { Alert.alert('Free', 'Sei già sul piano Free.'); return; }
    Alert.alert(
      'Conferma acquisto',
      `Stai per acquistare il piano ${planId}. Questa è una versione DEMO senza pagamento reale.`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Conferma', onPress: async () => {
          setPurchasing(planId);
          try {
            await api.post('/billing/checkout', { plan_id: planId });
            await refresh();
            Alert.alert('🎉 Successo!', 'Piano attivato con successo (demo).', [{ text: 'OK', onPress: () => router.back() }]);
          } catch (e: any) {
            Alert.alert('Errore', e?.response?.data?.detail || 'Riprova');
          } finally { setPurchasing(null); }
        } }
      ]
    );
  };

  const getPrice = (p: any) => {
    if (p.id === 'free') return 'Gratis';
    if (p.id === 'pro_monthly') return `€${p.price_monthly}${t('per_month', lang)}`;
    if (p.id === 'pro_yearly') return `€${p.price_yearly}${t('per_year', lang)}`;
    if (p.id === 'lifetime') return `€${p.price_lifetime} ${t('one_time', lang)}`;
    return '';
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="pricing-screen">
      <Stack.Screen options={{ title: t('pricing', lang) }} />
      <Text style={styles.title}>Sblocca il tuo potenziale</Text>
      <Text style={styles.sub}>Scegli il piano che fa per te. Annulla quando vuoi.</Text>

      <View style={{ gap: 14, marginTop: 16 }}>
        {plans.map((p) => {
          const isCurrent = user?.subscription?.plan_id === p.id;
          return (
            <View
              key={p.id}
              testID={`plan-${p.id}`}
              style={[
                styles.planCard,
                p.highlight && { borderColor: colors.primary.purple, borderWidth: 3 },
              ]}
            >
              {p.highlight && (
                <View style={styles.popularPill}>
                  <Text style={styles.popularText}>{t('most_popular', lang)}</Text>
                </View>
              )}
              <Text style={styles.planName}>{p.name?.[lang] || p.name?.it || p.id}</Text>
              <Text style={styles.planPrice}>{getPrice(p)}</Text>

              <View style={{ marginTop: 12, gap: 8 }}>
                {(p.features?.[lang] || p.features?.it || []).map((f: string, i: number) => (
                  <View key={i} style={styles.featureRow}>
                    <MaterialCommunityIcons name="check-circle" size={18} color={colors.status.success} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                testID={`choose-${p.id}`}
                onPress={() => onChoose(p.id)}
                activeOpacity={0.85}
                disabled={isCurrent || purchasing === p.id}
                style={[
                  styles.choose,
                  { backgroundColor: p.highlight ? colors.primary.purple : colors.primary.blue },
                  isCurrent && { backgroundColor: colors.text.tertiary },
                ]}
              >
                {purchasing === p.id ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.chooseText}>{isCurrent ? t('current_plan', lang) : (p.id === 'free' ? 'Continua' : 'Scegli piano')}</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <Text style={styles.disclaimer}>
        💡 Demo: i pagamenti non sono attivi. L'architettura è pronta per Stripe e per gli acquisti in-app di Google Play e App Store.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  sub: { color: colors.text.secondary, marginTop: 6 },
  planCard: { backgroundColor: '#FFF', borderRadius: radii.lg, padding: 18, borderWidth: 2, borderColor: colors.border, position: 'relative' },
  popularPill: { position: 'absolute', top: -12, right: 16, backgroundColor: colors.primary.purple, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill },
  popularText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  planName: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  planPrice: { fontSize: 28, fontWeight: '900', color: colors.primary.blue, marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { flex: 1, fontSize: 14, color: colors.text.primary },
  choose: { marginTop: 16, paddingVertical: 14, borderRadius: radii.md, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#00000020' },
  chooseText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  disclaimer: { marginTop: 24, color: colors.text.secondary, fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
});
