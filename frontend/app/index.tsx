import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/AuthContext';
import { colors } from '../src/theme';

export default function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Logged-in users: go to app dashboard
      router.replace('/(tabs)/home');
      return;
    }

    if (Platform.OS === 'web') {
      // Web visitors (not logged in): show marketing landing
      router.replace('/(marketing)');
      return;
    }

    // Native mobile not logged in: keep onboarding flow
    AsyncStorage.getItem('onboarding_done').then((done) => {
      if (!done) {
        router.replace('/onboarding');
      } else {
        router.replace('/(auth)/login');
      }
    });
  }, [user, loading, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.main }} testID="splash-loading">
      <ActivityIndicator size="large" color={colors.primary.blue} />
    </View>
  );
}
