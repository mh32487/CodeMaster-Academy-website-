import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/AuthContext';
import { colors } from '../../src/theme';
import { t } from '../../src/i18n';
import { View, ActivityIndicator } from 'react-native';

export default function TabsLayout() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main }}>
        <ActivityIndicator size="large" color={colors.primary.blue} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.blue,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('home', lang), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="languages"
        options={{ title: t('languages', lang), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="code-tags" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="paths"
        options={{ title: t('paths', lang), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-path" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="tutor"
        options={{ title: t('tutor', lang), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="robot-happy" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('profile', lang), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
