import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton, CodeBlock } from '../../src/components';
import { localized, t, Lang } from '../../src/i18n';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, refresh } = useAuth();
  const [ex, setEx] = useState<any>(null);
  const [code, setCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/exercises/${id}`);
        setEx(data);
        setCode(data.starter_code);
      } finally { setLoading(false); }
    })();
  }, [id]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/exercises/submit', { exercise_id: id, code });
      setResult(data);
      if (data.is_correct) await refresh();
    } catch (e: any) {
      Alert.alert('Errore', e?.response?.data?.detail || 'Riprova');
    } finally { setSubmitting(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  if (!ex) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.main }} testID="exercise-screen">
      <Stack.Screen options={{ title: t('exercise', lang) }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{localized(ex.title, lang as Lang)}</Text>
          <Text style={styles.body}>{localized(ex.instructions, lang as Lang)}</Text>

          <Text style={styles.label}>Il tuo codice</Text>
          <View style={styles.editor}>
            <TextInput
              testID="exercise-code-input"
              value={code}
              onChangeText={setCode}
              multiline
              style={styles.editorInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {ex.expected_output ? (
            <View style={styles.expected}>
              <Text style={styles.expectedLabel}>Output atteso:</Text>
              <Text style={styles.expectedVal}>{ex.expected_output}</Text>
            </View>
          ) : null}

          {result && (
            <View style={[styles.resultBox, { backgroundColor: (result.is_correct ? colors.status.success : colors.status.error) + '15', borderColor: result.is_correct ? colors.status.success : colors.status.error }]} testID="exercise-result">
              <MaterialCommunityIcons name={result.is_correct ? 'check-circle' : 'alert-circle'} size={28} color={result.is_correct ? colors.status.success : colors.status.error} />
              <Text style={[styles.resultText, { color: result.is_correct ? colors.status.success : colors.status.error }]}>
                {result.is_correct ? `Corretto! +${result.xp_gained} XP` : 'Non ancora corretto. Riprova!'}
              </Text>
            </View>
          )}

          {showSolution && (
            <>
              <Text style={styles.label}>Soluzione</Text>
              <CodeBlock code={ex.solution} />
            </>
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {!showSolution && (
            <PrimaryButton label={t('view_solution', lang)} variant="ghost" onPress={() => setShowSolution(true)} testID="show-solution-btn" style={{ marginBottom: 8 }} />
          )}
          <PrimaryButton label={t('submit', lang)} onPress={submit} loading={submitting} testID="submit-exercise-btn" />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  body: { fontSize: 15, color: colors.text.secondary, lineHeight: 22, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  editor: { backgroundColor: colors.bg.code, borderRadius: radii.md, padding: 12, minHeight: 140 },
  editorInput: { color: colors.text.code, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 14, lineHeight: 21, minHeight: 130, textAlignVertical: 'top' },
  expected: { marginTop: 12, padding: 12, backgroundColor: '#FFF', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  expectedLabel: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase' },
  expectedVal: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, color: colors.text.primary, marginTop: 4 },
  resultBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radii.md, borderWidth: 2, marginTop: 12 },
  resultText: { fontSize: 15, fontWeight: '800' },
  footer: { padding: spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: colors.border },
});
