import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { Card, ProgressBar } from '../src/components';
import { localized, Lang } from '../src/i18n';

export default function MissionsScreen() {
  const { lang, refresh } = useAuth();
  const router = useRouter();
  const [missions, setMissions] = useState<any[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [m, c] = await Promise.all([api.get('/missions/today'), api.get('/challenges/weekly')]);
      setMissions(m.data.missions || []);
      setChallenge(c.data?.challenge || null);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        router.replace('/(auth)/login');
        return;
      }
      // Other errors: show empty state
      setMissions([]);
      setChallenge(null);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const claim = async (mid: string) => {
    try {
      const { data } = await api.post('/missions/claim', { mission_id: mid });
      Alert.alert('Premio riscattato!', `Hai guadagnato ${data.xp_gained} XP`);
      await load();
      await refresh();
    } catch (e: any) { Alert.alert('Errore', e?.response?.data?.detail || 'Riprova'); }
  };

  const claimChallenge = async () => {
    try {
      const { data } = await api.post('/challenges/weekly/claim');
      Alert.alert('Sfida vinta!', `Hai guadagnato ${data.xp_gained} XP`);
      await load();
      await refresh();
    } catch (e: any) { Alert.alert('Errore', e?.response?.data?.detail || 'Riprova'); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="missions-screen">
      <Stack.Screen options={{ title: 'Missioni & Sfide' }} />
      <Text style={styles.title}>🎯 Missioni di oggi</Text>
      <Text style={styles.sub}>Completa per guadagnare XP extra</Text>

      <View style={{ gap: 10, marginTop: 12 }}>
        {missions.map((m) => {
          const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
          return (
            <Card key={m.id} style={[{ borderColor: m.color + '40' }, m.completed && !m.claimed && { borderColor: colors.status.success }]}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: m.color + '15' }]}>
                  <MaterialCommunityIcons name={m.icon as any} size={26} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mTitle}>{localized(m.title, lang as Lang)}</Text>
                  <Text style={styles.mProgress}>{m.progress}/{m.target} • +{m.xp_reward} XP</Text>
                  <ProgressBar percent={pct} color={m.color} />
                </View>
                {m.claimed ? (
                  <View style={[styles.claimBtn, { backgroundColor: colors.text.tertiary }]}>
                    <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                  </View>
                ) : m.completed ? (
                  <TouchableOpacity testID={`claim-${m.id}`} style={[styles.claimBtn, { backgroundColor: colors.status.success }]} onPress={() => claim(m.id)}>
                    <Text style={styles.claimText}>Riscatta</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.claimBtn, { backgroundColor: colors.bg.main, borderWidth: 1, borderColor: colors.border }]}>
                    <Text style={[styles.claimText, { color: colors.text.tertiary }]}>{pct}%</Text>
                  </View>
                )}
              </View>
            </Card>
          );
        })}
      </View>

      {challenge && (
        <>
          <Text style={[styles.title, { marginTop: 24 }]}>🚀 Sfida settimanale</Text>
          <Card style={[{ borderColor: challenge.color + '60', borderWidth: 3 }, challenge.completed && !challenge.claimed && { borderColor: colors.status.success }]}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: challenge.color + '15' }]}>
                <MaterialCommunityIcons name={challenge.icon as any} size={32} color={challenge.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mTitle, { fontSize: 16 }]}>{localized(challenge.title, lang as Lang)}</Text>
                <Text style={styles.mProgress}>{challenge.progress}/{challenge.target} • Premio: {challenge.xp_reward} XP</Text>
                <ProgressBar percent={Math.min(100, (challenge.progress / challenge.target) * 100)} color={challenge.color} />
              </View>
            </View>
            {challenge.completed && !challenge.claimed && (
              <TouchableOpacity testID="claim-challenge" style={[styles.bigClaim, { backgroundColor: colors.status.success }]} onPress={claimChallenge}>
                <Text style={styles.bigClaimText}>🏆 Riscatta {challenge.xp_reward} XP</Text>
              </TouchableOpacity>
            )}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text.primary },
  sub: { color: colors.text.secondary, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mTitle: { fontSize: 14, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
  mProgress: { fontSize: 11, color: colors.text.secondary, marginBottom: 4 },
  claimBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.md, minWidth: 60, alignItems: 'center' },
  claimText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  bigClaim: { marginTop: 12, paddingVertical: 14, borderRadius: radii.md, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#16A34A' },
  bigClaimText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
