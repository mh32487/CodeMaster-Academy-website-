import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Pressable, Alert, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { PrimaryButton } from '../src/components';
import PasswordStrength from '../src/PasswordStrength';

export default function Security() {
  const router = useRouter();
  const { user, lang, logout } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState('');

  const load = async () => {
    try {
      const [s, h] = await Promise.all([
        api.get('/auth/sessions'),
        api.get('/auth/login-history').catch(() => ({ data: [] })),
      ]);
      setSessions(s.data); setHistory(h.data);
    } catch (e) { console.warn(e); }
  };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const revokeSession = (id: string, isCurrent: boolean) => {
    if (isCurrent) {
      Alert.alert(lang === 'it' ? 'Logout' : 'Logout', lang === 'it' ? 'Vuoi disconnetterti da questo dispositivo?' : 'Sign out of this device?', [
        { text: 'Annulla', style: 'cancel' },
        { text: lang === 'it' ? 'Esci' : 'Sign out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
      ]);
      return;
    }
    Alert.alert(lang === 'it' ? 'Revoca sessione' : 'Revoke session', lang === 'it' ? 'Disconnettere questo dispositivo?' : 'Sign out this device?', [
      { text: 'Annulla', style: 'cancel' },
      { text: lang === 'it' ? 'Revoca' : 'Revoke', style: 'destructive', onPress: async () => {
        try { await api.post(`/auth/sessions/${id}/revoke`); load(); }
        catch (e: any) { Alert.alert('Errore', e?.response?.data?.detail || 'Errore'); }
      } },
    ]);
  };

  const revokeAllOthers = () => {
    Alert.alert(lang === 'it' ? 'Esci da tutti gli altri' : 'Sign out everywhere else', lang === 'it' ? 'Disconnettere tutti gli altri dispositivi?' : 'Sign out all other devices?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'OK', style: 'destructive', onPress: async () => {
        try { const { data } = await api.post('/auth/sessions/revoke-all-others'); Alert.alert('OK', `Revocate ${data.revoked_count} sessioni`); load(); }
        catch (e: any) { Alert.alert('Errore', e?.response?.data?.detail || 'Errore'); }
      } },
    ]);
  };

  const submitChangePwd = async () => {
    setCpError('');
    if (newPwd !== confirmPwd) { setCpError(lang === 'it' ? 'Le password non coincidono' : 'Passwords do not match'); return; }
    setCpLoading(true);
    try {
      await api.post('/auth/change-password', { current_password: currentPwd, new_password: newPwd, lang });
      Alert.alert('OK', lang === 'it' ? 'Password aggiornata' : 'Password updated');
      setShowCp(false); setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      setCpError(e?.response?.data?.detail || 'Errore');
    } finally { setCpLoading(false); }
  };

  const resendVerify = async () => {
    try { await api.post('/auth/resend-verification'); Alert.alert('OK', lang === 'it' ? 'Email di verifica inviata' : 'Verification email sent'); }
    catch (e: any) { Alert.alert('Errore', e?.response?.data?.detail || 'Errore'); }
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.main }}>
      <Stack.Screen options={{ title: lang === 'it' ? 'Sicurezza' : 'Security' }} />
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} testID="security-screen">
        <Text style={styles.h1}>{lang === 'it' ? 'Sicurezza account' : 'Account security'}</Text>
        <Text style={styles.sub}>{user?.email}</Text>

        {/* Email verified status */}
        <View style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons name={(user as any)?.email_verified ? 'email-check' : 'email-alert'} size={24} color={(user as any)?.email_verified ? '#22C55E' : '#F59E0B'} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{lang === 'it' ? 'Email' : 'Email'}</Text>
              <Text style={styles.cardSub}>{(user as any)?.email_verified ? (lang === 'it' ? 'Verificata' : 'Verified') : (lang === 'it' ? 'Non verificata' : 'Not verified')}</Text>
            </View>
            {!(user as any)?.email_verified && (
              <Pressable onPress={resendVerify} style={styles.btnGhost} testID="resend-verify">
                <Text style={styles.btnGhostText}>{lang === 'it' ? 'Reinvia' : 'Resend'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Change password */}
        <View style={styles.card}>
          <Pressable onPress={() => setShowCp(!showCp)} style={styles.row} testID="toggle-change-pwd">
            <MaterialCommunityIcons name="lock" size={24} color={colors.primary.blue} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{lang === 'it' ? 'Cambia password' : 'Change password'}</Text>
              <Text style={styles.cardSub}>{lang === 'it' ? 'Aggiorna la tua password' : 'Update your password'}</Text>
            </View>
            <MaterialCommunityIcons name={showCp ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text.secondary} />
          </Pressable>
          {showCp && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.label}>{lang === 'it' ? 'Password attuale' : 'Current password'}</Text>
              <TextInput testID="current-pwd" style={styles.input} secureTextEntry value={currentPwd} onChangeText={setCurrentPwd} />
              <Text style={[styles.label, { marginTop: 12 }]}>{lang === 'it' ? 'Nuova password' : 'New password'}</Text>
              <TextInput testID="new-pwd" style={styles.input} secureTextEntry value={newPwd} onChangeText={setNewPwd} />
              <PasswordStrength password={newPwd} lang={lang as any} />
              <Text style={[styles.label, { marginTop: 12 }]}>{lang === 'it' ? 'Conferma' : 'Confirm'}</Text>
              <TextInput testID="confirm-pwd" style={styles.input} secureTextEntry value={confirmPwd} onChangeText={setConfirmPwd} />
              {!!cpError && <Text style={styles.error}>{cpError}</Text>}
              <PrimaryButton label={lang === 'it' ? 'Aggiorna password' : 'Update password'} onPress={submitChangePwd} loading={cpLoading} testID="change-pwd-submit" style={{ marginTop: 12 }} />
            </View>
          )}
        </View>

        {/* Active sessions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.h2}>{lang === 'it' ? 'Sessioni attive' : 'Active sessions'}</Text>
          {sessions.length > 1 && (
            <Pressable onPress={revokeAllOthers} testID="revoke-all-others">
              <Text style={styles.linkRed}>{lang === 'it' ? 'Esci da tutte le altre' : 'Sign out all others'}</Text>
            </Pressable>
          )}
        </View>
        <View style={{ gap: 8 }}>
          {sessions.map((s) => (
            <View key={s.id} style={[styles.sessionCard, s.is_current && { borderColor: colors.primary.blue, borderWidth: 2 }]} testID={`session-${s.id}`}>
              <View style={styles.sessionIcon}>
                <MaterialCommunityIcons name={s.device_label?.includes('iOS') ? 'cellphone-iphone' : s.device_label?.includes('Android') ? 'cellphone-android' : s.device_label?.includes('Mac') ? 'apple' : s.device_label?.includes('Windows') ? 'microsoft-windows' : 'laptop'} size={28} color={colors.primary.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.sessionLabel}>{s.device_label}</Text>
                  {s.is_current && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>{lang === 'it' ? 'ATTUALE' : 'CURRENT'}</Text></View>}
                </View>
                <Text style={styles.sessionMeta}>IP: {s.ip}</Text>
                <Text style={styles.sessionMeta}>{lang === 'it' ? 'Creata' : 'Created'}: {new Date(s.created_at).toLocaleString()}</Text>
              </View>
              <Pressable onPress={() => revokeSession(s.id, s.is_current)} style={styles.revokeBtn} testID={`revoke-${s.id}`}>
                <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Login history */}
        <Text style={[styles.h2, { marginTop: 24 }]}>{lang === 'it' ? 'Cronologia accessi' : 'Login history'}</Text>
        <View style={{ gap: 6 }}>
          {history.slice(0, 15).map((h, i) => (
            <View key={i} style={styles.historyRow} testID={`history-${i}`}>
              <MaterialCommunityIcons name={h.success ? 'check-circle' : 'close-circle'} size={18} color={h.success ? '#22C55E' : '#EF4444'} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyLabel}>{h.device_label} • {h.ip}</Text>
                <Text style={styles.historyMeta}>{new Date(h.created_at).toLocaleString()} • {h.reason}</Text>
              </View>
            </View>
          ))}
          {history.length === 0 && <Text style={styles.empty}>{lang === 'it' ? 'Nessun accesso registrato' : 'No login records'}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  sub: { color: colors.text.secondary, marginTop: 4, marginBottom: 16 },
  h2: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: radii.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  cardSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  btnGhost: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.primary.blue },
  btnGhostText: { color: colors.primary.blue, fontWeight: '700', fontSize: 12 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: colors.text.primary },
  error: { color: '#EF4444', fontSize: 13, marginTop: 8 },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#FFF', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  sessionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center' },
  sessionLabel: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  sessionMeta: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  currentBadge: { backgroundColor: colors.primary.blue, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm },
  currentBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  revokeBtn: { padding: 8 },
  linkRed: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#FFF', borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border },
  historyLabel: { fontSize: 13, fontWeight: '600', color: colors.text.primary },
  historyMeta: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  empty: { color: colors.text.tertiary, fontStyle: 'italic', textAlign: 'center', padding: 16 },
});
