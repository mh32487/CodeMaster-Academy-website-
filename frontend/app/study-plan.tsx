import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { PrimaryButton, Card } from '../src/components';

export default function StudyPlan() {
  const { lang } = useAuth();
  const [goal, setGoal] = useState('');
  const [hours, setHours] = useState('5');
  const [plan, setPlan] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/tutor/study-plan', { goal: goal.trim(), weekly_hours: parseInt(hours) || 5, user_lang: lang });
      setPlan(data.plan || []);
    } catch (e) { setPlan([]); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.main }} edges={['bottom']} testID="study-plan-screen">
      <Stack.Screen options={{ title: 'Piano di studio AI' }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <MaterialCommunityIcons name="calendar-clock" size={48} color={colors.primary.purple} />
            <Text style={styles.title}>Piano di studio personalizzato</Text>
            <Text style={styles.sub}>Il tuo AI Tutor crea un piano di 4 settimane in base ai tuoi obiettivi</Text>
          </View>

          <Card>
            <Text style={styles.label}>Il tuo obiettivo</Text>
            <TextInput
              testID="study-plan-goal"
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              placeholder="Es: diventare web developer, automazione Python..."
              placeholderTextColor={colors.text.tertiary}
              multiline
            />
            <Text style={[styles.label, { marginTop: 12 }]}>Ore disponibili a settimana</Text>
            <TextInput
              testID="study-plan-hours"
              style={[styles.input, { height: 48 }]}
              value={hours}
              onChangeText={setHours}
              keyboardType="number-pad"
              maxLength={2}
            />
            <PrimaryButton label="Genera piano" onPress={generate} loading={loading} testID="generate-plan-btn" variant="purple" style={{ marginTop: 16 }} disabled={!goal.trim()} />
          </Card>

          {plan && plan.length === 0 && !loading && (
            <Text style={styles.empty}>Nessun piano generato. Riprova.</Text>
          )}

          {plan && plan.length > 0 && (
            <View style={{ marginTop: 16, gap: 12 }}>
              <Text style={styles.sectionTitle}>Il tuo piano</Text>
              {plan.map((week: any, i: number) => (
                <Card key={i} style={[{ borderLeftWidth: 4, borderLeftColor: colors.primary.purple }]}>
                  <View style={styles.weekHeader}>
                    <View style={styles.weekBadge}>
                      <Text style={styles.weekBadgeText}>S{week.week || i + 1}</Text>
                    </View>
                    <Text style={styles.weekTheme}>{week.theme}</Text>
                  </View>
                  <Text style={styles.weekHours}>~{week.estimated_hours || hours}h • {week.practice}</Text>
                  <View style={{ marginTop: 8 }}>
                    {(week.topics || []).map((topic: string, j: number) => (
                      <View key={j} style={styles.topicRow}>
                        <MaterialCommunityIcons name="circle-medium" size={14} color={colors.primary.purple} />
                        <Text style={styles.topicText}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: 32 },
  hero: { alignItems: 'center', padding: 16, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 12, textAlign: 'center' },
  sub: { color: colors.text.secondary, marginTop: 6, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: colors.bg.main, borderRadius: radii.md, padding: 12, fontSize: 15, color: colors.text.primary, borderWidth: 1, borderColor: colors.border, minHeight: 56 },
  empty: { textAlign: 'center', color: colors.text.secondary, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  weekBadge: { backgroundColor: colors.primary.purple, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  weekBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  weekTheme: { fontSize: 16, fontWeight: '800', color: colors.text.primary, flex: 1 },
  weekHours: { fontSize: 12, color: colors.text.secondary, fontStyle: 'italic' },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topicText: { fontSize: 13, color: colors.text.primary, flex: 1 },
});
