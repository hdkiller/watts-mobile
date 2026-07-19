import { useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform, View } from 'react-native';
import type { KeyboardEvent } from 'react-native';

/**
 * Returns the number of points the iOS keyboard overlaps the referenced
 * container, for use as bottom padding. KeyboardAvoidingView cannot be used
 * inside a native-tabs screen: it measures its frame relative to the screen
 * container but compares against window-space keyboard coordinates, so it
 * over-pads and crushes the layout.
 */
export function useKeyboardOverlap<T extends View>() {
  const containerRef = useRef<T>(null);
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const update = (event: KeyboardEvent, keyboardScreenY: number) => {
      const node = containerRef.current;
      if (!node) return;
      node.measureInWindow((_x, y, _width, height) => {
        const next = Math.max(0, Math.round(y + height - keyboardScreenY));
        setOverlap((prev) => {
          if (prev === next) return prev;
          LayoutAnimation.configureNext({
            duration: event.duration > 0 ? event.duration : 250,
            update: { type: 'keyboard' },
          });
          return next;
        });
      });
    };

    const changeSub = Keyboard.addListener('keyboardWillChangeFrame', (event) =>
      update(event, event.endCoordinates.screenY),
    );
    const hideSub = Keyboard.addListener('keyboardWillHide', (event) =>
      update(event, Number.MAX_SAFE_INTEGER),
    );
    return () => {
      changeSub.remove();
      hideSub.remove();
    };
  }, []);

  return { containerRef, overlap };
}
