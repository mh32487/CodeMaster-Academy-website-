import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, P, useMarketingLang, useResponsive } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';
import api from '../../src/api';

export default function Contact() {
  const [lang, setLang] = useMarketingLang();
  const { isMobile } = useResponsive();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(lang === 'it' ? 'Compila tutti i campi obbligatori' : 'Please fill all required fields');
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', { name: name.trim(), email: email.trim(), subject: subject.trim() || 'General inquiry', message: message.trim(), lang });
      setDone(true);
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (e: any) {
      setError(e?.response?.data?.detail || (lang === 'it' ? 'Errore. Riprova.' : 'Error. Please retry.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: '#FFF' }} testID="contact-page" stickyHeaderIndices={[0]}>
        <Stack.Screen options={{ title: 'Contact - CodeMaster Academy', headerShown: false }} />
        <WebHeader lang={lang} setLang={setLang} />
        <Section>
          <View style={{ maxWidth: 1000, alignSelf: 'center', width: '100%' }}>
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <H1>{mt('contact_title', lang)}</H1>
              <View style={{ marginTop: 12 }}><P center large>{mt('contact_subtitle', lang)}</P></View>
            </View>

            <View style={[styles.grid, isMobile && { flexDirection: 'column' }]}>
              <View style={[styles.formCol, isMobile && { width: '100%' }]}>
                {done ? (
                  <View style={styles.successBox} testID="contact-success">
                    <MaterialCommunityIcons name="check-circle" size={48} color="#22C55E" />
                    <Text style={styles.successText}>{mt('contact_success', lang)}</Text>
                    <Pressable onPress={() => setDone(false)} style={styles.retryBtn}>
                      <Text style={styles.retryText}>{lang === 'it' ? 'Invia un altro messaggio' : 'Send another message'}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <Field label={mt('contact_name', lang) + ' *'} value={name} onChangeText={setName} testID="contact-name" />
                    <Field label={mt('contact_email', lang) + ' *'} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" testID="contact-email" />
                    <Field label={mt('contact_subject', lang)} value={subject} onChangeText={setSubject} testID="contact-subject" />
                    <Field label={mt('contact_message', lang) + ' *'} value={message} onChangeText={setMessage} multiline numberOfLines={5} testID="contact-message" />
                    {!!error && <Text style={styles.error}>{error}</Text>}
                    <Pressable onPress={submit} disabled={sending} style={[styles.btn, sending && { opacity: 0.6 }]} testID="contact-submit">
                      {sending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{mt('contact_send', lang)}</Text>}
                    </Pressable>
                  </>
                )}
              </View>

              <View style={[styles.infoCol, isMobile && { width: '100%', marginTop: 24 }]}>
                <View style={styles.infoBox}>
                  <View style={[styles.infoIcon, { backgroundColor: colors.primary.blue + '15' }]}>
                    <MaterialCommunityIcons name="email" size={24} color={colors.primary.blue} />
                  </View>
                  <Text style={styles.infoLabel}>{mt('contact_email_label', lang)}</Text>
                  <Pressable onPress={() => Linking.openURL('mailto:support@codemaster.app')}>
                    <Text style={styles.infoValue}>support@codemaster.app</Text>
                  </Pressable>
                </View>
                <View style={styles.infoBox}>
                  <View style={[styles.infoIcon, { backgroundColor: '#22C55E15' }]}>
                    <MaterialCommunityIcons name="clock-fast" size={24} color="#22C55E" />
                  </View>
                  <Text style={styles.infoLabel}>{mt('contact_response_time', lang)}</Text>
                  <Text style={styles.infoValue}>{mt('contact_24h', lang)}</Text>
                </View>
                <View style={styles.infoBox}>
                  <View style={[styles.infoIcon, { backgroundColor: '#F59E0B15' }]}>
                    <MaterialCommunityIcons name="shield-check" size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.infoLabel}>{lang === 'it' ? 'Privacy' : 'Privacy'}</Text>
                  <Text style={styles.infoValueSmall}>{lang === 'it' ? 'I tuoi dati sono protetti GDPR' : 'Your data is GDPR-protected'}</Text>
                </View>
              </View>
            </View>
          </View>
        </Section>
        <WebFooter lang={lang} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, multiline, numberOfLines, keyboardType, autoCapitalize, testID }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && { minHeight: 120, textAlignVertical: 'top' }]}
        testID={testID}
        placeholderTextColor={colors.text.tertiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 32 },
  formCol: { flex: 1.5 },
  infoCol: { flex: 1, gap: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 14, fontSize: 15, color: colors.text.primary },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 8 },
  btn: { backgroundColor: colors.primary.blue, borderRadius: radii.pill, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  successBox: { alignItems: 'center', padding: 32, backgroundColor: '#22C55E15', borderRadius: radii.lg, borderWidth: 2, borderColor: '#22C55E40' },
  successText: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8 },
  retryText: { color: colors.primary.blue, fontWeight: '700' },
  infoBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
  infoIcon: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '700', color: colors.primary.blue, marginTop: 4 },
  infoValueSmall: { fontSize: 14, color: colors.text.primary, marginTop: 4 },
});
