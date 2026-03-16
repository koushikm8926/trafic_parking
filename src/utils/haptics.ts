import { Platform } from 'react-native';

// Try to import haptics, but handle if not available
let Haptics: any = null;
let hapticsAvailable = false;

try {
  // Try React Native Haptic Feedback (if installed)
  // This is optional and gracefully degrades
  Haptics = require('react-native-haptic-feedback');
  hapticsAvailable = true;
} catch (error) {
  // Fallback: use Vibration API
  try {
    const { Vibration } = require('react-native');
    Haptics = {
      trigger: (type: string) => {
        switch (type) {
          case 'impactLight':
            Vibration.vibrate(10);
            break;
          case 'impactMedium':
            Vibration.vibrate(20);
            break;
          case 'impactHeavy':
            Vibration.vibrate(40);
            break;
          case 'notificationSuccess':
            Vibration.vibrate([0, 10, 20, 30]);
            break;
          case 'notificationWarning':
            Vibration.vibrate([0, 20, 10, 20]);
            break;
          default:
            Vibration.vibrate(10);
        }
      },
    };
    hapticsAvailable = true;
  } catch (e) {
    console.warn('Haptics not available');
    hapticsAvailable = false;
  }
}

export enum HapticType {
  Light = 'impactLight',
  Medium = 'impactMedium',
  Heavy = 'impactHeavy',
  Success = 'notificationSuccess',
  Warning = 'notificationWarning',
  Error = 'notificationError',
  Selection = 'selection',
}

/**
 * Trigger haptic feedback
 * @param type The type of haptic feedback
 * @param enabled Whether haptics are enabled (from settings)
 */
export function triggerHaptic(type: HapticType, enabled: boolean = true): void {
  if (!enabled || !hapticsAvailable || !Haptics) return;
  
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.trigger?.(type);
    }
  } catch (error) {
    // Silently fail
  }
}

/**
 * Haptic feedback for common game events
 */
export const GameHaptics = {
  // When vehicle starts moving
  vehicleMove: (enabled: boolean) => triggerHaptic(HapticType.Light, enabled),
  
  // When vehicle hits wall or another vehicle
  collision: (enabled: boolean) => triggerHaptic(HapticType.Warning, enabled),
  
  // When level is completed
  levelComplete: (enabled: boolean) => triggerHaptic(HapticType.Success, enabled),
  
  // When button is pressed
  buttonPress: (enabled: boolean) => triggerHaptic(HapticType.Selection, enabled),
  
  // When star is earned
  starEarned: (enabled: boolean) => triggerHaptic(HapticType.Medium, enabled),
  
  // When undo is performed
  undo: (enabled: boolean) => triggerHaptic(HapticType.Light, enabled),
  
  // When hint is shown
  hint: (enabled: boolean) => triggerHaptic(HapticType.Medium, enabled),
};

export function isHapticsAvailable(): boolean {
  return hapticsAvailable;
}
