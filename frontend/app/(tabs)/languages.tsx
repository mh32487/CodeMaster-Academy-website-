import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { localized, t } from '../../src/i18n';

function LangIcon({ family, name, color, size = 32 }: any) {
  if (family === 'MaterialIcons') return <MaterialIcons name={name} size={size} color={color} />;
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export default function Languages() {
  const router = useRouter();
  const { lang } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/languages');
      setItems(data);
    } catch (e) { console.warn(e); }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="languages-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{t('languages', lang)}</Text>
        <Text style={styles.sub}>17 linguaggi · 4 livelli ognuno</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {items.map((l) => (
            <TouchableOpacity
              key={l.id}
              testID={`lang-card-${l.id}`}
              style={[styles.card, !l.has_full_content && styles.cardMuted]}
              onPress={() => router.push(`/language/${l.id}`)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconBox, { backgroundColor: l.color + '15' }]}>
                <LangIcon family={l.icon_family} name={l.icon_name} color={l.color} size={36} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{l.name}</Text>
              <Text style={styles.cardTag} numberOfLines={2}>{localized(l.tagline, lang)}</Text>
              {l.has_full_content ? (
                <View style={[styles.pill, { backgroundColor: colors.status.success + '20', borderColor: colors.status.success }]}>
                  <Text style={[styles.pillText, { color: colors.status.success }]}>Disponibile</Text>
                </View>
              ) : (
                <View style={[styles.pill, { backgroundColor: colors.text.tertiary + '20', borderColor: colors.text.tertiary }]}>
                  <Text style={[styles.pillText, { color: colors.text.secondary }]}>Coming soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  header: { padding: spacing.md, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text.primary },
  sub: { color: colors.text.secondary, marginTop: 4 },
  scroll: { padding: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 180,
  },
  cardMuted: { opacity: 0.7 },
  iconBox: { width: 60, height: 60, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text.primary },
  cardTag: { fontSize: 12, color: colors.text.secondary, marginTop: 4, height: 32 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, marginTop: 8, borderWidth: 1 },
  pillText: { fontSize: 11, fontWeight: '700' },
});
