import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendlyError } from '@/src/api/errors';
import { getRedirectUri, isExpoGoRuntime } from '@/src/auth/oauth';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { useThemeColors } from '@/src/theme/useThemeColors';

const showDevRegistration = __DEV__ || isExpoGoRuntime();

export default function LoginScreen() {
  const theme = useThemeColors();
  const { instanceUrl, defaultInstanceUrl, signIn, error, clearError, saveInstance } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSignIn = async () => {
    clearError();
    setLocalError(null);
    setBusy(true);
    try {
      await signIn();
    } catch (err) {
      setLocalError(friendlyError(err, 'Sign-in failed'));
    } finally {
      setBusy(false);
    }
  };

  const message = localError || error;
  const isDefault = !instanceUrl || instanceUrl === defaultInstanceUrl;

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-surface">
      <View className="flex-1 justify-center px-6">
        <Image
          source={require('../../assets/images/wordmark.png')}
          accessibilityLabel="Coach Watts"
          style={{ width: 192, height: 40, marginBottom: 24 }}
          resizeMode="contain"
          tintColor={theme.textPrimary}
        />
        <Text className="text-3xl font-semibold text-text-primary">Sign in</Text>
        <Text className="mt-2 text-base text-text-muted">
          Connect with Coach Watts using OAuth PKCE. Tokens stay on this device.
        </Text>

        {!isDefault ? (
          <View className="mt-8 rounded-xl border border-border bg-card/80 p-4">
            <Text className="text-xs uppercase tracking-wide text-text-muted">Instance URL</Text>
            <Text className="mt-1 text-base text-text-primary">{instanceUrl}</Text>
            <View className="mt-3 flex-row gap-4">
              <Link href="/(auth)/instance" asChild>
                <Pressable hitSlop={8}>
                  <Text className="text-sm font-medium text-brand">Change URL</Text>
                </Pressable>
              </Link>
              <Pressable
                hitSlop={8}
                onPress={async () => {
                  try {
                    setBusy(true);
                    await saveInstance(defaultInstanceUrl);
                  } catch (err) {
                    setLocalError(friendlyError(err, 'Failed to restore default'));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Text className="text-sm font-medium text-red-400">Reset to default</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {message ? <Text className="mt-4 text-sm text-red-400">{message}</Text> : null}

        <Button
          testID="login-sign-in"
          className="mt-6"
          label="Sign in with Coach Watts"
          onPress={() => void onSignIn()}
          loading={busy}
        />

        {isDefault ? (
          <Link href="/(auth)/instance" asChild>
            <Pressable className="mt-6 align-center self-center" hitSlop={8}>
              <Text className="text-sm font-medium text-brand">Use self-hosted instance</Text>
            </Pressable>
          </Link>
        ) : null}

        {showDevRegistration ? (
          <Text className="mt-6 text-xs leading-5 text-text-muted">
            Redirect URI for OAuth app registration:{'\n'}
            <Text className="text-text-body">{getRedirectUri()}</Text>
            {isExpoGoRuntime()
              ? '\n\nExpo Go detected — if sign-in fails with redirect_uri mismatch, register this exp:// URI via:\npnpm cw:cli oauth create-mobile-app --owner-email … --force --redirect-uri \'<uri above>\''
              : '\n\nExpected registered URI: coachwatts://oauth/callback'}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
