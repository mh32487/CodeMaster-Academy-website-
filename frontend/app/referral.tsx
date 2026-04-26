import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { PrimaryButton } from '../src/components';
import { t } from '../src/i18n';

export default function Referral() {
  const { lang } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/referral/me'); setData(data); }
      finally { setLoading(false); }
    })();
  }, []);

  const onShare = async () => {
    if (!data) return;
    if (Platform.OS === 'web') {
      Alert.alert('Codice copiato', `Condividi: "${data.share_message}"`);
      return;
    }
    try {
      await Share.share({ message: data.share_message });
    } catch (e) { /* noop */ }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="referral-screen">
      <Stack.Screen options={{ title: t('refer_friends', lang) }} />
      <View style={styles.hero}>
        <MaterialCommunityIcons name="gift" size={56} color={colors.primary.purple} />
        <Text style={styles.title}>Invita amici, guadagna XP</Text>
        <Text style={styles.sub}>Per ogni amico che si registra con il tuo codice ricevi 50 XP.</Text>
      </View>

      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Il tuo codice referral</Text>
        <Text style={styles.code} testID="referral-code">{data?.referral_code}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="account-multiple-plus" size={24} color={colors.primary.blue} />
          <Text style={styles.statValue}>{data?.invited_count || 0}</Text>
          <Text style={styles.statLabel}>Amici invitati</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="diamond-stone" size={24} color={colors.primary.purple} />
          <Text style={styles.statValue}>+{data?.xp_earned_from_referrals || 0}</Text>
          <Text style={styles.statLabel}>XP guadagnati</Text>
        </View>
      </View>

      <PrimaryButton label="Condividi il mio codice" onPress={onShare} testID="share-referral-btn" variant="purple" style={{ marginTop: 24 }} />

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Come funziona</Text>
        <Tip n="1" text="Condividi il tuo codice con amici" />
        <Tip n="2" text="L'amico si registra usando il codice" />
        <Tip n="3" text="Tu guadagni 50 XP istantaneamente" />
      </View>
    </ScrollView>
  );
}

function Tip({ n, text }: any) {
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipNum}><Text style={styles.tipNumText}>{n}</Text></View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  hero: { alignItems: 'center', padding: 16, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 12, textAlign: 'center' },
  sub: { color: colors.text.secondary, marginTop: 6, textAlign: 'center' },
  codeBox: { backgroundColor: colors.primary.purple + '10', borderRadius: radii.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary.purple, padding: 20, alignItems: 'center' },
  codeLabel: { fontSize: 12, fontWeight: '700', color: colors.primary.purple, textTransform: 'uppercase', letterSpacing: 1 },
  code: { fontSize: 36, fontWeight: '900', color: colors.primary.purple, marginTop: 6, letterSpacing: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 6 },
  statLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: '700' },
  tips: { marginTop: 24, gap: 10 },
  tipsTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary.blue, alignItems: 'center', justifyContent: 'center' },
  tipNumText: { color: '#FFF', fontWeight: '800' },
  tipText: { fontSize: 14, color: colors.text.primary, flex: 1 },
});
