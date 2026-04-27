import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api';
import { useAuth } from '../src/AuthContext';
import { colors, radii, spacing } from '../src/theme';
import { t } from '../src/i18n';

export default function Admin() {
  const { lang, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [retention, setRetention] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [s, u, r, f, tx] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/analytics/retention').catch(() => ({ data: null })),
        api.get('/admin/analytics/conversion-funnel').catch(() => ({ data: null })),
        api.get('/admin/transactions').catch(() => ({ data: [] })),
      ]);
      setStats(s.data); setUsers(u.data); setRetention(r.data); setFunnel(f.data); setTxns(tx.data || []);
    } catch (e: any) { console.warn(e); }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (user?.role !== 'admin') {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: t('admin_panel', lang) }} />
        <MaterialCommunityIcons name="lock" size={48} color={colors.status.error} />
        <Text style={styles.denied}>Accesso negato</Text>
        <Text style={styles.deniedSub}>Solo gli admin possono accedere</Text>
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;

  const paidTxns = txns.filter((t: any) => t.payment_status === 'paid');
  const pendingTxns = txns.filter((t: any) => t.payment_status === 'pending');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.main }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      testID="admin-screen"
    >
      <Stack.Screen options={{ title: t('admin_panel', lang) }} />
      <Text style={styles.title}>Dashboard Admin</Text>
      <Text style={styles.sub}>Analytics e gestione piattaforma</Text>

      {/* Revenue Hero */}
      <View style={styles.revenueCard} testID="admin-revenue-card">
        <View style={styles.revenueLeft}>
          <Text style={styles.revenueLabel}>💰 Ricavi totali (TEST)</Text>
          <Text style={styles.revenueBig}>€{(retention?.total_revenue_eur || 0).toFixed(2)}</Text>
          <Text style={styles.revenueSmall}>{retention?.paid_transactions || 0} pagamenti riusciti</Text>
        </View>
        <View style={styles.revenueRight}>
          <Text style={styles.revenueLabel}>ARPU</Text>
          <Text style={styles.revenueMid}>€{(retention?.arpu || 0).toFixed(2)}</Text>
          <Text style={styles.revenueSmall}>per utente</Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <Stat icon="account-group" color={colors.primary.blue} value={stats?.users || 0} label="Utenti" testID="stat-users" />
        <Stat icon="crown" color={colors.primary.purple} value={stats?.pro_users || 0} label="Pro users" testID="stat-pro" />
        <Stat icon="percent" color={colors.status.success} value={`${stats?.conversion_rate || 0}%`} label="Conversion" testID="stat-conversion" />
        <Stat icon="cash-multiple" color={colors.primary.purple} value={stats?.transactions || 0} label="Transazioni" testID="stat-transactions" />
        <Stat icon="code-tags" color={colors.status.warning} value={stats?.languages || 0} label="Linguaggi" />
        <Stat icon="book-open-variant" color={colors.status.info} value={stats?.lessons || 0} label="Lezioni" />
        <Stat icon="help-circle" color={colors.status.warning} value={stats?.quizzes || 0} label="Quiz" />
        <Stat icon="check-circle" color={colors.status.success} value={stats?.lesson_completions || 0} label="Completamenti" />
      </View>

      {/* Retention */}
      {retention && (
        <>
          <Text style={styles.section}>📊 Retention</Text>
          <View style={styles.retentionRow}>
            <RetBox label="24h" value={retention.active_24h} total={retention.total_users} color={colors.status.success} />
            <RetBox label="7 giorni" value={retention.active_7d} total={retention.total_users} color={colors.primary.blue} />
            <RetBox label="30 giorni" value={retention.active_30d} total={retention.total_users} color={colors.primary.purple} />
          </View>
        </>
      )}

      {/* Conversion funnel */}
      {funnel && (
        <>
          <Text style={styles.section}>🎯 Funnel di conversione</Text>
          <View style={styles.funnelCard}>
            <FunnelStep label="Registrati" value={funnel.registered} total={funnel.registered} color={colors.primary.blue} />
            <FunnelStep label="Prima lezione" value={funnel.completed_first_lesson} total={funnel.registered} color={colors.primary.blue} />
            <FunnelStep label="Primo quiz superato" value={funnel.passed_first_quiz} total={funnel.registered} color={colors.status.warning} />
            <FunnelStep label="Pro subscriber" value={funnel.subscribed_pro} total={funnel.registered} color={colors.primary.purple} />
          </View>
        </>
      )}

      {/* Recent Transactions */}
      <Text style={styles.section}>💳 Ultime transazioni</Text>
      {txns.length === 0 ? (
        <Text style={styles.empty}>Nessuna transazione registrata</Text>
      ) : (
        <View style={styles.list}>
          {txns.slice(0, 15).map((tx: any, i: number) => (
            <View key={tx.session_id || i} style={styles.txnRow} testID={`txn-${i}`}>
              <MaterialCommunityIcons
                name={tx.payment_status === 'paid' ? 'check-circle' : tx.payment_status === 'pending' ? 'clock-outline' : 'close-circle'}
                size={20}
                color={tx.payment_status === 'paid' ? colors.status.success : tx.payment_status === 'pending' ? colors.status.warning : colors.status.error}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.txnAmount}>€{(tx.amount || 0).toFixed(2)} • {tx.plan_id}</Text>
                <Text style={styles.txnEmail}>{tx.user_email} {tx.coupon ? `• 🎟 ${tx.coupon}` : ''}</Text>
              </View>
              <Text style={styles.txnStatus}>{tx.payment_status}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.txnSummary}>
        <Text style={styles.txnSummaryText}>✅ Riusciti: {paidTxns.length} • ⏳ Pending: {pendingTxns.length}</Text>
      </View>

      {/* Plan Distribution */}
      {retention?.plan_distribution && (
        <>
          <Text style={styles.section}>📦 Piani attivi</Text>
          <View style={styles.list}>
            {retention.plan_distribution.map((p: any) => (
              <View key={p._id || 'null'} style={styles.row}>
                <MaterialCommunityIcons name={p._id === 'free' ? 'account' : 'crown'} size={18} color={p._id === 'free' ? colors.text.secondary : colors.primary.purple} />
                <Text style={styles.langName}>{(p._id || 'free').toUpperCase()}</Text>
                <Text style={styles.langValue}>{p.count} utenti</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Top languages */}
      <Text style={styles.section}>🏆 Top linguaggi</Text>
      <View style={styles.list}>
        {(stats?.top_languages || []).map((l: any, i: number) => (
          <View key={l._id} style={styles.row}>
            <Text style={styles.rank}>#{i + 1}</Text>
            <Text style={styles.langName}>{l._id}</Text>
            <Text style={styles.langValue}>{l.completions} completate</Text>
          </View>
        ))}
        {(!stats?.top_languages || stats.top_languages.length === 0) && (
          <Text style={styles.empty}>Nessun completamento ancora</Text>
        )}
      </View>

      {/* Users list */}
      <Text style={styles.section}>👥 Utenti recenti ({users.length})</Text>
      <View style={styles.list}>
        {users.slice(0, 20).map((u: any) => (
          <View key={u.id} style={styles.userRow} testID={`admin-user-${u.id}`}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(u.name || '?')[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
            </View>
            <View style={[styles.planPill, { backgroundColor: u.subscription?.plan_id === 'free' ? colors.text.tertiary + '20' : colors.primary.purple + '20' }]}>
              <Text style={[styles.planText, { color: u.subscription?.plan_id === 'free' ? colors.text.secondary : colors.primary.purple }]}>
                {(u.subscription?.plan_id || 'free').toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          🔒 Stripe in TEST MODE. Usa carta 4242 4242 4242 4242, data futura qualsiasi, CVC qualsiasi. Prima del go-live sostituire STRIPE_API_KEY con chiave live.
        </Text>
      </View>
    </ScrollView>
  );
}

function Stat({ icon, color, value, label, testID }: any) {
  return (
    <View style={styles.statBox} testID={testID}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RetBox({ label, value, total, color }: any) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <View style={styles.retBox}>
      <Text style={styles.retLabel}>{label}</Text>
      <Text style={[styles.retValue, { color }]}>{value}</Text>
      <Text style={styles.retPct}>{pct}%</Text>
    </View>
  );
}

function FunnelStep({ label, value, total, color }: any) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.funnelHead}>
        <Text style={styles.funnelLabel}>{label}</Text>
        <Text style={styles.funnelValue}>{value} ({pct}%)</Text>
      </View>
      <View style={styles.funnelBar}>
        <View style={[styles.funnelFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main, padding: 24 },
  denied: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 16 },
  deniedSub: { color: colors.text.secondary, marginTop: 4 },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text.primary, marginTop: 8 },
  sub: { color: colors.text.secondary, marginTop: 4, marginBottom: 16 },

  revenueCard: { flexDirection: 'row', backgroundColor: colors.primary.purple, borderRadius: radii.lg, padding: 18, marginBottom: 16, borderBottomWidth: 6, borderBottomColor: '#5B21B6' },
  revenueLeft: { flex: 2 },
  revenueRight: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  revenueLabel: { fontSize: 11, color: '#DDD6FE', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  revenueBig: { fontSize: 36, fontWeight: '900', color: '#FFF', marginTop: 4 },
  revenueMid: { fontSize: 22, fontWeight: '900', color: '#FFF', marginTop: 4 },
  revenueSmall: { fontSize: 11, color: '#DDD6FE', marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statBox: { width: '48%', backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text.primary, marginTop: 6 },
  statLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: '600' },

  section: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginTop: 20, marginBottom: 10 },

  retentionRow: { flexDirection: 'row', gap: 8 },
  retBox: { flex: 1, backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  retLabel: { fontSize: 11, color: colors.text.secondary, fontWeight: '700', textTransform: 'uppercase' },
  retValue: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  retPct: { fontSize: 12, color: colors.text.secondary, fontWeight: '700', marginTop: 2 },

  funnelCard: { backgroundColor: '#FFF', padding: 14, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  funnelHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  funnelLabel: { fontSize: 13, fontWeight: '700', color: colors.text.primary },
  funnelValue: { fontSize: 13, fontWeight: '700', color: colors.text.secondary },
  funnelBar: { height: 10, backgroundColor: colors.bg.main, borderRadius: 5, overflow: 'hidden' },
  funnelFill: { height: '100%', borderRadius: 5 },

  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: 10 },
  rank: { fontWeight: '800', color: colors.text.secondary, width: 28 },
  langName: { fontSize: 14, fontWeight: '700', color: colors.text.primary, flex: 1 },
  langValue: { fontSize: 12, color: colors.primary.blue, fontWeight: '700' },

  txnRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: 10 },
  txnAmount: { fontSize: 14, fontWeight: '800', color: colors.text.primary },
  txnEmail: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  txnStatus: { fontSize: 10, fontWeight: '800', color: colors.text.secondary, textTransform: 'uppercase' },
  txnSummary: { marginTop: 8, padding: 10, backgroundColor: colors.primary.blue + '10', borderRadius: radii.sm, alignItems: 'center' },
  txnSummaryText: { color: colors.text.primary, fontWeight: '700', fontSize: 12 },

  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: colors.primary.blue },
  userName: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  userEmail: { fontSize: 12, color: colors.text.secondary },
  planPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  planText: { fontSize: 10, fontWeight: '800' },

  empty: { color: colors.text.secondary, fontStyle: 'italic', padding: 12, textAlign: 'center' },
  note: { marginTop: 24, padding: 14, backgroundColor: colors.status.warning + '15', borderRadius: radii.md, borderLeftWidth: 4, borderLeftColor: colors.status.warning },
  noteText: { fontSize: 13, color: colors.text.primary, lineHeight: 19 },
});
