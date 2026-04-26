import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing, fontSize } from '../../src/theme';
import { Card, ProgressBar } from '../../src/components';
import { t, localized } from '../../src/i18n';

export default function Home() {
  const { user, lang, refresh } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<any>(null);
  const [languages, setLanguages] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [pr, lg, ph] = await Promise.all([
        api.get('/progress/me'),
        api.get('/languages'),
        api.get('/paths'),
      ]);
      setProgress(pr.data);
      setLanguages(lg.data);
      setPaths(ph.data);
    } catch (e) {
      console.warn('home load error', e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), refresh()]);
    setRefreshing(false);
  };

  const stats = user?.stats;
  const overall = progress?.overall_percent || 0;
  const recommendedLangs = languages.filter((l) => l.has_full_content).slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="home-screen">
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>{t('welcome_back', lang)},</Text>
            <Text style={styles.name} testID="hello-user">{user?.name || 'Studente'}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBox}>
              <MaterialCommunityIcons name="fire" size={18} color={colors.status.error} />
              <Text style={styles.streakText} testID="header-streak">{stats?.streak_days || 0}</Text>
            </View>
            <View style={[styles.streakBox, { marginLeft: 8 }]}>
              <MaterialCommunityIcons name="diamond-stone" size={16} color={colors.primary.purple} />
              <Text style={[styles.streakText, { color: colors.primary.purple }]} testID="header-xp">{stats?.xp || 0}</Text>
            </View>
          </View>
        </View>

        <Card style={styles.progressCard}>
          <Text style={styles.cardTitle}>{t('total_progress', lang)}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.percentBig} testID="overall-percent">{overall}%</Text>
            <View style={styles.statsCol}>
              <StatLine icon="check-circle" color={colors.status.success} value={progress?.lessons_completed || 0} label={t('lessons_completed', lang)} />
              <StatLine icon="trophy" color={colors.status.warning} value={(user?.badges || []).length} label={t('badges', lang)} />
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <ProgressBar percent={overall} />
          </View>
        </Card>

        <View style={styles.row}>
          <QuickAction icon="trophy-variant" color={colors.status.warning} label={t('leaderboard', lang)} onPress={() => router.push('/leaderboard')} testID="qa-leaderboard" />
          <QuickAction icon="account-multiple-plus" color={colors.primary.purple} label={t('refer_friends', lang)} onPress={() => router.push('/referral')} testID="qa-referral" />
          <QuickAction icon="certificate" color={colors.status.success} label={t('certificates', lang)} onPress={() => router.push('/certificates')} testID="qa-certs" />
        </View>

        <Text style={styles.sectionTitle}>{t('paths', lang)}</Text>
        <FlatList
          horizontal
          data={paths}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`path-card-${item.id}`}
              style={[styles.pathCard, { borderColor: item.color + '40', backgroundColor: item.color + '10' }]}
              onPress={() => router.push(`/path/${item.id}`)}
              activeOpacity={0.85}
            >
              <View style={[styles.pathIcon, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon as any} size={26} color="#FFF" />
              </View>
              <Text style={styles.pathTitle} numberOfLines={1}>{localized(item.name, lang)}</Text>
              <Text style={styles.pathDesc} numberOfLines={2}>{localized(item.description, lang)}</Text>
              <Text style={styles.pathHours}>~{item.estimated_hours}h</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.sectionTitle}>{t('recommended', lang)}</Text>
        <View style={styles.recList}>
          {recommendedLangs.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={styles.recRow}
              onPress={() => router.push(`/language/${l.id}`)}
              activeOpacity={0.85}
              testID={`rec-${l.id}`}
            >
              <View style={[styles.recIcon, { backgroundColor: l.color + '15' }]}>
                <MaterialCommunityIcons name={l.icon_name as any} size={28} color={l.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recName}>{l.name}</Text>
                <Text style={styles.recTagline} numberOfLines={1}>{localized(l.tagline, lang)}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          testID="upgrade-banner"
          style={styles.upgradeBanner}
          onPress={() => router.push('/pricing')}
          activeOpacity={0.9}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>Sblocca tutto con Pro</Text>
            <Text style={styles.upgradeSub}>Tutti i 17 linguaggi, AI Tutor illimitato, certificati</Text>
          </View>
          <MaterialCommunityIcons name="rocket-launch" size={32} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatLine({ icon, color, value, label }: { icon: any; color: string; value: number; label: string }) {
  return (
    <View style={styles.statLine}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, color, label, onPress, testID }: any) {
  return (
    <TouchableOpacity testID={testID} style={styles.qa} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.qaIcon, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  hello: { fontSize: 14, color: colors.text.secondary },
  name: { fontSize: 24, fontWeight: '800', color: colors.text.primary },
  headerRight: { flexDirection: 'row' },
  streakBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border },
  streakText: { fontWeight: '800', color: colors.status.error },
  progressCard: { marginBottom: 16 },
  cardTitle: { fontSize: 14, color: colors.text.secondary, fontWeight: '600', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  percentBig: { fontSize: 48, fontWeight: '900', color: colors.primary.blue, letterSpacing: -1 },
  statsCol: { flex: 1, marginLeft: 16 },
  statLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 3 },
  statValue: { fontWeight: '800', color: colors.text.primary, fontSize: 16 },
  statLabel: { color: colors.text.secondary, fontSize: 12, flex: 1 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  qa: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  qaIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  qaLabel: { fontSize: 11, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginTop: 8, marginBottom: 12 },
  pathCard: { width: 200, padding: 14, borderRadius: radii.lg, borderWidth: 2, marginRight: 12 },
  pathIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  pathTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
  pathDesc: { fontSize: 12, color: colors.text.secondary, marginTop: 4, height: 32 },
  pathHours: { fontSize: 12, fontWeight: '700', color: colors.primary.blue, marginTop: 8 },
  recList: { gap: 10 },
  recRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: radii.md, padding: 12, borderWidth: 2, borderColor: colors.border, gap: 12 },
  recIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recName: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
  recTagline: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  upgradeBanner: { marginTop: 20, padding: 18, backgroundColor: colors.primary.purple, borderRadius: radii.lg, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 4, borderBottomColor: colors.primary.purpleDark },
  upgradeTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  upgradeSub: { color: '#FFF', opacity: 0.9, fontSize: 13, marginTop: 2 },
});
