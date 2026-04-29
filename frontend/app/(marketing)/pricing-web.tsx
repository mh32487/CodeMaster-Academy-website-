import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, Linking, Platform, Pressable, useWindowDimensions } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, P, useMarketingLang, useResponsive } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';

export default function PricingWeb() {
  const router = useRouter();
  const { user } = useAuth();
  const { plan: planParam } = useLocalSearchParams<{ plan?: string }>();
  const [lang, setLang] = useMarketingLang();
  const { isMobile } = useResponsive();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const [couponInfo, setCouponInfo] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/plans'); setPlans(data); }
      finally { setLoading(false); }
    })();
  }, []);

  // If a plan was passed via ?plan=... and user is logged in, auto-trigger
  useEffect(() => {
    if (planParam && user && plans.length > 0 && !purchasing) {
      // intentional: just visually highlight, don't auto-redirect to avoid surprise
    }
  }, [planParam, user, plans]);

  const checkCoupon = async () => {
    if (!coupon.trim()) return;
    setCheckingCoupon(true);
    setCouponError('');
    try {
      const { data } = await api.get(`/billing/coupons/check?code=${encodeURIComponent(coupon.trim())}`);
      setCouponInfo(data);
    } catch (e: any) {
      setCouponInfo(null);
      setCouponError(e?.response?.data?.detail || (lang === 'it' ? 'Coupon non valido' : 'Invalid coupon'));
    } finally { setCheckingCoupon(false); }
  };

  const onChoose = async (planId: string) => {
    if (planId === 'free') {
      router.push('/(auth)/register');
      return;
    }
    if (!user) {
      // Not logged in: route to register, then return to pricing with plan
      router.push(`/(auth)/register?next=${encodeURIComponent('/(marketing)/pricing-web?plan=' + planId)}` as any);
      return;
    }
    setPurchasing(planId);
    try {
      const origin = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : (process.env.EXPO_PUBLIC_BACKEND_URL || '');
      const { data } = await api.post('/billing/stripe/checkout', { plan_id: planId, origin_url: origin, coupon_code: couponInfo?.code });
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = data.url;
      } else {
        await Linking.openURL(data.url);
      }
    } catch (e: any) {
      Alert.alert(lang === 'it' ? 'Errore checkout' : 'Checkout error', e?.response?.data?.detail || (lang === 'it' ? 'Riprova' : 'Please retry'));
    } finally {
      setPurchasing(null);
    }
  };

  const getPrice = (p: any) => {
    if (p.id === 'free') return mt('plan_free_price', lang);
    let amt = 0; let suffix = '';
    if (p.id === 'pro_monthly') { amt = p.price_monthly; suffix = lang === 'it' ? '/mese' : '/mo'; }
    else if (p.id === 'pro_yearly') { amt = p.price_yearly; suffix = lang === 'it' ? '/anno' : '/yr'; }
    else if (p.id === 'lifetime') { amt = p.price_lifetime; suffix = lang === 'it' ? ' una tantum' : ' one-time'; }
    if (couponInfo) amt = Math.round(amt * (1 - couponInfo.discount_percent / 100) * 100) / 100;
    return `€${amt}${suffix}`;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="pricing-web-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'Pricing - CodeMaster Academy', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />
      <Section>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <H1>{mt('pricing_title', lang)}</H1>
          <View style={{ marginTop: 12, maxWidth: 700 }}><P center large>{mt('pricing_subtitle', lang)}</P></View>
        </View>

        {/* Coupon */}
        <View style={[styles.couponBox, isMobile && { width: '100%' }]}>
          <Text style={styles.couponLabel}>{lang === 'it' ? 'Hai un codice sconto?' : 'Have a discount code?'}</Text>
          <View style={styles.couponRow}>
            <TextInput
              testID="web-coupon-input"
              value={coupon}
              onChangeText={(v) => { setCoupon(v.toUpperCase()); setCouponInfo(null); setCouponError(''); }}
              placeholder={lang === 'it' ? 'Es. WELCOME20' : 'e.g. WELCOME20'}
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="characters"
              style={styles.couponInput}
            />
            <Pressable onPress={checkCoupon} disabled={!coupon.trim() || checkingCoupon} style={styles.couponBtn} testID="web-coupon-apply">
              {checkingCoupon ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.couponBtnText}>{lang === 'it' ? 'Applica' : 'Apply'}</Text>}
            </Pressable>
          </View>
          {couponInfo && (
            <View style={styles.couponSuccess} testID="coupon-applied">
              <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
              <Text style={styles.couponSuccessText}>{couponInfo.code} — {couponInfo.discount_percent}% {lang === 'it' ? 'di sconto applicato' : 'discount applied'}</Text>
            </View>
          )}
          {couponError ? <Text style={styles.couponErr}>{couponError}</Text> : null}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.blue} style={{ marginTop: 32 }} />
        ) : (
          <View style={[styles.plansRow, isMobile && { flexDirection: 'column' }]}>
            {plans.map((p) => {
              const isCurrent = user?.subscription?.plan_id === p.id;
              const highlight = p.id === 'pro_yearly';
              const focused = planParam === p.id;
              return (
                <View key={p.id} style={[styles.planCard, isMobile && { width: '100%' }, highlight && styles.planHighlight, focused && { borderColor: colors.primary.blue, borderWidth: 3 }]} testID={`web-plan-${p.id}`}>
                  {highlight && <View style={styles.planBadge}><Text style={styles.planBadgeText}>{mt('plan_yearly_save', lang)}</Text></View>}
                  <Text style={styles.planName}>{p.name?.[lang as any] || p.name?.it || p.id}</Text>
                  <Text style={[styles.planPrice, highlight && { color: colors.primary.purple }]}>{getPrice(p)}</Text>
                  <View style={{ marginTop: 12, gap: 8, minHeight: 200 }}>
                    {(p.features?.[lang as any] || p.features?.it || []).map((f: string, i: number) => (
                      <View key={i} style={styles.featureRow}>
                        <MaterialCommunityIcons name="check-circle" size={18} color="#22C55E" />
                        <Text style={styles.featureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                  <Pressable
                    onPress={() => onChoose(p.id)}
                    disabled={isCurrent || purchasing === p.id}
                    style={[styles.planCta, { backgroundColor: highlight ? colors.primary.purple : colors.primary.blue }, isCurrent && { backgroundColor: colors.text.tertiary }]}
                    testID={`web-choose-${p.id}`}
                  >
                    {purchasing === p.id ? <ActivityIndicator color="#FFF" /> : (
                      <Text style={styles.planCtaText}>
                        {isCurrent ? (lang === 'it' ? 'Piano attuale' : 'Current plan') : p.id === 'free' ? (lang === 'it' ? 'Inizia gratis' : 'Start free') : (lang === 'it' ? 'Acquista ora' : 'Buy now')}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.disclaimerBox}>
          <MaterialCommunityIcons name="shield-check" size={20} color={colors.primary.blue} />
          <Text style={styles.disclaimer}>
            {lang === 'it' ? '🔒 Pagamenti sicuri tramite Stripe (TEST MODE in questa preview). Carta di test: 4242 4242 4242 4242, qualsiasi data futura, qualsiasi CVC.' : '🔒 Secure payments via Stripe (TEST MODE in this preview). Test card: 4242 4242 4242 4242, any future date, any CVC.'}
          </Text>
        </View>
      </Section>
      <WebFooter lang={lang} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  couponBox: { maxWidth: 480, alignSelf: 'center', width: '100%', backgroundColor: '#F8FAFC', padding: 16, borderRadius: radii.lg, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', marginBottom: 32 },
  couponLabel: { fontSize: 12, fontWeight: '800', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, height: 44, backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 12, fontSize: 14, fontWeight: '700', color: colors.primary.blue, letterSpacing: 1 },
  couponBtn: { backgroundColor: colors.primary.blue, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  couponBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  couponSuccess: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 8, backgroundColor: '#22C55E15', borderRadius: radii.sm },
  couponSuccessText: { color: '#16A34A', fontSize: 12, fontWeight: '700', flex: 1 },
  couponErr: { color: '#EF4444', fontSize: 12, marginTop: 6, fontWeight: '600' },
  plansRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  planCard: { width: 260, backgroundColor: '#FFF', borderRadius: radii.lg, padding: 24, borderWidth: 2, borderColor: colors.border, position: 'relative' },
  planHighlight: { borderColor: colors.primary.purple, borderWidth: 3 },
  planBadge: { position: 'absolute', top: -12, right: 16, backgroundColor: colors.primary.purple, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill },
  planBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  planName: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
  planPrice: { fontSize: 26, fontWeight: '900', color: colors.primary.blue, marginBottom: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { flex: 1, fontSize: 13, color: colors.text.primary, lineHeight: 20 },
  planCta: { marginTop: 16, paddingVertical: 12, borderRadius: radii.pill, alignItems: 'center' },
  planCtaText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  disclaimerBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 32, padding: 16, backgroundColor: colors.primary.blue + '08', borderRadius: radii.md, alignSelf: 'center', maxWidth: 720 },
  disclaimer: { flex: 1, color: colors.text.secondary, fontSize: 13, lineHeight: 20 },
});
