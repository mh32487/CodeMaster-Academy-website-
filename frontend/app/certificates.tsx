import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { tokenStore } from '../src/api';
import { colors, radii, spacing } from '../src/theme';
import { PrimaryButton } from '../src/components';
import { t, localized, Lang } from '../src/i18n';

export default function Certificates() {
  const { lang, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/certificates/me'); setItems(data); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="certificates-screen">
      <Stack.Screen options={{ title: t('certificates', lang) }} />
      <Text style={styles.title}>I tuoi certificati</Text>
      <Text style={styles.sub}>Completa un corso al 100% per ottenere il certificato.</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="certificate-outline" size={56} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Nessun certificato ancora</Text>
          <Text style={styles.emptyDesc}>Completa tutte le lezioni di un corso per ottenere il tuo primo certificato.</Text>
        </View>
      ) : (
        <View style={{ gap: 12, marginTop: 16 }}>
          {items.map((c) => (
            <View key={c.id} style={styles.cert} testID={`cert-${c.id}`}>
              <View style={styles.certHeader}>
                <MaterialCommunityIcons name="certificate" size={36} color={colors.primary.purple} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitle}>{c.language_name} - {localized(c.course_title, lang as Lang)}</Text>
                  <Text style={styles.certIssued}>Rilasciato a {c.issued_to}</Text>
                </View>
              </View>
              <View style={styles.certBody}>
                <Text style={styles.certText}>Certificato di completamento</Text>
                <Text style={styles.certName}>{c.issued_to}</Text>
                <Text style={styles.certCourse}>{c.language_name}</Text>
              </View>
              <PrimaryButton
                label="📄 Scarica PDF"
                variant="ghost"
                onPress={async () => {
                  const base = process.env.EXPO_PUBLIC_BACKEND_URL || '';
                  const url = `${base}/api/certificates/pdf/${c.course_id}`;
                  const token = await tokenStore.get();
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    // Fetch with auth and trigger download
                    try {
                      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                      const blob = await res.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = blobUrl; a.download = `certificate_${c.id}.pdf`;
                      document.body.appendChild(a); a.click(); a.remove();
                      URL.revokeObjectURL(blobUrl);
                    } catch (e) { Alert.alert('Errore', 'Download fallito'); }
                  } else {
                    await Linking.openURL(`${url}?token=${token}`).catch(() => Alert.alert('Apri nel browser', url));
                  }
                }}
                testID={`download-cert-${c.id}`}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  sub: { color: colors.text.secondary, marginTop: 4 },
  empty: { alignItems: 'center', padding: 32, marginTop: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginTop: 16 },
  emptyDesc: { color: colors.text.secondary, textAlign: 'center', marginTop: 8 },
  cert: { backgroundColor: '#FFF', borderRadius: radii.lg, padding: 16, borderWidth: 2, borderColor: colors.primary.purple + '30' },
  certHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  certTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
  certIssued: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  certBody: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary.purple + '50', borderRadius: radii.md, padding: 24, alignItems: 'center', backgroundColor: colors.primary.purple + '08', marginBottom: 12 },
  certText: { fontSize: 12, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 2 },
  certName: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  certCourse: { fontSize: 14, color: colors.primary.purple, fontWeight: '700', marginTop: 4 },
});
