import * as Haptics from 'expo-haptics';

/** Light impact — Button press, chips, steppers. */
export function hapticLight() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Success notification — accept/save/analysis complete. */
export function hapticSuccess() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Error notification — failed mutation or blocked submit. */
export function hapticError() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
