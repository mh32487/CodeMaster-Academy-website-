import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { Card, PrimaryButton } from '../src/components';

export default function Affiliate() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayout, setShowPayout] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'paypal' | 'bank_transfer'>('paypal');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/affiliate/me/summary'); setData(data); }
    catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const requestPayout = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 50) { Alert.alert('Errore', 'Importo minimo €50'); return; }
    if (!details.trim()) { Alert.alert('Errore', method === 'paypal' ? 'Inserisci email PayPal' : 'Inserisci IBAN'); return; }
    setSubmitting(true);
    try {
      await api.post('/affiliate/me/payout', { amount: amt, payout_method: method, payout_details: details.trim() });
      Alert.alert('✅ Richiesta inviata', 'Verrà processata entro 7 giorni lavorativi');
      setShowPayout(false); setAmount(''); setDetails('');
      await load();
    } catch (e: any) { Alert.alert('Errore', e?.response?.data?.detail || 'Riprova'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  if (!data) return <View style={styles.center}><Text>Errore caricamento</Text></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID="affiliate-screen">
      <Stack.Screen options={{ title: 'Programma Affiliati' }} />

      <View style={styles.hero}>
        <MaterialCommunityIcons name="cash-multiple" size={48} color={colors.primary.purple} />
        <Text style={styles.heroTitle}>I tuoi guadagni come affiliato</Text>
        <Text style={styles.heroSub}>Ricevi il 10% su ogni acquisto degli amici che inviti</Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={{ flex: 1 }}>
          <Text style={styles.statLabel}>Saldo disponibile</Text>
          <Text style={styles.statBig}>€{data.pending_amount.toFixed(2)}</Text>
          <Text style={styles.statSmall}>{data.pending_commissions_count} commissioni</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={styles.statLabel}>Già pagato</Text>
          <Text style={[styles.statBig, { color: colors.status.success }]}>€{data.paid_amount.toFixed(2)}</Text>
          <Text style={styles.statSmall}>{data.paid_commissions_count} commissioni</Text>
        </Card>
      </View>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.sectionTitle}>Codice referral</Text>
        <Text style={styles.code} testID="affiliate-code">{data.referral_code}</Text>
        <Text style={styles.statSmall}>Invitati: {data.invited_count}</Text>
      </Card>

      <PrimaryButton
        label={data.eligible_for_payout ? `Richiedi payout (€${data.pending_amount.toFixed(2)})` : `Min. €${data.min_payout_threshold} per payout`}
        onPress={() => setShowPayout(true)}
        disabled={!data.eligible_for_payout}
        variant="purple"
        testID="request-payout-btn"
        style={{ marginTop: 16 }}
      />

      <Text style={styles.sectionTitle}>Commissioni recenti</Text>
      {data.recent_commissions.length === 0 ? (
        <Text style={styles.empty}>Nessuna commissione ancora</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {data.recent_commissions.map((c: any, i: number) => (
            <View key={i} style={styles.commRow} testID={`commission-${i}`}>
              <View style={[styles.statusDot, { backgroundColor: c.status === 'paid' ? colors.status.success : colors.status.warning }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.commAmount}>+€{c.amount.toFixed(2)}</Text>
                <Text style={styles.commDate}>{new Date(c.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.commStatus}>{c.status === 'paid' ? 'Pagato' : 'In attesa'}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Storico payout</Text>
      {data.payout_history.length === 0 ? (
        <Text style={styles.empty}>Nessun payout richiesto</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {data.payout_history.map((p: any) => (
            <View key={p.id} style={styles.payoutRow}>
              <MaterialCommunityIcons name={p.status === 'approved' ? 'check-circle' : 'clock-outline'} size={20} color={p.status === 'approved' ? colors.status.success : colors.status.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.commAmount}>€{p.amount.toFixed(2)} via {p.payout_method}</Text>
                <Text style={styles.commDate}>{new Date(p.created_at).toLocaleDateString()} • {p.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal visible={showPayout} transparent animationType="slide" onRequestClose={() => setShowPayout(false)}>
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Richiedi payout</Text>
            <Text style={styles.label}>Importo (€) — disponibile €{data.pending_amount.toFixed(2)}</Text>
            <TextInput testID="payout-amount" style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="50.00" />
            <Text style={styles.label}>Metodo</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['paypal', 'bank_transfer'].map((m) => (
                <TouchableOpacity key={m} onPress={() => setMethod(m as any)} style={[styles.methodChip, method === m && { backgroundColor: colors.primary.blue, borderColor: colors.primary.blue }]} testID={`method-${m}`}>
                  <Text style={[styles.methodText, method === m && { color: '#FFF' }]}>{m === 'paypal' ? 'PayPal' : 'Bonifico'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>{method === 'paypal' ? 'Email PayPal' : 'IBAN'}</Text>
            <TextInput testID="payout-details" style={styles.input} value={details} onChangeText={setDetails} placeholder={method === 'paypal' ? 'tu@email.com' : 'IT60 X 0542...'} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <PrimaryButton label="Annulla" variant="ghost" onPress={() => setShowPayout(false)} style={{ flex: 1 }} testID="payout-cancel" />
              <PrimaryButton label="Conferma" onPress={requestPayout} loading={submitting} variant="purple" style={{ flex: 1 }} testID="payout-confirm" />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  hero: { alignItems: 'center', padding: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 8, textAlign: 'center' },
  heroSub: { color: colors.text.secondary, marginTop: 4, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statLabel: { fontSize: 12, fontWeight: '700', color: colors.text.secondary },
  statBig: { fontSize: 28, fontWeight: '900', color: colors.primary.purple, marginTop: 4 },
  statSmall: { fontSize: 11, color: colors.text.tertiary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginBottom: 8, marginTop: 16 },
  code: { fontSize: 28, fontWeight: '900', color: colors.primary.blue, letterSpacing: 4, marginVertical: 4 },
  empty: { color: colors.text.secondary, fontStyle: 'italic', padding: 12 },
  commRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#FFF', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#FFF', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  commAmount: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  commDate: { fontSize: 11, color: colors.text.secondary },
  commStatus: { fontSize: 11, fontWeight: '700', color: colors.text.secondary },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  label: { fontSize: 12, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: colors.bg.main, borderRadius: radii.md, padding: 12, fontSize: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  methodChip: { flex: 1, padding: 10, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, alignItems: 'center', backgroundColor: '#FFF' },
  methodText: { fontWeight: '700', color: colors.text.primary, fontSize: 13 },
});
