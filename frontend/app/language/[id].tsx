import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { ProgressBar } from '../../src/components';
import { localized, t, Lang } from '../../src/i18n';

const LEVELS = ['base', 'intermediate', 'advanced', 'pro'];

export default function LanguageDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lang, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [activeLevel, setActiveLevel] = useState('base');
  const [courseDetail, setCourseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: ld } = await api.get(`/languages/${id}`);
      setData(ld);
    } finally { setLoading(false); }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (!data) return;
    const course = data.courses.find((c: any) => c.level === activeLevel);
    if (!course) return;
    (async () => {
      try {
        const { data: cd } = await api.get(`/courses/${course.id}`);
        setCourseDetail(cd);
      } catch (e) { console.warn(e); }
    })();
  }, [activeLevel, data]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  }
  if (!data) return null;

  const language = data.language;
  const isPremiumLocked = (premium: boolean) => premium && user?.subscription?.plan_id === 'free';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.main }} testID="language-detail-screen">
      <Stack.Screen options={{ title: language.name, headerStyle: { backgroundColor: language.color + '15' } }} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroBox, { backgroundColor: language.color + '15' }]}>
          <View style={[styles.bigIcon, { backgroundColor: language.color }]}>
            {language.icon_family === 'MaterialIcons' ? (
              <MaterialIcons name={language.icon_name as any} size={42} color="#FFF" />
            ) : (
              <MaterialCommunityIcons name={language.icon_name as any} size={42} color="#FFF" />
            )}
          </View>
          <Text style={styles.langTitle}>{language.name}</Text>
          <Text style={styles.langTagline}>{localized(language.tagline, lang as Lang)}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('levels', lang)}</Text>
        <View style={styles.tabs}>
          {LEVELS.map((lv) => (
            <TouchableOpacity
              key={lv}
              testID={`level-tab-${lv}`}
              onPress={() => setActiveLevel(lv)}
              style={[styles.tab, activeLevel === lv && { backgroundColor: language.color, borderColor: language.color }]}
            >
              <Text style={[styles.tabText, activeLevel === lv && { color: '#FFF' }]}>{t(lv, lang)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {courseDetail && (
          <>
            <View style={styles.completionBox}>
              <Text style={styles.completionLabel}>{t('total_progress', lang)}</Text>
              <Text style={styles.completionPercent} testID="course-completion">{courseDetail.completion_percent}%</Text>
              <ProgressBar percent={courseDetail.completion_percent} color={language.color} />
            </View>

            <Text style={styles.sectionTitle}>Lezioni</Text>
            <View style={styles.list}>
              {courseDetail.lessons.map((lesson: any, idx: number) => {
                const done = courseDetail.completed_lesson_ids.includes(lesson.id);
                const locked = isPremiumLocked(lesson.is_premium);
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    testID={`lesson-${lesson.id}`}
                    activeOpacity={0.85}
                    style={[styles.lessonRow, done && { borderColor: colors.status.success }, locked && { opacity: 0.6 }]}
                    onPress={() => locked ? router.push('/pricing') : router.push(`/lesson/${lesson.id}`)}
                  >
                    <View style={[styles.lessonIdx, { backgroundColor: done ? colors.status.success : language.color + '15' }]}>
                      {done ? (
                        <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                      ) : locked ? (
                        <MaterialCommunityIcons name="lock" size={16} color={language.color} />
                      ) : (
                        <Text style={[styles.lessonIdxText, { color: language.color }]}>{idx + 1}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lessonTitle} numberOfLines={1}>{localized(lesson.title, lang as Lang)}</Text>
                      <Text style={styles.lessonSub} numberOfLines={1}>{lesson.is_premium ? 'Premium' : 'Free'}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.text.tertiary} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {courseDetail.quizzes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Quiz</Text>
                <View style={styles.list}>
                  {courseDetail.quizzes.map((q: any) => (
                    <TouchableOpacity
                      key={q.id}
                      testID={`quiz-${q.id}`}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/quiz/${q.id}`)}
                      style={[styles.lessonRow, { borderColor: colors.status.warning + '60' }]}
                    >
                      <View style={[styles.lessonIdx, { backgroundColor: colors.status.warning + '15' }]}>
                        <MaterialCommunityIcons name="help-circle" size={20} color={colors.status.warning} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lessonTitle}>{localized(q.title, lang as Lang)}</Text>
                        <Text style={styles.lessonSub}>{q.questions.length} domande</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.text.tertiary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {courseDetail.exercises.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Esercizi</Text>
                <View style={styles.list}>
                  {courseDetail.exercises.map((e: any, idx: number) => (
                    <TouchableOpacity
                      key={e.id}
                      testID={`exercise-${e.id}`}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/exercise/${e.id}`)}
                      style={[styles.lessonRow, { borderColor: colors.primary.purple + '60' }]}
                    >
                      <View style={[styles.lessonIdx, { backgroundColor: colors.primary.purple + '15' }]}>
                        <MaterialCommunityIcons name="code-tags" size={20} color={colors.primary.purple} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.lessonTitle}>{localized(e.title, lang as Lang)}</Text>
                        <Text style={styles.lessonSub}>Completa il codice</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.text.tertiary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  heroBox: { borderRadius: radii.lg, padding: 20, alignItems: 'center', marginBottom: 16 },
  bigIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  langTitle: { fontSize: 28, fontWeight: '800', color: colors.text.primary },
  langTagline: { color: colors.text.secondary, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 12, marginTop: 8 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, borderWidth: 2, borderColor: colors.border, alignItems: 'center', backgroundColor: '#FFF' },
  tabText: { fontWeight: '700', color: colors.text.primary, fontSize: 13 },
  completionBox: { backgroundColor: '#FFF', borderRadius: radii.md, padding: 16, borderWidth: 2, borderColor: colors.border, marginBottom: 16 },
  completionLabel: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' },
  completionPercent: { fontSize: 32, fontWeight: '900', color: colors.text.primary, marginVertical: 6 },
  list: { gap: 8 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', borderRadius: radii.md, padding: 12, borderWidth: 2, borderColor: colors.border },
  lessonIdx: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  lessonIdxText: { fontWeight: '800', fontSize: 14 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  lessonSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
});
