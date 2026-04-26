import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { localized, Lang } from '../../src/i18n';

export default function PathDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get(`/paths/${id}`); setData(data); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  if (!data) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.main }} testID="path-detail-screen">
      <Stack.Screen options={{ title: localized(data.name, lang as Lang) }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: data.color + '15' }]}>
          <View style={[styles.heroIcon, { backgroundColor: data.color }]}>
            <MaterialCommunityIcons name={data.icon as any} size={42} color="#FFF" />
          </View>
          <Text style={styles.title}>{localized(data.name, lang as Lang)}</Text>
          <Text style={styles.desc}>{localized(data.description, lang as Lang)}</Text>
          <View style={styles.metaRow}>
            <MetaChip icon="clock-outline" label={`~${data.estimated_hours}h`} color={data.color} />
            <MetaChip icon="code-tags" label={`${data.languages.length} linguaggi`} color={data.color} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Linguaggi del percorso</Text>
        <View style={{ gap: 10 }}>
          {data.languages_full.map((l: any, i: number) => (
            <TouchableOpacity
              key={l.id}
              testID={`path-lang-${l.id}`}
              activeOpacity={0.85}
              onPress={() => router.push(`/language/${l.id}`)}
              style={styles.langRow}
            >
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <View style={[styles.langIcon, { backgroundColor: l.color + '15' }]}>
                {l.icon_family === 'MaterialIcons'
                  ? <MaterialIcons name={l.icon_name as any} size={28} color={l.color} />
                  : <MaterialCommunityIcons name={l.icon_name as any} size={28} color={l.color} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.langName}>{l.name}</Text>
                <Text style={styles.langTagline} numberOfLines={1}>{localized(l.tagline, lang as Lang)}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function MetaChip({ icon, label, color }: any) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  hero: { borderRadius: radii.lg, padding: 20, alignItems: 'center', marginBottom: 20 },
  heroIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text.primary, textAlign: 'center' },
  desc: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 8 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 12 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary.blue, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  langIcon: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  langName: { fontSize: 15, fontWeight: '800', color: colors.text.primary },
  langTagline: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
});
