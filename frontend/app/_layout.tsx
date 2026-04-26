import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="language/[id]" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="lesson/[id]" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="quiz/[id]" options={{ headerShown: true, title: 'Quiz' }} />
            <Stack.Screen name="exercise/[id]" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="path/[id]" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="project/[id]" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="pricing" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="leaderboard" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="certificates" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="referral" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="affiliate" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="payment/success" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="legal/[slug]" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="missions" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="study-plan" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="admin" options={{ headerShown: true, title: '' }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
