import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, fontSize } from './theme';

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  testID,
  variant = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  variant?: 'primary' | 'purple' | 'ghost' | 'success';
  style?: ViewStyle;
}) {
  const bg = variant === 'purple' ? colors.primary.purple : variant === 'success' ? colors.status.success : variant === 'ghost' ? 'transparent' : colors.primary.blue;
  const border = variant === 'purple' ? colors.primary.purpleDark : variant === 'success' ? '#16A34A' : variant === 'ghost' ? colors.border : colors.primary.blueDark;
  const txtColor = variant === 'ghost' ? colors.primary.blue : '#FFF';

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.85}
      disabled={loading || disabled}
      onPress={onPress}
      style={[
        styles.btn,
        { backgroundColor: bg, borderBottomColor: border, opacity: disabled ? 0.5 : 1 },
        variant === 'ghost' && { borderWidth: 2, borderColor: colors.border, borderBottomWidth: 4 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} />
      ) : (
        <Text style={[styles.btnText, { color: txtColor } as TextStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ProgressBar({ percent, color = colors.primary.blue }: { percent: number; color?: string }) {
  const safe = Math.max(0, Math.min(100, percent || 0));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safe}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Badge({ label, color = colors.primary.blue }: { label: string; color?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <View style={styles.codeBlock}>
      <Text style={styles.codeText} selectable>{code}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 56,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 4,
  },
  btnText: { fontSize: fontSize.body, fontWeight: '800', letterSpacing: 0.3 },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.divider,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  codeBlock: {
    backgroundColor: colors.bg.code,
    borderRadius: radii.md,
    padding: 16,
  },
  codeText: {
    color: colors.text.code,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
});
