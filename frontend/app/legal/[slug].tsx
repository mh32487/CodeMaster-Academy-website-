import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import api from '../../src/api';
import { colors, radii, spacing } from '../../src/theme';

export default function LegalPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const endpoint = slug === 'terms' ? '/legal/terms' : '/legal/privacy';
        const { data } = await api.get(endpoint);
        setData(data);
      } finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary.blue} /></View>;
  if (!data) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.main }} contentContainerStyle={styles.scroll} testID={`legal-${slug}`}>
      <Stack.Screen options={{ title: data.title }} />
      <Text style={styles.title}>{data.title}</Text>
      <View style={styles.body}>
        {data.content.split('\n').map((line: string, i: number) => {
          if (line.startsWith('# ')) return <Text key={i} style={styles.h1}>{line.slice(2)}</Text>;
          if (line.startsWith('## ')) return <Text key={i} style={styles.h2}>{line.slice(3)}</Text>;
          if (line.startsWith('**') && line.endsWith('**')) return <Text key={i} style={styles.bold}>{line.replace(/\*\*/g, '')}</Text>;
          if (line.startsWith('- ')) return <Text key={i} style={styles.li}>• {line.slice(2)}</Text>;
          if (line.trim() === '') return <View key={i} style={{ height: 8 }} />;
          return <Text key={i} style={styles.p}>{line}</Text>;
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text.primary, marginBottom: 16 },
  body: { backgroundColor: '#FFF', padding: 16, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  h1: { fontSize: 20, fontWeight: '800', color: colors.text.primary, marginTop: 12, marginBottom: 6 },
  h2: { fontSize: 16, fontWeight: '800', color: colors.primary.blue, marginTop: 10, marginBottom: 4 },
  bold: { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginVertical: 2 },
  p: { fontSize: 14, color: colors.text.primary, lineHeight: 21, marginVertical: 1 },
  li: { fontSize: 14, color: colors.text.primary, lineHeight: 21, marginLeft: 6 },
});
