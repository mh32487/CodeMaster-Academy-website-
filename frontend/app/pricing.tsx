import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Linking, Platform } from 'react-native';
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
  const [coupon, setCoupon] = useState('');
  const [couponInfo, setCouponInfo] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/plans'); setPlans(data); }
      finally { setLoading(false); }
    })();
  }, []);

  const checkCoupon = async () => {
    if (!coupon.trim()) return;
    setCheckingCoupon(true);
    try {
      const { data } = await api.get(`/billing/coupons/check?code=${encodeURIComponent(coupon.trim())}`);
      setCouponInfo(data);
    } catch (e: any) {
      setCouponInfo(null);
      Alert.alert('Coupon non valido', e?.response?.data?.detail || 'Riprova');
    } finally { setCheckingCoupon(false); }
  };

  const onChoose = async (planId: string) => {
    if (planId === 'free') return;
    setPurchasing(planId);
    try {
      const origin = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : (process.env.EXPO_PUBLIC_BACKEND_URL || '');
      const { data } = await api.post('/billing/stripe/checkout', {
        plan_id: planId,
        origin_url: origin,
        coupon_code: couponInfo?.code,
      });
      // Redirect to Stripe
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = data.url;
      } else {
        await Linking.openURL(data.url);
        Alert.alert('Apertura Stripe', 'Completa il pagamento nel browser. Tornerai automaticamente all\'app.');
      }
    } catch (e: any) {
      Alert.alert('Errore checkout', e?.response?.data?.detail || 'Riprova');
    } finally {
      setPurchasing(null);
    }
  };

  const getPrice = (p: any) => {
    if (p.id === 'free') return 'Gratis';
    let amt = 0;
    let suffix = '';
    if (p.id === 'pro_monthly') { amt = p.price_monthly; suffix = t('per_month', lang); }
    else if (p.id === 'pro_yearly') { amt = p.price_yearly; suffix = t('per_year', lang); }
    else if (p.id === 'lifetime') { amt = p.price_lifetime; suffix = ` ${t('one_time', lang)}`; }
    if (couponInfo) amt = Math.round(amt * (1 - couponInfo.discount_percent / 100) * 100) / 100;
    return `€${amt}${suffix}`;
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="pricing-screen">
      <Stack.Screen options={{ title: t('pricing', lang) }} />
      <Text style={styles.title}>Sblocca il tuo potenziale</Text>
      <Text style={styles.sub}>Scegli il piano che fa per te. Pagamenti sicuri Stripe.</Text>

      {/* Coupon input */}
      <View style={styles.couponBox}>
        <Text style={styles.label}>Codice sconto</Text>
        <View style={styles.couponRow}>
          <TextInput
            testID="coupon-input"
            value={coupon}
            onChangeText={(v) => { setCoupon(v.toUpperCase()); setCouponInfo(null); }}
            placeholder="Es. WELCOME20"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="characters"
            style={styles.couponInput}
          />
          <TouchableOpacity testID="check-coupon" style={styles.couponBtn} onPress={checkCoupon} disabled={!coupon.trim() || checkingCoupon}>
            {checkingCoupon ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.couponBtnText}>Applica</Text>}
          </TouchableOpacity>
        </View>
        {couponInfo && (
          <View style={styles.couponSuccess}>
            <MaterialCommunityIcons name="check-circle" size={18} color={colors.status.success} />
            <Text style={styles.couponSuccessText}>{couponInfo.code} — {couponInfo.discount_percent}% di sconto applicato</Text>
          </View>
        )}
      </View>

      <View style={{ gap: 14, marginTop: 16 }}>
        {plans.map((p) => {
          const isCurrent = user?.subscription?.plan_id === p.id;
          return (
            <View key={p.id} testID={`plan-${p.id}`} style={[styles.planCard, p.highlight && { borderColor: colors.primary.purple, borderWidth: 3 }]}>
              {p.highlight && (
                <View style={styles.popularPill}>
                  <Text style={styles.popularText}>{t('most_popular', lang)}</Text>
                </View>
              )}
              <Text style={styles.planName}>{p.name?.[lang as Lang] || p.name?.it || p.id}</Text>
              <Text style={styles.planPrice}>{getPrice(p)}</Text>

              <View style={{ marginTop: 12, gap: 8 }}>
                {(p.features?.[lang as Lang] || p.features?.it || []).map((f: string, i: number) => (
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
                disabled={isCurrent || purchasing === p.id || p.id === 'free'}
                style={[styles.choose, { backgroundColor: p.highlight ? colors.primary.purple : colors.primary.blue }, (isCurrent || p.id === 'free') && { backgroundColor: colors.text.tertiary }]}
              >
                {purchasing === p.id ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.chooseText}>
                    {isCurrent ? t('current_plan', lang) : (p.id === 'free' ? 'Continua gratis' : `Paga con Stripe`)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.legalRow}>
        <TouchableOpacity onPress={() => router.push('/legal/terms')} testID="link-terms">
          <Text style={styles.legalLink}>Termini di servizio</Text>
        </TouchableOpacity>
        <Text style={styles.legalDot}>·</Text>
        <TouchableOpacity onPress={() => router.push('/legal/privacy')} testID="link-privacy">
          <Text style={styles.legalLink}>Privacy</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        🔒 Pagamenti sicuri tramite Stripe (Test Mode in questa preview). Carta di test: 4242 4242 4242 4242 — qualsiasi data futura, qualsiasi CVC.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  sub: { color: colors.text.secondary, marginTop: 6 },
  couponBox: { marginTop: 16, backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  label: { fontSize: 11, fontWeight: '800', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 12, fontSize: 14, fontWeight: '700', color: colors.primary.blue, letterSpacing: 1 },
  couponBtn: { backgroundColor: colors.primary.blue, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  couponBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  couponSuccess: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 8, backgroundColor: colors.status.success + '15', borderRadius: radii.sm },
  couponSuccessText: { color: colors.status.success, fontSize: 12, fontWeight: '700', flex: 1 },
  planCard: { backgroundColor: '#FFF', borderRadius: radii.lg, padding: 18, borderWidth: 2, borderColor: colors.border, position: 'relative' },
  popularPill: { position: 'absolute', top: -12, right: 16, backgroundColor: colors.primary.purple, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill },
  popularText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  planName: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  planPrice: { fontSize: 28, fontWeight: '900', color: colors.primary.blue, marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { flex: 1, fontSize: 14, color: colors.text.primary },
  choose: { marginTop: 16, paddingVertical: 14, borderRadius: radii.md, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#00000020' },
  chooseText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  legalLink: { color: colors.primary.blue, fontSize: 13, fontWeight: '700' },
  legalDot: { color: colors.text.tertiary },
  disclaimer: { marginTop: 12, color: colors.text.secondary, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
