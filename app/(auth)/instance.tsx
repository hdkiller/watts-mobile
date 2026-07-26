/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function InstanceScreen() {
  const theme = useThemeColors();

  const { defaultInstanceUrl, saveInstance, error, clearError } = useAuth();
  const [url, setUrl] = useState(defaultInstanceUrl);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onContinue = async () => {
    clearError();
    setLocalError(null);
    setBusy(true);
    try {
      await saveInstance(url);
      router.replace('/(auth)/login');
    } catch (err) {
      setLocalError(friendlyError(err, 'Could not save instance'));
    } finally {
      setBusy(false);
    }
  };

  const message = localError || error;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* NativeWind registers KeyboardAvoidingView with remapProps, not cssInterop, and RN
          composes its own paddingBottom into `style` — so `className` never resolves here.
          Keep the layout classes on a View and give the KAV a plain style. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-semibold text-text-primary">Coach Watts</Text>
          <Text className="mt-2 text-base text-text-muted">
            Enter your Coach Watts instance URL. Use the hosted app or your self-hosted base URL.
          </Text>

          <Text className="mb-2 mt-8 text-sm text-text-muted">Instance URL</Text>
          <TextInput
            className="rounded-xl border border-border-strong bg-card px-4 py-3 text-base text-text-primary"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://coachwatts.com"
            placeholderTextColor={theme.textMuted}
            value={url}
            onChangeText={setUrl}
            editable={!busy}
          />

          {message ? <Text className="mt-3 text-sm text-danger">{message}</Text> : null}

          <Button
            className="mt-6"
            label="Continue"
            loading={busy}
            onPress={() => void onContinue()}
          />

          <Pressable
            className="mt-3 items-center py-3 active:opacity-80"
            onPress={() => router.replace('/(auth)/login')}
            disabled={busy}
          >
            <Text className="text-sm font-semibold text-text-muted">Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
