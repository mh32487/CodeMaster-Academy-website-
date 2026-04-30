/**
 * Cross-platform notifications.
 *
 * On web, React Native's Alert.alert is a no-op, making validation errors and
 * network failures invisible. This helper uses window.alert() on web and the
 * native Alert.alert on iOS/Android.
 */
import { Platform, Alert } from 'react-native';

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const text = message ? `${title}\n\n${message}` : title;
    try {
      // Prefer window.alert; it blocks and is always visible in browsers
      window.alert(text);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('[notify]', title, message);
    }
    return;
  }
  Alert.alert(title, message);
}

export function confirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText = 'OK',
  cancelText = 'Annulla',
) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const ok = window.confirm(message ? `${title}\n\n${message}` : title);
    if (ok) onConfirm(); else onCancel?.();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel', onPress: onCancel },
    { text: confirmText, onPress: onConfirm, style: 'destructive' },
  ]);
}
