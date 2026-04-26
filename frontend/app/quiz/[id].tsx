import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton, ProgressBar } from '../../src/components';
import { localized, t, Lang } from '../../src/i18n';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lang, refresh } = useAuth();
  const [quiz, setQuiz] = useState<any>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        setQuiz(data);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  if (!quiz) return null;

  const total = quiz.questions.length;
  const q = quiz.questions[idx];
  const progress = ((idx) / total) * 100;

  const onNext = async () => {
    if (selected === null) return;
    const newAns = [...answers, selected];
    setAnswers(newAns);
    setSelected(null);
    if (idx + 1 >= total) {
      setSubmitting(true);
      try {
        const { data } = await api.post('/quizzes/submit', { quiz_id: id, answers: newAns });
        setResult(data);
        await refresh();
      } finally { setSubmitting(false); }
    } else {
      setIdx(idx + 1);
    }
  };

  if (result) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']} testID="quiz-result-screen">
        <Stack.Screen options={{ title: 'Risultato' }} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.resultHero, { backgroundColor: result.passed ? colors.status.success + '15' : colors.status.error + '15' }]}>
            <MaterialCommunityIcons name={result.passed ? 'trophy' : 'close-circle'} size={64} color={result.passed ? colors.status.success : colors.status.error} />
            <Text style={[styles.resultTitle, { color: result.passed ? colors.status.success : colors.status.error }]} testID="quiz-passed-text">
              {result.passed ? t('passed', lang) : t('failed', lang)}
            </Text>
            <Text style={styles.scoreBig} testID="quiz-score">{result.score}%</Text>
            <Text style={styles.scoreSub}>{result.correct} / {result.total} corrette · +{result.xp_gained} XP</Text>
          </View>

          <Text style={styles.reviewTitle}>Correzione</Text>
          {result.review.map((r: any, i: number) => (
            <View key={i} style={[styles.reviewItem, { borderColor: r.is_correct ? colors.status.success : colors.status.error }]}>
              <Text style={styles.reviewQ}>{i + 1}. {localized(r.question, lang as Lang)}</Text>
              <View style={styles.reviewLine}>
                <MaterialCommunityIcons name={r.is_correct ? 'check-circle' : 'close-circle'} size={18} color={r.is_correct ? colors.status.success : colors.status.error} />
                <Text style={styles.reviewExp}>{localized(r.explanation, lang as Lang)}</Text>
              </View>
            </View>
          ))}

          <View style={{ marginTop: 24, gap: 12 }}>
            <PrimaryButton label={t('retry', lang)} variant="ghost" onPress={() => { setResult(null); setIdx(0); setAnswers([]); setSelected(null); }} testID="quiz-retry-btn" />
            <PrimaryButton label="Torna al corso" onPress={() => router.back()} testID="quiz-back-btn" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.main }} testID="quiz-screen">
      <Stack.Screen options={{ title: 'Quiz' }} />
      <View style={styles.topBar}>
        <ProgressBar percent={progress} />
        <Text style={styles.progress}>{idx + 1} / {total}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{localized(q.question, lang as Lang)}</Text>
        <View style={{ gap: 10, marginTop: 16 }}>
          {q.options.map((opt: any, i: number) => {
            const isSel = selected === i;
            return (
              <TouchableOpacity
                key={i}
                testID={`option-${i}`}
                activeOpacity={0.85}
                onPress={() => setSelected(i)}
                style={[styles.option, isSel && { borderColor: colors.primary.blue, backgroundColor: colors.primary.blue + '10' }]}
              >
                <View style={[styles.optionRadio, isSel && { borderColor: colors.primary.blue, backgroundColor: colors.primary.blue }]}>
                  {isSel && <MaterialCommunityIcons name="check" size={14} color="#FFF" />}
                </View>
                <Text style={[styles.optionText, isSel && { color: colors.primary.blue }]}>{localized(opt, lang as Lang)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <PrimaryButton
          label={idx + 1 >= total ? t('submit', lang) : t('next', lang)}
          onPress={onNext}
          disabled={selected === null}
          loading={submitting}
          testID="quiz-next-btn"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  topBar: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: 6 },
  progress: { fontSize: 12, color: colors.text.secondary, fontWeight: '700', alignSelf: 'flex-end' },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  question: { fontSize: 22, fontWeight: '800', color: colors.text.primary, lineHeight: 30 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFF', borderRadius: radii.md, borderWidth: 2, borderColor: colors.border },
  optionRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text.primary },
  footer: { padding: spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: colors.border },
  resultHero: { borderRadius: radii.lg, padding: 24, alignItems: 'center', marginBottom: 24 },
  resultTitle: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  scoreBig: { fontSize: 56, fontWeight: '900', color: colors.text.primary, marginTop: 8 },
  scoreSub: { color: colors.text.secondary, fontWeight: '600' },
  reviewTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 12 },
  reviewItem: { backgroundColor: '#FFF', borderRadius: radii.md, padding: 14, marginBottom: 10, borderWidth: 2 },
  reviewQ: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  reviewLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reviewExp: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
});
