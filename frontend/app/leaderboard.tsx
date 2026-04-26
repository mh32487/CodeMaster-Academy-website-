import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { t } from '../src/i18n';

export default function Leaderboard() {
  const { lang, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/leaderboard?limit=50'); setItems(data); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  const myRank = items.findIndex((x) => x.user_id === user?.id);
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="leaderboard-screen">
      <Stack.Screen options={{ title: t('leaderboard', lang) }} />
      <Text style={styles.title}>🏆 {t('leaderboard', lang)}</Text>
      <Text style={styles.sub}>I migliori studenti della community</Text>

      <View style={styles.podium}>
        {top3[1] && <PodiumCol rank={2} name={top3[1].name} xp={top3[1].xp} color={colors.text.tertiary} />}
        {top3[0] && <PodiumCol rank={1} name={top3[0].name} xp={top3[0].xp} color={colors.status.warning} big />}
        {top3[2] && <PodiumCol rank={3} name={top3[2].name} xp={top3[2].xp} color="#CD7F32" />}
      </View>

      {myRank >= 0 && (
        <View style={styles.myRankBox} testID="my-rank">
          <Text style={styles.myRankLabel}>La tua posizione</Text>
          <View style={styles.row}>
            <Text style={styles.rankNum}>#{myRank + 1}</Text>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.xp}>{items[myRank].xp} XP</Text>
          </View>
        </View>
      )}

      <View style={styles.list}>
        {rest.map((u, i) => (
          <View key={u.user_id} style={styles.row} testID={`lb-row-${i + 4}`}>
            <Text style={styles.rankNum}>#{i + 4}</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(u.name || '?')[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.name}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                <Stat icon="fire" color={colors.status.error} value={u.streak} />
                <Stat icon="check-circle" color={colors.status.success} value={u.lessons} />
                <Stat icon="trophy" color={colors.status.warning} value={u.badges_count} />
              </View>
            </View>
            <Text style={styles.xp}>{u.xp} XP</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function PodiumCol({ rank, name, xp, color, big }: any) {
  return (
    <View style={[styles.podCol, big && { paddingVertical: 16 }]}>
      <View style={[styles.podAvatar, { borderColor: color }]}>
        <Text style={styles.podAvatarText}>{(name || '?')[0]}</Text>
      </View>
      <Text style={styles.podName} numberOfLines={1}>{name}</Text>
      <View style={[styles.podRankPill, { backgroundColor: color }]}>
        <Text style={styles.podRankText}>{rank}</Text>
      </View>
      <Text style={styles.podXp}>{xp} XP</Text>
    </View>
  );
}

function Stat({ icon, color, value }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <MaterialCommunityIcons name={icon} size={12} color={color} />
      <Text style={{ fontSize: 11, color: colors.text.secondary, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  sub: { color: colors.text.secondary, marginTop: 4, marginBottom: 20 },
  podium: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', backgroundColor: '#FFF', borderRadius: radii.lg, padding: 16, borderWidth: 2, borderColor: colors.border, marginBottom: 16 },
  podCol: { alignItems: 'center', flex: 1 },
  podAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  podAvatarText: { fontSize: 22, fontWeight: '800', color: colors.text.primary },
  podName: { fontSize: 12, fontWeight: '700', color: colors.text.primary, marginTop: 6, maxWidth: 80 },
  podRankPill: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  podRankText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  podXp: { fontSize: 11, color: colors.text.secondary, fontWeight: '700', marginTop: 2 },
  myRankBox: { backgroundColor: colors.primary.purple + '10', borderColor: colors.primary.purple, borderWidth: 2, borderRadius: radii.md, padding: 12, marginBottom: 16 },
  myRankLabel: { fontSize: 11, fontWeight: '800', color: colors.primary.purple, textTransform: 'uppercase', marginBottom: 6 },
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  rankNum: { fontSize: 16, fontWeight: '800', color: colors.text.secondary, width: 36 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: colors.text.primary },
  name: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  xp: { fontSize: 14, fontWeight: '800', color: colors.primary.purple },
});
