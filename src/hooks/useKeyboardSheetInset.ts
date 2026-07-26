import { useEffect, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';
import type { KeyboardEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Bottom padding needed to clear the iOS keyboard for a container anchored to the
 * screen bottom — a fullScreen/pageSheet Modal, or a bottom sheet.
 *
 * Prefer this over useKeyboardOverlap (and over KeyboardAvoidingView) inside a Modal:
 * both derive the overlap from `measureInWindow`, which reports coordinates in the
 * modal's own window, while KeyboardEvent.endCoordinates.screenY is in screen
 * coordinates. Inside a pageSheet the two differ by the sheet's top inset (~57pt), so
 * the computed overlap is short by that much and the bottom of the content — typically
 * a pinned footer — stays under the keyboard.
 *
 * Anchored containers need no measurement: the keyboard covers `endCoordinates.height`
 * up from the screen bottom, and SafeAreaView has already inset the container by
 * `insets.bottom`, so the remaining overlap is simply the difference.
 */
export function useKeyboardSheetInset() {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const update = (event: KeyboardEvent, next: number) => {
      setKeyboardHeight((prev) => {
        if (prev === next) return prev;
        LayoutAnimation.configureNext({
          duration: event.duration > 0 ? event.duration : 250,
          update: { type: 'keyboard' },
        });
        return next;
      });
    };

    const changeSub = Keyboard.addListener('keyboardWillChangeFrame', (event) =>
      update(event, event.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener('keyboardWillHide', (event) => update(event, 0));
    return () => {
      changeSub.remove();
      hideSub.remove();
    };
  }, []);

  return Math.max(0, keyboardHeight - insets.bottom);
}
