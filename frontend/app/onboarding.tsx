import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radii, spacing } from '../src/theme';
import { PrimaryButton } from '../src/components';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'rocket-launch',
    color: colors.primary.blue,
    title: 'Impara dovunque, in qualunque momento',
    desc: '17 linguaggi di programmazione strutturati in 4 livelli, dal principiante al pro.',
    bg: '#EFF6FF',
  },
  {
    icon: 'robot-happy',
    color: colors.primary.purple,
    title: 'AI Tutor personale 24/7',
    desc: 'GPT-5.2 risponde alle tue domande, analizza il tuo codice e crea piani di studio su misura.',
    bg: '#F5F3FF',
  },
  {
    icon: 'trophy-variant',
    color: '#F59E0B',
    title: 'Gamification che motiva',
    desc: 'Streak, missioni, sfide settimanali, badge, classifica e certificati con QR code.',
    bg: '#FFFBEB',
  },
  {
    icon: 'briefcase-check',
    color: '#22C55E',
    title: 'Pronto per il mondo del lavoro',
    desc: 'Progetti pratici reali, certificati condivisibili su LinkedIn, percorsi verso ruoli reali.',
    bg: '#F0FDF4',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    router.replace('/(auth)/register');
  };

  const next = () => {
    if (idx < SLIDES.length - 1) {
      const n = idx + 1;
      setIdx(n);
      listRef.current?.scrollToIndex({ index: n, animated: true });
    } else { finish(); }
  };

  const skip = async () => { await finish(); };

  return (
    <SafeAreaView style={styles.container} testID="onboarding-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.skipBar}>
        <TouchableOpacity onPress={skip} testID="onboarding-skip"><Text style={styles.skip}>Salta</Text></TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, backgroundColor: item.bg }]} testID={`slide-${item.title.slice(0, 8)}`}>
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <MaterialCommunityIcons name={item.icon as any} size={80} color="#FFF" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, idx === i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.cta}>
        <PrimaryButton
          label={idx === SLIDES.length - 1 ? 'Inizia subito gratis' : 'Avanti'}
          onPress={next}
          testID="onboarding-next"
          variant={idx === SLIDES.length - 1 ? 'purple' : 'primary'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.main },
  skipBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'flex-end' },
  skip: { color: colors.text.secondary, fontWeight: '700' },
  slide: { padding: 32, alignItems: 'center', justifyContent: 'center', flex: 1 },
  iconBox: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderBottomWidth: 6 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text.primary, textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 16, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 32, backgroundColor: colors.primary.blue },
  cta: { padding: spacing.md, paddingBottom: spacing.lg },
});
