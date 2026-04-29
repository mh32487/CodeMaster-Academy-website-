import React from 'react';
import { Stack } from 'expo-router';

export default function MarketingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="support" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="download" />
      <Stack.Screen name="pricing-web" />
    </Stack>
  );
}
