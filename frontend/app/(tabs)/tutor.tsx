import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/api';
import { useAuth } from '../../src/AuthContext';
import { colors, radii, spacing } from '../../src/theme';
import { t } from '../../src/i18n';

type Msg = { role: 'user' | 'assistant'; content: string; ts: number };

export default function Tutor() {
  const { lang } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Ciao! Sono il tuo AI Tutor. Posso spiegarti concetti, correggere il codice e suggerirti esercizi. Cosa vuoi imparare oggi?', ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: 'user', content: text, ts: Date.now() }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/tutor/chat', {
        message: text,
        language: lang,
        session_id: sessionRef.current || undefined,
      });
      sessionRef.current = data.session_id;
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, ts: Date.now() }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Errore di connessione. Riprova.', ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Spiegami le funzioni in Python',
    'Cos\'è una closure in JavaScript?',
    'Differenza tra let e const',
    'Come funziona Flexbox?',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="tutor-screen">
      <View style={styles.header}>
        <View style={styles.avatarBox}>
          <MaterialCommunityIcons name="robot-happy" size={24} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          <Text style={styles.headerSub}>Pronto ad aiutarti · GPT-5.2</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m, idx) => (
            <View key={idx} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]} testID={`tutor-msg-${idx}`}>
              <Text style={[styles.bubbleText, m.role === 'user' ? { color: '#FFF' } : { color: colors.text.primary }]}>{m.content}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator color={colors.primary.purple} />
            </View>
          )}

          {messages.length <= 1 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggLabel}>Prova a chiedere:</Text>
              {suggestions.map((s) => (
                <TouchableOpacity key={s} style={styles.suggBtn} onPress={() => setInput(s)} testID={`sugg-${s.slice(0, 8)}`}>
                  <Text style={styles.suggText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            testID="tutor-input"
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('ask_tutor', lang)}
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={500}
            onSubmitEditing={send}
          />
          <TouchableOpacity testID="tutor-send" style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]} onPress={send} disabled={!input.trim() || loading} activeOpacity={0.8}>
            <MaterialCommunityIcons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: '#FFF' },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.purple, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  headerSub: { fontSize: 12, color: colors.status.success, fontWeight: '600' },
  chatScroll: { padding: spacing.md, paddingBottom: 16, gap: 10 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: radii.lg, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: colors.primary.blue, alignSelf: 'flex-end', borderBottomRightRadius: 4, borderBottomLeftRadius: radii.lg },
  aiBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#FFF' },
  input: { flex: 1, backgroundColor: colors.bg.main, borderRadius: radii.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text.primary, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.purple, alignItems: 'center', justifyContent: 'center' },
  suggestions: { marginTop: 16, gap: 8 },
  suggLabel: { fontSize: 13, color: colors.text.secondary, marginBottom: 4 },
  suggBtn: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.primary.purple + '40' },
  suggText: { color: colors.primary.purple, fontWeight: '600', fontSize: 13 },
});
