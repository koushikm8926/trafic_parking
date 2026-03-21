import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Universal haptic feedback wrapper.
 * Checks for platform compatibility before triggering.
 */
export const triggerHaptic = async (type: 'success' | 'warning' | 'error' | 'selection' | 'light' | 'medium' | 'heavy') => {
  if (Platform.OS === 'web') return;

  try {
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  } catch (error) {
    console.warn('Haptics not available:', error);
  }
};

export const haptics = {
  impact: (style: 'light' | 'medium' | 'heavy' = 'light') => triggerHaptic(style),
  notification: (type: 'success' | 'warning' | 'error') => triggerHaptic(type),
  selection: () => triggerHaptic('selection'),
};
