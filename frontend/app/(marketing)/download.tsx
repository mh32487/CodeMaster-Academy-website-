import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, H2, P, useMarketingLang, useResponsive, MAX_W } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';

export default function Download() {
  const [lang, setLang] = useMarketingLang();
  const { isMobile } = useResponsive();
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="download-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'Download - CodeMaster Academy', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />

      <Section>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <H1>{mt('download_title', lang)}</H1>
          <View style={{ marginTop: 12, maxWidth: 700 }}><P center large>{mt('download_subtitle', lang)}</P></View>
        </View>

        <View style={[styles.storeRow, isMobile && { flexDirection: 'column' }]}>
          {/* App Store */}
          <View style={[styles.storeBtn, isMobile && { width: '100%' }]} testID="appstore-btn">
            <MaterialCommunityIcons name="apple" size={36} color="#FFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.storeSub}>{mt('download_coming', lang)}</Text>
              <Text style={styles.storeName}>{mt('download_appstore', lang)}</Text>
            </View>
          </View>
          {/* Google Play */}
          <View style={[styles.storeBtn, isMobile && { width: '100%' }]} testID="playstore-btn">
            <MaterialCommunityIcons name="google-play" size={32} color="#FFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.storeSub}>{mt('download_coming', lang)}</Text>
              <Text style={styles.storeName}>{mt('download_playstore', lang)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{lang === 'it' ? 'oppure' : 'or'}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Use on web */}
        <View style={styles.webBox}>
          <View style={styles.webIcon}>
            <MaterialCommunityIcons name="laptop" size={36} color={colors.primary.blue} />
          </View>
          <H2 center>{mt('download_web', lang)}</H2>
          <View style={{ marginTop: 8, marginBottom: 20 }}>
            <P center>{lang === 'it' ? 'Inizia a studiare subito dal tuo browser. Sincronizzazione automatica con l\'app mobile quando sarà disponibile.' : 'Start learning right from your browser. Automatic sync with the mobile app when available.'}</P>
          </View>
          <Pressable onPress={() => router.push('/(auth)/register')} style={styles.webBtn} testID="download-web-cta">
            <Text style={styles.webBtnText}>{lang === 'it' ? 'Inizia gratis sul web' : 'Start free on the web'}</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </Pressable>
        </View>

        {/* Beta via Expo Go */}
        <View style={styles.betaBox}>
          <View style={styles.betaInner}>
            <View style={{ flex: 1 }}>
              <View style={styles.betaTag}><Text style={styles.betaTagText}>{lang === 'it' ? 'BETA' : 'BETA'}</Text></View>
              <Text style={styles.betaTitle}>{lang === 'it' ? 'Prova subito sul tuo telefono' : 'Try it on your phone now'}</Text>
              <Text style={styles.betaDesc}>{mt('download_qr', lang)}</Text>
              <View style={styles.betaSteps}>
                <Step n={1} text={lang === 'it' ? 'Scarica Expo Go (App Store / Google Play)' : 'Download Expo Go (App Store / Google Play)'} />
                <Step n={2} text={lang === 'it' ? 'Apri la fotocamera o l\'app Expo Go' : 'Open camera or Expo Go app'} />
                <Step n={3} text={lang === 'it' ? 'Scansiona il QR code qui a fianco' : 'Scan the QR code on the side'} />
              </View>
            </View>
            <View style={styles.qrPlaceholder}>
              <MaterialCommunityIcons name="qrcode" size={120} color={colors.text.primary} />
              <Text style={styles.qrLabel}>QR Code</Text>
              <Text style={styles.qrSub}>{lang === 'it' ? 'Disponibile dopo build EAS' : 'Available after EAS build'}</Text>
            </View>
          </View>
        </View>
      </Section>

      <WebFooter lang={lang} />
    </ScrollView>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}><Text style={styles.stepNumText}>{n}</Text></View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  storeRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  storeBtn: { width: 280, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0F172A', borderRadius: radii.md, padding: 16 },
  storeSub: { color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  storeName: { color: '#FFF', fontSize: 15, fontWeight: '800', marginTop: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 32, justifyContent: 'center' },
  dividerLine: { width: 80, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.text.tertiary, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  webBox: { alignItems: 'center', padding: 32, backgroundColor: '#F8FAFC', borderRadius: radii.lg },
  webIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  webBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary.blue, paddingHorizontal: 24, paddingVertical: 14, borderRadius: radii.pill },
  webBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  betaBox: { marginTop: 32, padding: 24, backgroundColor: '#FFF', borderRadius: radii.lg, borderWidth: 2, borderColor: colors.primary.purple, borderStyle: 'dashed' },
  betaInner: { flexDirection: 'row', gap: 24, alignItems: 'center', flexWrap: 'wrap' },
  betaTag: { alignSelf: 'flex-start', backgroundColor: colors.primary.purple, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.sm, marginBottom: 8 },
  betaTagText: { color: '#FFF', fontWeight: '900', fontSize: 11 },
  betaTitle: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  betaDesc: { fontSize: 14, color: colors.text.secondary, marginBottom: 12, lineHeight: 22 },
  betaSteps: { gap: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary.purple, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  stepText: { fontSize: 14, color: colors.text.primary, flex: 1 },
  qrPlaceholder: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: radii.md, alignItems: 'center', minWidth: 180 },
  qrLabel: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, marginTop: 4 },
  qrSub: { fontSize: 11, color: colors.text.tertiary, marginTop: 2 },
});
