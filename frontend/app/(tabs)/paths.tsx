import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { localized, t } from '../../src/i18n';

export default function Paths() {
  const router = useRouter();
  const { lang } = useAuth();
  const [paths, setPaths] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, pr] = await Promise.all([api.get('/paths'), api.get('/projects')]);
        setPaths(p.data); setProjects(pr.data);
      } catch (e) { console.warn(e); }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="paths-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('paths', lang)}</Text>
        <Text style={styles.sub}>Percorsi guidati per diventare uno sviluppatore completo</Text>

        <View style={styles.list}>
          {paths.map((p) => (
            <TouchableOpacity
              key={p.id}
              testID={`path-${p.id}`}
              activeOpacity={0.85}
              onPress={() => router.push(`/path/${p.id}`)}
              style={[styles.pathCard, { borderColor: p.color + '50' }]}
            >
              <View style={[styles.pathIcon, { backgroundColor: p.color }]}>
                <MaterialCommunityIcons name={p.icon as any} size={28} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pathTitle}>{localized(p.name, lang)}</Text>
                <Text style={styles.pathDesc} numberOfLines={2}>{localized(p.description, lang)}</Text>
                <View style={styles.pathMeta}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.metaText}>~{p.estimated_hours}h</Text>
                  <MaterialCommunityIcons name="code-tags" size={14} color={colors.text.secondary} style={{ marginLeft: 12 }} />
                  <Text style={styles.metaText}>{p.languages.length} linguaggi</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.title, { fontSize: 22, marginTop: 24 }]}>{t('projects', lang)}</Text>
        <Text style={styles.sub}>Costruisci progetti reali e aggiungili al tuo portfolio</Text>

        <View style={styles.projGrid}>
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              testID={`project-${p.id}`}
              activeOpacity={0.85}
              onPress={() => router.push(`/project/${p.id}`)}
              style={styles.projCard}
            >
              <View style={[styles.projIcon, { backgroundColor: p.color + '15' }]}>
                <MaterialCommunityIcons name={p.icon as any} size={28} color={p.color} />
              </View>
              <Text style={styles.projTitle} numberOfLines={1}>{localized(p.title, lang)}</Text>
              <Text style={styles.projDesc} numberOfLines={2}>{localized(p.description, lang)}</Text>
              <View style={styles.projMeta}>
                <Text style={[styles.projMetaText, { color: p.color }]}>~{p.estimated_minutes}min</Text>
                <Text style={styles.projDifficulty}>{p.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text.primary },
  sub: { color: colors.text.secondary, marginTop: 4, marginBottom: 16 },
  list: { gap: 12 },
  pathCard: { backgroundColor: '#FFF', padding: 14, borderRadius: radii.lg, borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pathIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  pathTitle: { fontSize: 17, fontWeight: '800', color: colors.text.primary },
  pathDesc: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  pathMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  metaText: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' },
  projGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  projCard: { width: '48%', backgroundColor: '#FFF', borderRadius: radii.md, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: colors.border, minHeight: 160 },
  projIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  projTitle: { fontSize: 14, fontWeight: '800', color: colors.text.primary },
  projDesc: { fontSize: 11, color: colors.text.secondary, marginTop: 2, height: 28 },
  projMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  projMetaText: { fontSize: 12, fontWeight: '700' },
  projDifficulty: { fontSize: 10, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase' },
});
