import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { CodeBlock, PrimaryButton } from '../../src/components';
import { localized, t, Lang } from '../../src/i18n';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lang, refresh } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/lessons/${id}`);
        setData(data);
      } catch (e: any) {
        Alert.alert('Errore', e?.response?.data?.detail || 'Lezione non trovata');
      } finally { setLoading(false); }
    })();
  }, [id]);

  const onComplete = async () => {
    setSubmitting(true);
    try {
      const { data: r } = await api.post('/lessons/complete', { lesson_id: id });
      await refresh();
      Alert.alert(
        '🎉 Lezione completata!',
        r.already_completed ? 'Avevi già completato questa lezione.' : `Hai guadagnato ${r.xp_gained} XP!`,
        [{ text: 'Continua', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Errore', e?.response?.data?.detail || 'Riprova');
    } finally { setSubmitting(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  if (!data) return null;

  const lesson = data.lesson;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.main }} testID="lesson-screen">
      <Stack.Screen options={{ title: localized(lesson.title, lang as Lang) }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{localized(lesson.title, lang as Lang)}</Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="book-open-variant" size={14} color={colors.text.secondary} />
          <Text style={styles.metaText}>{lesson.level} · {lesson.language_id}</Text>
        </View>

        <Text style={styles.body}>{localized(lesson.content, lang as Lang)}</Text>

        {lesson.code ? (
          <>
            <Text style={styles.codeLabel}>Esempio</Text>
            <CodeBlock code={lesson.code} />
            {lesson.code_explanation && (
              <Text style={styles.codeExp}>{localized(lesson.code_explanation, lang as Lang)}</Text>
            )}
          </>
        ) : null}

        {data.completed && (
          <View style={styles.completedBadge} testID="completed-badge">
            <MaterialCommunityIcons name="check-circle" size={20} color={colors.status.success} />
            <Text style={styles.completedText}>Lezione già completata</Text>
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <PrimaryButton
          label={data.completed ? '✓ Completata' : t('complete_lesson', lang)}
          onPress={onComplete}
          loading={submitting}
          disabled={data.completed}
          testID="complete-lesson-btn"
          variant={data.completed ? 'success' : 'primary'}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  metaText: { fontSize: 12, color: colors.text.secondary, fontWeight: '600', textTransform: 'capitalize' },
  body: { fontSize: 16, lineHeight: 26, color: colors.text.primary, marginBottom: 24 },
  codeLabel: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  codeExp: { fontSize: 14, color: colors.text.secondary, marginTop: 8, fontStyle: 'italic' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.status.success + '15', padding: 12, borderRadius: radii.md, marginTop: 24 },
  completedText: { color: colors.status.success, fontWeight: '700' },
  footer: { padding: spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: colors.border },
});
