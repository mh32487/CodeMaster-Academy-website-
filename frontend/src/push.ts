/**
 * Push notification registration helper.
 * Called from AuthContext after login.
 */
import { Platform } from 'react-native';
import api from './api';

export async function registerPushToken() {
  try {
    if (Platform.OS === 'web') return; // web push not supported in this build
    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');

    if (!Device.isDevice) return;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    if (final !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    if (!tokenData?.data) return;

    await api.post('/push/register', {
      expo_push_token: tokenData.data,
      platform: Platform.OS,
    });
  } catch {
    // silently fail - push is optional
  }
}
