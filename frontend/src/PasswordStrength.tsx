import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from './theme';

interface Props { password: string; lang?: 'it' | 'en' }

export default function PasswordStrength({ password, lang = 'it' }: Props) {
  const checks = [
    { ok: password.length >= 8, label_it: 'Almeno 8 caratteri', label_en: 'At least 8 characters' },
    { ok: /[A-Z]/.test(password), label_it: '1 maiuscola', label_en: '1 uppercase letter' },
    { ok: /[0-9]/.test(password), label_it: '1 numero', label_en: '1 number' },
    { ok: /[^A-Za-z0-9]/.test(password), label_it: '1 simbolo (es. ! @ # $)', label_en: '1 symbol (e.g. ! @ # $)' },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors_arr = ['#EF4444', '#F59E0B', '#F59E0B', '#22C55E', '#22C55E'];
  const labels = ['', 'Debole', 'Media', 'Buona', 'Forte'];
  const labels_en = ['', 'Weak', 'Medium', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <View style={styles.box} testID="password-strength">
      <View style={styles.barRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.bar, { backgroundColor: i < score ? colors_arr[score] : colors.border }]} />
        ))}
      </View>
      <Text style={[styles.scoreLabel, { color: colors_arr[score] }]}>
        {lang === 'it' ? labels[score] : labels_en[score]}
      </Text>
      <View style={styles.checks}>
        {checks.map((c, i) => (
          <View key={i} style={styles.checkRow}>
            <MaterialCommunityIcons name={c.ok ? 'check-circle' : 'circle-outline'} size={14} color={c.ok ? '#22C55E' : colors.text.tertiary} />
            <Text style={[styles.checkText, c.ok && { color: colors.text.primary }]}>
              {lang === 'it' ? c.label_it : c.label_en}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 8 },
  barRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  scoreLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  checks: { gap: 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkText: { fontSize: 12, color: colors.text.tertiary },
});
