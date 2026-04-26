import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { PrimaryButton } from '../../src/components';
import { t } from '../../src/i18n';

export default function Register() {
  const router = useRouter();
  const { register, lang } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Errore', 'Password deve avere almeno 6 caratteri');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim(), refCode.trim() || undefined);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Registrazione fallita', e?.response?.data?.detail || 'Riprova');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="register-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back} testID="back-btn">
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>{t('register', lang)}</Text>
          <Text style={styles.subtitle}>Crea il tuo account in 30 secondi.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>{t('name', lang)}</Text>
            <TextInput testID="register-name" style={styles.input} value={name} onChangeText={setName} placeholder="Mario Rossi" placeholderTextColor={colors.text.tertiary} />

            <Text style={[styles.label, { marginTop: 16 }]}>{t('email', lang)}</Text>
            <TextInput testID="register-email" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="tu@email.com" placeholderTextColor={colors.text.tertiary} />

            <Text style={[styles.label, { marginTop: 16 }]}>{t('password', lang)}</Text>
            <TextInput testID="register-password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Almeno 6 caratteri" placeholderTextColor={colors.text.tertiary} />

            <Text style={[styles.label, { marginTop: 16 }]}>{t('referral_code_optional', lang)}</Text>
            <TextInput testID="register-referral" style={styles.input} autoCapitalize="characters" value={refCode} onChangeText={setRefCode} placeholder="ABCD1234" placeholderTextColor={colors.text.tertiary} />
          </View>

          <PrimaryButton label={t('register', lang)} onPress={onSubmit} loading={loading} testID="register-submit" style={{ marginTop: 24 }} variant="purple" />

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('have_account', lang)} </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity testID="go-login">
                <Text style={styles.link}>{t('login', lang)}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  scroll: { padding: spacing.lg, flexGrow: 1 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: colors.text.primary, marginTop: 24 },
  subtitle: { fontSize: 16, color: colors.text.secondary, marginTop: 8 },
  form: { marginTop: 32 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFF', height: 52, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, paddingHorizontal: 16, fontSize: 16, color: colors.text.primary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: colors.text.secondary },
  link: { color: colors.primary.purple, fontWeight: '700' },
});
