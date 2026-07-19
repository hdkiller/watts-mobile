import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRedirectUri, isExpoGoRuntime } from '@/src/auth/oauth';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';

export default function LoginScreen() {
  const { instanceUrl, signIn, error, clearError } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSignIn = async () => {
    clearError();
    setLocalError(null);
    setBusy(true);
    try {
      await signIn();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const message = localError || error;

  return (
    <SafeAreaView className="flex-1 bg-surface-dark">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-semibold text-white">Sign in</Text>
        <Text className="mt-2 text-base text-ink-muted">
          Connect with Coach Watts using OAuth PKCE. Tokens stay on this device.
        </Text>

        <View className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
          <Text className="text-xs uppercase tracking-wide text-ink-muted">Instance</Text>
          <Text className="mt-1 text-base text-white">{instanceUrl}</Text>
          <Link href="/(auth)/instance" asChild>
            <Pressable className="mt-3 self-start" hitSlop={8}>
              <Text className="text-sm font-medium text-brand">Change instance</Text>
            </Pressable>
          </Link>
        </View>

        {message ? <Text className="mt-4 text-sm text-red-400">{message}</Text> : null}

        <Button
          className="mt-6"
          label="Sign in with Coach Watts"
          onPress={() => void onSignIn()}
          loading={busy}
        />

        <Text className="mt-6 text-xs leading-5 text-ink-muted">
          Redirect URI for OAuth app registration:{'\n'}
          <Text className="text-zinc-300">{getRedirectUri()}</Text>
          {isExpoGoRuntime()
            ? '\n\nExpo Go detected — if sign-in fails with redirect_uri mismatch, register this exp:// URI via:\npnpm cw:cli oauth create-mobile-app --owner-email … --force --redirect-uri \'<uri above>\''
            : '\n\nExpected registered URI: coachwatts://oauth/callback'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
