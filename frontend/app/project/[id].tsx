import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';
import { localized, Lang } from '../../src/i18n';

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get(`/projects/${id}`); setData(data); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  if (!data) return null;

  const steps = [
    { title: 'Setup ambiente', desc: 'Installa gli strumenti necessari' },
    { title: 'Crea struttura', desc: 'Imposta i file e cartelle del progetto' },
    { title: 'Implementa logica', desc: 'Scrivi la logica principale' },
    { title: 'Testa e raffina', desc: 'Verifica il funzionamento e migliora' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.main }} testID="project-detail-screen">
      <Stack.Screen options={{ title: localized(data.title, lang as Lang) }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: data.color + '15' }]}>
          <View style={[styles.heroIcon, { backgroundColor: data.color }]}>
            <MaterialCommunityIcons name={data.icon as any} size={36} color="#FFF" />
          </View>
          <Text style={styles.title}>{localized(data.title, lang as Lang)}</Text>
          <Text style={styles.desc}>{localized(data.description, lang as Lang)}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.chip, { backgroundColor: data.color + '20' }]}>
              <Text style={[styles.chipText, { color: data.color }]}>{data.difficulty}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: data.color + '20' }]}>
              <Text style={[styles.chipText, { color: data.color }]}>~{data.estimated_minutes} min</Text>
            </View>
          </View>
        </View>

        <Text style={styles.section}>Cosa imparerai</Text>
        <View style={{ gap: 8 }}>
          {steps.map((s, i) => (
            <View key={i} style={styles.stepBox}>
              <View style={[styles.stepNum, { backgroundColor: data.color }]}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <PrimaryButton
          label="Vai al linguaggio del progetto"
          onPress={() => router.push(`/language/${data.language_id}`)}
          testID="open-project-lang-btn"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  hero: { borderRadius: radii.lg, padding: 20, alignItems: 'center', marginBottom: 20 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text.primary, textAlign: 'center' },
  desc: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 8 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill },
  chipText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  section: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 12 },
  stepBox: { flexDirection: 'row', gap: 12, backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  stepNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#FFF', fontWeight: '800' },
  stepTitle: { fontSize: 15, fontWeight: '800', color: colors.text.primary },
  stepDesc: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  footer: { padding: spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: colors.border },
});
