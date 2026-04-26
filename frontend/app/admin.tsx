import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { t } from '../src/i18n';

export default function Admin() {
  const { lang, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, u] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users')]);
        setStats(s.data); setUsers(u.data);
      } catch (e: any) { console.warn(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: t('admin_panel', lang) }} />
        <MaterialCommunityIcons name="lock" size={48} color={colors.status.error} />
        <Text style={styles.denied}>Accesso negato</Text>
        <Text style={styles.deniedSub}>Solo gli admin possono accedere</Text>
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="admin-screen">
      <Stack.Screen options={{ title: t('admin_panel', lang) }} />
      <Text style={styles.title}>Dashboard Admin</Text>
      <Text style={styles.sub}>Analytics e gestione piattaforma</Text>

      <View style={styles.grid}>
        <Stat icon="account-group" color={colors.primary.blue} value={stats?.users || 0} label="Utenti totali" />
        <Stat icon="crown" color={colors.primary.purple} value={stats?.pro_users || 0} label="Pro users" />
        <Stat icon="percent" color={colors.status.success} value={`${stats?.conversion_rate || 0}%`} label="Conversion" />
        <Stat icon="code-tags" color={colors.status.warning} value={stats?.languages || 0} label="Linguaggi" />
        <Stat icon="book-open-variant" color={colors.status.info} value={stats?.lessons || 0} label="Lezioni" />
        <Stat icon="check-circle" color={colors.status.success} value={stats?.lesson_completions || 0} label="Completamenti" />
        <Stat icon="help-circle" color={colors.status.warning} value={stats?.quizzes || 0} label="Quiz" />
        <Stat icon="cash-multiple" color={colors.primary.purple} value={stats?.transactions || 0} label="Transazioni" />
      </View>

      <Text style={styles.section}>Top linguaggi</Text>
      <View style={styles.list}>
        {(stats?.top_languages || []).map((l: any, i: number) => (
          <View key={l._id} style={styles.row}>
            <Text style={styles.rank}>#{i + 1}</Text>
            <Text style={styles.langName}>{l._id}</Text>
            <Text style={styles.langValue}>{l.completions} lezioni completate</Text>
          </View>
        ))}
        {(!stats?.top_languages || stats.top_languages.length === 0) && (
          <Text style={styles.empty}>Nessun completamento ancora</Text>
        )}
      </View>

      <Text style={styles.section}>Utenti recenti ({users.length})</Text>
      <View style={styles.list}>
        {users.slice(0, 20).map((u: any) => (
          <View key={u.id} style={styles.userRow} testID={`admin-user-${u.id}`}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(u.name || '?')[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
            </View>
            <View style={[styles.planPill, { backgroundColor: u.subscription?.plan_id === 'free' ? colors.text.tertiary + '20' : colors.primary.purple + '20' }]}>
              <Text style={[styles.planText, { color: u.subscription?.plan_id === 'free' ? colors.text.secondary : colors.primary.purple }]}>
                {(u.subscription?.plan_id || 'free').toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          ℹ️ API admin disponibili: POST /api/admin/languages, POST /api/admin/lessons per aggiungere contenuti senza modificare il codice.
        </Text>
      </View>
    </ScrollView>
  );
}

function Stat({ icon, color, value, label }: any) {
  return (
    <View style={styles.statBox}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main, padding: 24 },
  denied: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 16 },
  deniedSub: { color: colors.text.secondary, marginTop: 4 },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  sub: { color: colors.text.secondary, marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statBox: { width: '48%', backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 6 },
  statLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: '600' },
  section: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginTop: 20, marginBottom: 10 },
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: 10 },
  rank: { fontWeight: '800', color: colors.text.secondary, width: 28 },
  langName: { fontSize: 14, fontWeight: '700', color: colors.text.primary, flex: 1 },
  langValue: { fontSize: 12, color: colors.primary.blue, fontWeight: '700' },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: colors.primary.blue },
  userName: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  userEmail: { fontSize: 12, color: colors.text.secondary },
  planPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  planText: { fontSize: 10, fontWeight: '800' },
  empty: { color: colors.text.secondary, fontStyle: 'italic', padding: 12 },
  note: { marginTop: 24, padding: 14, backgroundColor: colors.primary.blue + '10', borderRadius: radii.md, borderLeftWidth: 4, borderLeftColor: colors.primary.blue },
  noteText: { fontSize: 13, color: colors.text.primary, lineHeight: 19 },
});
