import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../src/AuthContext';
import { colors, fontSize, radii, spacing } from '../src/theme';
import { PrimaryButton } from '../src/components';
import { t } from '../src/i18n';

export default function Splash() {
  const router = useRouter();
  const { user, loading, lang } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        // First-time users go through onboarding
        AsyncStorage.getItem('onboarding_done').then((done) => {
          if (!done) router.replace('/onboarding');
        });
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={styles.center} testID="splash-loading">
        <ActivityIndicator size="large" color={colors.primary.blue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="splash-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="rocket-launch" size={56} color="#FFF" />
          </View>
          <Text style={styles.brand} testID="brand-name">CodeMaster</Text>
          <Text style={styles.brandAccent}>Academy</Text>
          <Text style={styles.subtitle}>{t('hero_subtitle', lang)}</Text>
        </View>

        <View style={styles.features}>
          <Feature icon="code-tags" label="17 linguaggi" />
          <Feature icon="trophy" label="Badge & certificati" />
          <Feature icon="robot-happy" label="AI Tutor 24/7" />
          <Feature icon="account-group" label="Classifica community" />
        </View>

        <View style={styles.ctaWrap}>
          <PrimaryButton
            label={t('start_now', lang)}
            onPress={() => router.push('/(auth)/register')}
            testID="start-now-btn"
          />
          <PrimaryButton
            label={t('login', lang)}
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
            testID="splash-login-btn"
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.feat}>
      <View style={styles.featIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.primary.blue} />
      </View>
      <Text style={styles.featLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: 48 },
  logoCircle: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: colors.primary.blue,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 6, borderBottomColor: colors.primary.blueDark,
    shadowColor: colors.primary.blue, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  brand: { fontSize: 40, fontWeight: '800', color: colors.text.primary, marginTop: 24, letterSpacing: -1 },
  brandAccent: { fontSize: 32, fontWeight: '800', color: colors.primary.purple, marginTop: -4, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: colors.text.secondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 16, lineHeight: 22 },
  features: { marginTop: 32, gap: 12 },
  feat: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, gap: 12 },
  featIcon: { width: 36, height: 36, borderRadius: radii.sm, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center' },
  featLabel: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  ctaWrap: { marginTop: 32, marginBottom: 24 },
});
