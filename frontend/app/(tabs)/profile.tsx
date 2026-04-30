import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { Card, ProgressBar } from '../../src/components';
import { t, SUPPORTED_LANGS, Lang } from '../../src/i18n';

export default function Profile() {
  const { user, logout, lang, setLang } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [pr, bg] = await Promise.all([api.get('/progress/me'), api.get('/badges')]);
        setProgress(pr.data);
        setBadges(bg.data);
      } catch (e) { console.warn(e); }
    })();
  }, []);

  const onLogout = () => {
    Alert.alert('Logout', 'Vuoi davvero uscire?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  };

  const myBadgeIds = new Set(user?.badges || []);
  const planLabel = user?.subscription?.plan_id === 'free' ? 'Free' : user?.subscription?.plan_id;

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="profile-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || '?')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.name} testID="profile-name">{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === 'admin' && (
            <View style={styles.adminPill}>
              <MaterialCommunityIcons name="shield-crown" size={14} color="#FFF" />
              <Text style={styles.adminPillText}>ADMIN</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <StatBlock icon="diamond-stone" color={colors.primary.purple} value={user?.stats?.xp || 0} label={t('xp', lang)} />
          <StatBlock icon="fire" color={colors.status.error} value={user?.stats?.streak_days || 0} label={t('streak', lang)} />
          <StatBlock icon="check-circle" color={colors.status.success} value={user?.stats?.lessons_completed || 0} label={t('lessons_completed', lang)} />
        </View>

        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>{t('total_progress', lang)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={styles.bigPercent}>{progress?.overall_percent || 0}%</Text>
            <View style={{ flex: 1 }}>
              <ProgressBar percent={progress?.overall_percent || 0} />
              <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 6 }}>
                {progress?.lessons_completed || 0} / {progress?.total_lessons || 0} lezioni
              </Text>
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>{t('badges', lang)}</Text>
          <View style={styles.badgesGrid}>
            {badges.map((b) => {
              const owned = myBadgeIds.has(b.id);
              return (
                <View key={b.id} style={[styles.badgeItem, !owned && styles.badgeLocked]}>
                  <MaterialCommunityIcons name={b.icon as any} size={28} color={owned ? b.color : colors.text.tertiary} />
                  <Text style={[styles.badgeName, !owned && { color: colors.text.tertiary }]} numberOfLines={1}>{b.name?.it || b.id}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View>
              <Text style={styles.sectionTitle}>{t('current_plan', lang)}</Text>
              <Text style={styles.planText}>{planLabel?.toUpperCase()}</Text>
            </View>
            <TouchableOpacity testID="upgrade-btn" style={styles.upgradeBtn} onPress={() => router.push('/pricing')}>
              <Text style={styles.upgradeBtnText}>{t('upgrade_now', lang)}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>Lingua interfaccia</Text>
          <View style={styles.langRow}>
            {SUPPORTED_LANGS.map((l) => (
              <TouchableOpacity
                key={l.code}
                testID={`lang-${l.code}`}
                onPress={() => setLang(l.code as Lang)}
                style={[styles.langChip, lang === l.code && { backgroundColor: colors.primary.blue, borderColor: colors.primary.blue }]}
              >
                <Text style={[styles.langChipText, lang === l.code && { color: '#FFF' }]}>{l.flag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <View style={{ gap: 8 }}>
          <MenuRow icon="target" label="Missioni & Sfide" onPress={() => router.push('/missions')} testID="menu-missions" />
          <MenuRow icon="brain" label="Piano studio AI" onPress={() => router.push('/study-plan')} color={colors.primary.purple} testID="menu-study-plan" />
          <MenuRow icon="trophy-variant" label={t('leaderboard', lang)} onPress={() => router.push('/leaderboard')} testID="menu-leaderboard" />
          <MenuRow icon="certificate" label={t('certificates', lang)} onPress={() => router.push('/certificates')} testID="menu-certs" />
          <MenuRow icon="account-multiple-plus" label={t('refer_friends', lang)} onPress={() => router.push('/referral')} testID="menu-refer" />
          <MenuRow icon="credit-card-outline" label={t('pricing', lang)} onPress={() => router.push('/pricing')} testID="menu-pricing" />
          {user?.role === 'admin' && (
            <MenuRow icon="shield-crown" label={t('admin_panel', lang)} onPress={() => router.push('/admin')} color={colors.primary.purple} testID="menu-admin" />
          )}
          <MenuRow icon="cash-multiple" label="Programma Affiliati" onPress={() => router.push('/affiliate')} color={colors.primary.purple} testID="menu-affiliate" />
          <MenuRow icon="shield-lock" label={lang === 'it' ? 'Sicurezza' : 'Security'} onPress={() => router.push('/security')} color={colors.status.success} testID="menu-security" />
          <MenuRow icon="logout" label={t('logout', lang)} onPress={onLogout} color={colors.status.error} testID="menu-logout" />
        </View>

        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => router.push('/legal/terms')} testID="profile-terms"><Text style={styles.legalLink}>Termini</Text></TouchableOpacity>
          <Text style={{ color: colors.text.tertiary }}> · </Text>
          <TouchableOpacity onPress={() => router.push('/legal/privacy')} testID="profile-privacy"><Text style={styles.legalLink}>Privacy</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBlock({ icon, color, value, label }: any) {
  return (
    <View style={styles.statBlock}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={styles.statBlockValue}>{value}</Text>
      <Text style={styles.statBlockLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, onPress, color = colors.text.primary, testID }: any) {
  return (
    <TouchableOpacity testID={testID} style={styles.menuRow} onPress={onPress} activeOpacity={0.85}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  head: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary.blue, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: colors.primary.blueDark },
  avatarText: { fontSize: 40, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 12 },
  email: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  adminPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary.purple, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, marginTop: 8 },
  adminPillText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBlock: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  statBlockValue: { fontSize: 20, fontWeight: '800', color: colors.text.primary, marginTop: 4 },
  statBlockLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  bigPercent: { fontSize: 36, fontWeight: '900', color: colors.primary.blue },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeItem: { width: '23%', alignItems: 'center', padding: 6, marginBottom: 6 },
  badgeLocked: { opacity: 0.4 },
  badgeName: { fontSize: 10, fontWeight: '700', color: colors.text.primary, marginTop: 4, textAlign: 'center' },
  planText: { fontSize: 18, fontWeight: '800', color: colors.primary.purple, marginTop: 2 },
  upgradeBtn: { backgroundColor: colors.primary.purple, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.md, borderBottomWidth: 3, borderBottomColor: colors.primary.purpleDark },
  upgradeBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 2, borderColor: colors.border, backgroundColor: '#FFF' },
  langChipText: { fontWeight: '800', color: colors.text.primary, fontSize: 13 },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, gap: 12 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  legalLink: { color: colors.primary.blue, fontSize: 13, fontWeight: '700' },
});
