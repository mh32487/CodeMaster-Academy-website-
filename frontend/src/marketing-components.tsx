import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Pressable, Linking, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, spacing } from './theme';
import { useAuth } from './AuthContext';
import { mt, MktLang, MKT_LANGS, useMarketingLang } from './marketing-i18n';

export const MAX_W = 1200;

export function useResponsive() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}

export function WebHeader({ lang, setLang }: { lang: MktLang; setLang: (l: MktLang) => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const { isMobile } = useResponsive();

  return (
    <View style={styles.header} testID="web-header">
      <View style={[styles.headerInner, { maxWidth: MAX_W }]}>
        <Pressable onPress={() => router.push('/')} style={styles.brandRow} testID="header-logo">
          <View style={styles.logoMini}>
            <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFF" />
          </View>
          <Text style={styles.brandText}>CodeMaster</Text>
        </Pressable>

        {!isMobile && (
          <View style={styles.navRow}>
            <NavLink onPress={() => router.push('/(marketing)/#features' as any)} label={mt('nav_features', lang)} />
            <NavLink onPress={() => router.push('/(marketing)/pricing-web')} label={mt('nav_pricing', lang)} />
            <NavLink onPress={() => router.push('/(marketing)/download')} label={mt('nav_download', lang)} />
            <NavLink onPress={() => router.push('/(marketing)/support')} label={mt('nav_support', lang)} />
          </View>
        )}

        <View style={styles.headerCta}>
          <LangSwitch lang={lang} setLang={setLang} />
          {user ? (
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.btnPrimary} testID="header-app">
              <Text style={styles.btnPrimaryText}>Vai all'app</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.btnLogin} testID="header-login">
                <Text style={styles.btnLoginText}>{mt('nav_login', lang)}</Text>
              </TouchableOpacity>
              {!isMobile && (
                <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.btnPrimary} testID="header-signup">
                  <Text style={styles.btnPrimaryText}>{mt('nav_signup', lang)}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function NavLink({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={styles.navLink}>
      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
}

function LangSwitch({ lang, setLang }: { lang: MktLang; setLang: (l: MktLang) => void }) {
  return (
    <View style={styles.langSwitch}>
      {MKT_LANGS.map((l) => (
        <Pressable
          key={l.code}
          onPress={() => setLang(l.code)}
          style={[styles.langChip, lang === l.code && styles.langChipActive]}
          testID={`lang-${l.code}`}
        >
          <Text style={[styles.langChipText, lang === l.code && styles.langChipTextActive]}>{l.flag}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function WebFooter({ lang }: { lang: MktLang }) {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const year = new Date().getFullYear();

  const Section = ({ title, links }: { title: string; links: { label: string; onPress: () => void }[] }) => (
    <View style={[styles.footerCol, isMobile && { width: '100%' }]}>
      <Text style={styles.footerTitle}>{title}</Text>
      {links.map((l, i) => (
        <Pressable key={i} onPress={l.onPress} style={styles.footerLink}>
          <Text style={styles.footerLinkText}>{l.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.footer} testID="web-footer">
      <View style={[styles.footerInner, { maxWidth: MAX_W, flexDirection: isMobile ? 'column' : 'row' }]}>
        <View style={[styles.footerBrand, isMobile && { width: '100%', marginBottom: 24 }]}>
          <View style={styles.brandRow}>
            <View style={styles.logoMini}>
              <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFF" />
            </View>
            <Text style={styles.brandText}>CodeMaster</Text>
          </View>
          <Text style={styles.footerTagline}>{mt('tagline', lang)}</Text>
        </View>

        <Section title={mt('footer_product', lang)} links={[
          { label: mt('nav_features', lang), onPress: () => router.push('/(marketing)') },
          { label: mt('nav_pricing', lang), onPress: () => router.push('/(marketing)/pricing-web') },
          { label: mt('nav_download', lang), onPress: () => router.push('/(marketing)/download') },
        ]} />

        <Section title={mt('footer_resources', lang)} links={[
          { label: mt('footer_support', lang), onPress: () => router.push('/(marketing)/support') },
          { label: mt('footer_faq', lang), onPress: () => router.push('/(marketing)/faq') },
          { label: mt('footer_contact', lang), onPress: () => router.push('/(marketing)/contact') },
        ]} />

        <Section title={mt('footer_legal', lang)} links={[
          { label: mt('footer_privacy', lang), onPress: () => router.push('/(marketing)/privacy') },
          { label: mt('footer_terms', lang), onPress: () => router.push('/(marketing)/terms') },
        ]} />
      </View>
      <View style={styles.footerBottom}>
        <Text style={styles.footerCopy}>© {year} CodeMaster Academy. {mt('footer_rights', lang)}</Text>
      </View>
    </View>
  );
}

export function Section({ children, dark, style }: { children: React.ReactNode; dark?: boolean; style?: any }) {
  return (
    <View style={[styles.section, dark && { backgroundColor: '#0F172A' }, style]}>
      <View style={[styles.sectionInner, { maxWidth: MAX_W }]}>{children}</View>
    </View>
  );
}

export function H1({ children, white }: { children: React.ReactNode; white?: boolean }) {
  const { isMobile } = useResponsive();
  return (
    <Text style={[styles.h1, { fontSize: isMobile ? 32 : 48, color: white ? '#FFF' : colors.text.primary }]}>
      {children}
    </Text>
  );
}

export function H2({ children, white, center }: { children: React.ReactNode; white?: boolean; center?: boolean }) {
  const { isMobile } = useResponsive();
  return (
    <Text style={[
      styles.h2,
      { fontSize: isMobile ? 26 : 36, color: white ? '#FFF' : colors.text.primary, textAlign: center ? 'center' : 'left' },
    ]}>
      {children}
    </Text>
  );
}

export function P({ children, white, center, large }: { children: React.ReactNode; white?: boolean; center?: boolean; large?: boolean }) {
  return (
    <Text style={[
      styles.p,
      { fontSize: large ? 18 : 16, color: white ? '#E2E8F0' : colors.text.secondary, textAlign: center ? 'center' : 'left', lineHeight: large ? 28 : 24 },
    ]}>
      {children}
    </Text>
  );
}

export function CTAButton({ label, onPress, variant = 'primary', testID, style }: any) {
  const bg = variant === 'primary' ? colors.primary.blue : variant === 'purple' ? colors.primary.purple : 'transparent';
  const txt = variant === 'ghost' ? colors.primary.blue : '#FFF';
  const borderC = variant === 'ghost' ? colors.primary.blue : 'transparent';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      testID={testID}
      style={[
        styles.cta,
        { backgroundColor: bg, borderColor: borderC, borderWidth: variant === 'ghost' ? 2 : 0 },
        style,
      ]}
    >
      <Text style={[styles.ctaText, { color: txt }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function FeatureCard({ icon, title, desc, color }: { icon: any; title: string; desc: string; color?: string }) {
  const c = color || colors.primary.blue;
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: c + '15' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={c} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

export { useMarketingLang };

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: Platform.OS === 'web' ? ('sticky' as any) : 'relative',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMini: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  navRow: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  navLink: { paddingVertical: 6 },
  navText: { fontSize: 14, color: colors.text.primary, fontWeight: '600' },
  headerCta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnPrimary: { backgroundColor: colors.primary.blue, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.pill },
  btnPrimaryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  btnLogin: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, borderWidth: 2, borderColor: colors.primary.blue },
  btnLoginText: { color: colors.primary.blue, fontWeight: '700', fontSize: 14 },
  langSwitch: { flexDirection: 'row', backgroundColor: colors.bg.main, borderRadius: radii.pill, padding: 2 },
  langChip: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: radii.pill },
  langChipActive: { backgroundColor: '#FFF' },
  langChipText: { fontSize: 14 },
  langChipTextActive: { },

  footer: { backgroundColor: '#0F172A', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 24 },
  footerInner: { width: '100%', alignSelf: 'center', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between' },
  footerBrand: { width: 280 },
  footerTagline: { color: '#94A3B8', marginTop: 12, fontSize: 14, lineHeight: 22 },
  footerCol: { minWidth: 140 },
  footerTitle: { color: '#FFF', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  footerLink: { paddingVertical: 4 },
  footerLinkText: { color: '#CBD5E1', fontSize: 14 },
  footerBottom: { borderTopWidth: 1, borderTopColor: '#1E293B', marginTop: 32, paddingTop: 16, alignItems: 'center' },
  footerCopy: { color: '#64748B', fontSize: 12 },

  section: { paddingHorizontal: 20, paddingVertical: 64, width: '100%' },
  sectionInner: { width: '100%', alignSelf: 'center' },

  h1: { fontWeight: '900', letterSpacing: -1, lineHeight: 56 },
  h2: { fontWeight: '900', letterSpacing: -0.5, lineHeight: 44, marginBottom: 12 },
  p: { },

  cta: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: radii.pill, alignItems: 'center', alignSelf: 'flex-start' },
  ctaText: { fontSize: 16, fontWeight: '800' },

  featureCard: {
    backgroundColor: '#FFF',
    borderRadius: radii.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: { width: 56, height: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  featureTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, marginBottom: 8 },
  featureDesc: { fontSize: 14, color: colors.text.secondary, lineHeight: 22 },
});
