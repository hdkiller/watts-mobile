import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Colors } from '@/src/theme/colors';

export default function InstanceScreen() {
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
    <SafeAreaView className="flex-1 bg-surface-dark">
      <KeyboardAvoidingView
        className="flex-1 justify-center px-6"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text className="text-3xl font-semibold text-white">Coach Watts</Text>
        <Text className="mt-2 text-base text-ink-muted">
          Enter your Coach Watts instance URL. Use the hosted app or your self-hosted base URL.
        </Text>

        <Text className="mt-8 mb-2 text-sm text-ink-muted">Instance URL</Text>
        <TextInput
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="https://coachwatts.com"
          placeholderTextColor={Colors.textMuted}
          value={url}
          onChangeText={setUrl}
          editable={!busy}
        />

        {message ? <Text className="mt-3 text-sm text-red-400">{message}</Text> : null}

        <Pressable
          className="mt-6 items-center rounded-xl bg-brand-action py-3.5 active:opacity-80"
          onPress={() => void onContinue()}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#09090b" />
          ) : (
            <Text className="text-base font-semibold text-ink">Continue</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
