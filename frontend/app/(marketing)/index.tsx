import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../src/theme';
import { WebHeader, WebFooter, Section, H1, H2, P, CTAButton, FeatureCard, useResponsive, useMarketingLang, MAX_W } from '../../src/marketing-components';
import { mt } from '../../src/marketing-i18n';

export default function Landing() {
  const router = useRouter();
  const [lang, setLang] = useMarketingLang();
  const { isMobile } = useResponsive();

  return (
    <ScrollView style={styles.scroll} testID="landing-page" stickyHeaderIndices={[0]}>
      <Stack.Screen options={{ title: 'CodeMaster Academy - Impara a programmare con AI Tutor', headerShown: false }} />
      <WebHeader lang={lang} setLang={setLang} />

      {/* HERO */}
      <View style={[styles.hero, isMobile && { paddingVertical: 48 }]}>
        <View style={[styles.heroInner, { maxWidth: MAX_W, flexDirection: isMobile ? 'column' : 'row' }]}>
          <View style={[styles.heroLeft, isMobile && { width: '100%' }]}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="sparkles" size={14} color={colors.primary.purple} />
              <Text style={styles.heroBadgeText}>{lang === 'it' ? 'Powered by GPT-5.2' : 'Powered by GPT-5.2'}</Text>
            </View>
            <H1>{mt('hero_title', lang)}</H1>
            <View style={{ marginTop: 16 }}>
              <P large>{mt('hero_subtitle', lang)}</P>
            </View>
            <View style={[styles.heroCtas, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
              <CTAButton label={mt('hero_cta_primary', lang)} variant="primary" testID="hero-cta-primary" onPress={() => router.push('/(auth)/register')} style={isMobile ? { alignSelf: 'stretch', alignItems: 'center' } : undefined} />
              <CTAButton label={mt('hero_cta_secondary', lang)} variant="ghost" testID="hero-cta-secondary" onPress={() => router.push('/(marketing)/pricing-web')} style={isMobile ? { alignSelf: 'stretch', alignItems: 'center' } : undefined} />
            </View>
            <Text style={styles.heroTrust}>{mt('hero_trust', lang)}</Text>
          </View>

          <View style={[styles.heroRight, isMobile && { width: '100%', marginTop: 32, alignItems: 'center' }]}>
            <View style={styles.heroMockup}>
              <View style={styles.mockupTopBar}>
                <View style={[styles.mockDot, { backgroundColor: '#EF4444' }]} />
                <View style={[styles.mockDot, { backgroundColor: '#F59E0B' }]} />
                <View style={[styles.mockDot, { backgroundColor: '#22C55E' }]} />
                <Text style={styles.mockTab}>main.py</Text>
              </View>
              <View style={styles.mockBody}>
                <Text style={styles.codeLine}><Text style={styles.codeKw}>def </Text><Text style={styles.codeFn}>greet</Text>(name):</Text>
                <Text style={styles.codeLine}>    <Text style={styles.codeKw}>return </Text><Text style={styles.codeStr}>f"Hello, {'{'}name{'}'}!"</Text></Text>
                <Text style={styles.codeLine}> </Text>
                <Text style={styles.codeLine}><Text style={styles.codeFn}>print</Text>(greet(<Text style={styles.codeStr}>"World"</Text>))</Text>
                <View style={styles.mockOutput}>
                  <Text style={styles.outputLabel}>{'>'}_</Text>
                  <Text style={styles.outputText}>Hello, World!</Text>
                </View>
              </View>
              <View style={styles.aiHint}>
                <MaterialCommunityIcons name="robot-happy" size={16} color="#FFF" />
                <Text style={styles.aiHintText}>{lang === 'it' ? 'AI Tutor: "Ottima funzione! Vuoi vedere come gestire input multipli?"' : 'AI Tutor: "Great function! Want to see how to handle multiple inputs?"'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* FEATURES */}
      <Section>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <H2 center>{mt('features_title', lang)}</H2>
          <View style={{ maxWidth: 720 }}><P center large>{mt('features_subtitle', lang)}</P></View>
        </View>
        <View style={[styles.grid, { gap: 20 }]}>
          <View style={[styles.gridItem, isMobile ? { width: '100%' } : { width: '31%' }]}>
            <FeatureCard icon="robot-happy" title={mt('feat1_title', lang)} desc={mt('feat1_desc', lang)} color={colors.primary.purple} />
          </View>
          <View style={[styles.gridItem, isMobile ? { width: '100%' } : { width: '31%' }]}>
            <FeatureCard icon="book-open-variant" title={mt('feat2_title', lang)} desc={mt('feat2_desc', lang)} color={colors.primary.blue} />
          </View>
          <View style={[styles.gridItem, isMobile ? { width: '100%' } : { width: '31%' }]}>
            <FeatureCard icon="briefcase-check" title={mt('feat3_title', lang)} desc={mt('feat3_desc', lang)} color="#22C55E" />
          </View>
          <View style={[styles.gridItem, isMobile ? { width: '100%' } : { width: '31%' }]}>
            <FeatureCard icon="certificate" title={mt('feat4_title', lang)} desc={mt('feat4_desc', lang)} color="#F59E0B" />
          </View>
          <View style={[styles.gridItem, isMobile ? { width: '100%' } : { width: '31%' }]}>
            <FeatureCard icon="trophy-variant" title={mt('feat5_title', lang)} desc={mt('feat5_desc', lang)} color="#EC4899" />
          </View>
          <View style={[styles.gridItem, isMobile ? { width: '100%' } : { width: '31%' }]}>
            <FeatureCard icon="cellphone-link" title={mt('feat6_title', lang)} desc={mt('feat6_desc', lang)} color="#0EA5E9" />
          </View>
        </View>
      </Section>

      {/* LANGUAGES */}
      <Section style={{ backgroundColor: '#F8FAFC' }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <H2 center>{mt('langs_title', lang)}</H2>
          <View style={{ maxWidth: 700 }}><P center large>{mt('langs_subtitle', lang)}</P></View>
        </View>
        <View style={styles.langGrid}>
          {[
            { name: 'Python', icon: 'language-python', color: '#3776AB' },
            { name: 'JavaScript', icon: 'language-javascript', color: '#F7DF1E' },
            { name: 'TypeScript', icon: 'language-typescript', color: '#3178C6' },
            { name: 'HTML/CSS', icon: 'language-html5', color: '#E34F26' },
            { name: 'Java', icon: 'language-java', color: '#EA2D2E' },
            { name: 'C++', icon: 'language-cpp', color: '#00599C' },
            { name: 'C#', icon: 'language-csharp', color: '#239120' },
            { name: 'Go', icon: 'language-go', color: '#00ADD8' },
            { name: 'Rust', icon: 'language-rust', color: '#CE412B' },
            { name: 'Swift', icon: 'language-swift', color: '#FA7343' },
            { name: 'Kotlin', icon: 'language-kotlin', color: '#7F52FF' },
            { name: 'PHP', icon: 'language-php', color: '#777BB4' },
            { name: 'Ruby', icon: 'language-ruby', color: '#CC342D' },
            { name: 'SQL', icon: 'database', color: '#336791' },
            { name: 'R', icon: 'language-r', color: '#276DC3' },
            { name: 'Lua', icon: 'language-lua', color: '#000080' },
            { name: 'Bash', icon: 'console', color: '#4EAA25' },
          ].map((l) => (
            <View key={l.name} style={styles.langChip}>
              <MaterialCommunityIcons name={l.icon as any} size={20} color={l.color} />
              <Text style={styles.langName}>{l.name}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* PRICING TEASER */}
      <Section>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <H2 center>{mt('pricing_title', lang)}</H2>
          <View style={{ maxWidth: 700 }}><P center large>{mt('pricing_subtitle', lang)}</P></View>
        </View>
        <View style={[styles.pricingRow, isMobile && { flexDirection: 'column' }]}>
          {[
            { id: 'free', name: mt('plan_free', lang), price: mt('plan_free_price', lang), feat: mt('plan_free_features', lang), color: colors.text.secondary, highlight: false },
            { id: 'pro_monthly', name: mt('plan_monthly', lang), price: mt('plan_monthly_price', lang), feat: mt('plan_pro_features', lang), color: colors.primary.blue, highlight: false },
            { id: 'pro_yearly', name: mt('plan_yearly', lang), price: mt('plan_yearly_price', lang), feat: mt('plan_pro_features', lang), color: colors.primary.purple, highlight: true, badge: mt('plan_yearly_save', lang) },
            { id: 'lifetime', name: mt('plan_lifetime', lang), price: mt('plan_lifetime_price', lang), feat: mt('plan_pro_features', lang), color: '#F59E0B', highlight: false },
          ].map((p) => (
            <View key={p.id} style={[styles.priceCard, isMobile && { width: '100%' }, p.highlight && styles.priceCardHighlight]}>
              {p.highlight && p.badge && (
                <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>{p.badge}</Text></View>
              )}
              <Text style={styles.priceName}>{p.name}</Text>
              <Text style={[styles.priceAmount, { color: p.color }]}>{p.price}</Text>
              <Text style={styles.priceFeat}>{p.feat}</Text>
              <CTAButton
                label={p.id === 'free' ? mt('hero_cta_primary', lang) : mt('cta_choose_plan', lang)}
                variant={p.highlight ? 'purple' : 'primary'}
                onPress={() => p.id === 'free' ? router.push('/(auth)/register') : router.push(`/(marketing)/pricing-web?plan=${p.id}` as any)}
                style={{ alignSelf: 'stretch', alignItems: 'center', marginTop: 16 }}
                testID={`landing-plan-${p.id}`}
              />
            </View>
          ))}
        </View>
        <Text style={styles.pricingLegal}>{mt('pricing_legal', lang)}</Text>
      </Section>

      {/* CTA BANNER */}
      <Section dark>
        <View style={{ alignItems: 'center' }}>
          <H2 white center>{mt('cta_title', lang)}</H2>
          <View style={{ marginTop: 12, marginBottom: 24, maxWidth: 600 }}>
            <P white center large>{mt('cta_subtitle', lang)}</P>
          </View>
          <CTAButton label={mt('cta_btn', lang)} variant="primary" testID="banner-cta" onPress={() => router.push('/(auth)/register')} />
        </View>
      </Section>

      <WebFooter lang={lang} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#FFF' },
  hero: { paddingHorizontal: 20, paddingVertical: 80, backgroundColor: '#FFF' },
  heroInner: { width: '100%', alignSelf: 'center', alignItems: 'center', gap: 40 },
  heroLeft: { flex: 1.2, maxWidth: 640 },
  heroRight: { flex: 1, alignItems: 'flex-end' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary.purple + '15', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill, marginBottom: 16 },
  heroBadgeText: { color: colors.primary.purple, fontWeight: '700', fontSize: 12 },
  heroCtas: { flexDirection: 'row', gap: 12, marginTop: 28, alignItems: 'center' },
  heroTrust: { color: colors.text.tertiary, fontSize: 13, marginTop: 16 },
  heroMockup: { width: 480, maxWidth: '100%', backgroundColor: '#0F172A', borderRadius: radii.lg, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 12 } },
  mockupTopBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#1E293B' },
  mockDot: { width: 12, height: 12, borderRadius: 6 },
  mockTab: { color: '#94A3B8', marginLeft: 8, fontSize: 12, fontFamily: Platform.select({ default: 'monospace' }) },
  mockBody: { padding: 20 },
  codeLine: { color: '#E2E8F0', fontFamily: Platform.select({ default: 'monospace' }), fontSize: 14, lineHeight: 22 },
  codeKw: { color: '#C084FC' },
  codeFn: { color: '#60A5FA' },
  codeStr: { color: '#86EFAC' },
  mockOutput: { marginTop: 14, padding: 12, backgroundColor: '#1E293B', borderRadius: radii.sm, flexDirection: 'row', gap: 8 },
  outputLabel: { color: '#22C55E', fontFamily: Platform.select({ default: 'monospace' }) },
  outputText: { color: '#E2E8F0', fontFamily: Platform.select({ default: 'monospace' }) },
  aiHint: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: colors.primary.purple, gap: 10 },
  aiHintText: { color: '#FFF', fontSize: 12, fontWeight: '600', flex: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border },
  langName: { fontSize: 14, fontWeight: '700', color: colors.text.primary },

  pricingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  priceCard: { width: 240, backgroundColor: '#FFF', borderRadius: radii.lg, padding: 24, borderWidth: 2, borderColor: colors.border, position: 'relative' },
  priceCardHighlight: { borderColor: colors.primary.purple, borderWidth: 3 },
  priceBadge: { position: 'absolute', top: -12, right: 16, backgroundColor: colors.primary.purple, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill },
  priceBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  priceName: { fontSize: 16, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
  priceAmount: { fontSize: 22, fontWeight: '900', marginBottom: 12 },
  priceFeat: { fontSize: 13, color: colors.text.secondary, lineHeight: 20, minHeight: 60 },
  pricingLegal: { textAlign: 'center', color: colors.text.tertiary, fontSize: 13, marginTop: 24 },
});
