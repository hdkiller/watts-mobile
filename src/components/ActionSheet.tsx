/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useSyncExternalStore } from 'react';
import { ActionSheetIOS, Modal, Platform, Pressable, Text, View } from 'react-native';

export type ActionSheetOption = {
  label: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type SheetPayload = {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
};

type SheetState = SheetPayload & { open: boolean };

let state: SheetState = { open: false, options: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function presentAndroid(payload: SheetPayload) {
  state = { ...payload, open: true };
  emit();
}

function dismissAndroid() {
  if (!state.open) return;
  state = { ...state, open: false };
  emit();
}

/**
 * Native action sheet on iOS; bottom sheet menu on Android (via ActionSheetPortal).
 * Use for choice menus. Keep Alert.alert for true confirms (destructive / irreversible).
 */
export function showActionSheet(payload: SheetPayload) {
  const options = payload.options.length
    ? payload.options
    : [{ label: 'Cancel', style: 'cancel' as const }];

  if (Platform.OS === 'ios') {
    const labels = options.map((o) => o.label);
    const cancelButtonIndex = options.findIndex((o) => o.style === 'cancel');
    const destructiveButtonIndex = options.findIndex((o) => o.style === 'destructive');
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: payload.title,
        message: payload.message,
        options: labels,
        cancelButtonIndex: cancelButtonIndex >= 0 ? cancelButtonIndex : undefined,
        destructiveButtonIndex: destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
      },
      (buttonIndex) => {
        const opt = options[buttonIndex];
        if (!opt || opt.style === 'cancel') return;
        // Defer so nested showActionSheet (Adjust → This week) can present cleanly.
        setTimeout(() => opt.onPress?.(), 0);
      },
    );
    return;
  }

  presentAndroid({ ...payload, options });
}

/** Mount once near the app root so Android menus can present. */
export function ActionSheetPortal() {
  const sheet = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const close = () => dismissAndroid();

  const onPick = (opt: ActionSheetOption) => {
    dismissAndroid();
    if (opt.style === 'cancel') return;
    // Wait for dismiss animation before nested sheets / navigation.
    setTimeout(() => opt.onPress?.(), 220);
  };

  return (
    <Modal visible={sheet.open} transparent animationType="slide" onRequestClose={close}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={close}>
        <Pressable
          className="rounded-t-3xl border-t border-border-strong bg-card px-5 pb-10 pt-4"
          onPress={(event) => event.stopPropagation()}
          testID="action-sheet"
        >
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-border-strong" />
          </View>
          {sheet.title ? (
            <Text className="text-lg font-semibold text-text-primary">{sheet.title}</Text>
          ) : null}
          {sheet.message ? (
            <Text className={`text-sm text-text-muted ${sheet.title ? 'mt-1' : ''}`}>
              {sheet.message}
            </Text>
          ) : null}
          <View className={sheet.title || sheet.message ? 'mt-5' : ''}>
            {sheet.options.map((opt) => {
              if (opt.style === 'cancel') {
                return (
                  <Pressable
                    key={opt.label}
                    className="mt-3 px-4 py-3 active:opacity-80"
                    onPress={() => onPick(opt)}
                    accessibilityRole="button"
                  >
                    <Text className="text-center text-base font-semibold text-text-muted">
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              }
              const destructive = opt.style === 'destructive';
              return (
                <Pressable
                  key={opt.label}
                  className="mt-2 rounded-xl border border-border-strong px-4 py-3.5 active:opacity-80"
                  onPress={() => onPick(opt)}
                  accessibilityRole="button"
                >
                  <Text
                    className={`text-base font-semibold ${
                      destructive ? 'text-danger' : 'text-text-primary'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
