import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, H2, P, useMarketingLang, useResponsive } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';

export default function Support() {
  const [lang, setLang] = useMarketingLang();
  const router = useRouter();
  const { isMobile } = useResponsive();

  const cards = [
    { icon: 'help-circle', title: lang === 'it' ? 'FAQ' : 'FAQ', desc: lang === 'it' ? 'Risposte alle domande più frequenti' : 'Answers to most common questions', onPress: () => router.push('/(marketing)/faq'), color: colors.primary.blue },
    { icon: 'email-fast', title: lang === 'it' ? 'Contattaci' : 'Contact us', desc: lang === 'it' ? 'Form di contatto, risposta entro 24h' : 'Contact form, reply within 24h', onPress: () => router.push('/(marketing)/contact'), color: colors.primary.purple },
    { icon: 'shield-check', title: lang === 'it' ? 'Privacy' : 'Privacy', desc: lang === 'it' ? 'Come trattiamo i tuoi dati' : 'How we handle your data', onPress: () => router.push('/(marketing)/privacy'), color: '#22C55E' },
    { icon: 'file-document', title: lang === 'it' ? 'Termini' : 'Terms', desc: lang === 'it' ? 'Termini di servizio completi' : 'Full terms of service', onPress: () => router.push('/(marketing)/terms'), color: '#F59E0B' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="support-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'Support - CodeMaster Academy', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />
      <Section>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <H1>{mt('support_title', lang)}</H1>
          <View style={{ marginTop: 12, maxWidth: 700 }}><P center large>{mt('support_subtitle', lang)}</P></View>
        </View>
        <View style={[styles.grid, isMobile && { flexDirection: 'column' }]}>
          {cards.map((c) => (
            <Pressable key={c.title} onPress={c.onPress} style={[styles.card, isMobile && { width: '100%' }]} testID={`support-${c.icon}`}>
              <View style={[styles.icon, { backgroundColor: c.color + '15' }]}>
                <MaterialCommunityIcons name={c.icon as any} size={28} color={c.color} />
              </View>
              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.desc}>{c.desc}</Text>
              <View style={styles.cardCta}>
                <Text style={[styles.cardCtaText, { color: c.color }]}>{lang === 'it' ? 'Apri' : 'Open'}</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={c.color} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Contact info block */}
        <View style={styles.contactBlock}>
          <H2 center>{lang === 'it' ? 'Hai bisogno di parlare con un umano?' : 'Need to talk to a human?'}</H2>
          <View style={{ marginTop: 12 }}><P center large>{lang === 'it' ? 'Scrivici alla nostra email di supporto. Rispondiamo in meno di 24 ore lavorative.' : 'Email our support team. We reply within 24 business hours.'}</P></View>
          <Pressable onPress={() => Linking.openURL('mailto:support@codemaster.app')} style={styles.emailBtn} testID="support-email-btn">
            <MaterialCommunityIcons name="email" size={20} color="#FFF" />
            <Text style={styles.emailBtnText}>support@codemaster.app</Text>
          </Pressable>
        </View>
      </Section>
      <WebFooter lang={lang} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card: { width: 260, backgroundColor: '#FFF', borderRadius: radii.lg, padding: 24, borderWidth: 1, borderColor: colors.border },
  icon: { width: 56, height: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  desc: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, minHeight: 44 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  cardCtaText: { fontWeight: '700', fontSize: 14 },
  contactBlock: { alignItems: 'center', marginTop: 64, padding: 32, backgroundColor: '#F8FAFC', borderRadius: radii.lg },
  emailBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary.blue, paddingHorizontal: 24, paddingVertical: 14, borderRadius: radii.pill, marginTop: 20 },
  emailBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
