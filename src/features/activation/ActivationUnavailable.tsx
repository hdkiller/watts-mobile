import { Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';

type Props = {
  error: unknown;
  isFetching: boolean;
  onRetry: () => void;
};

export function ActivationUnavailable({ error, isFetching, onRetry }: Props) {
  const { instanceUrl } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="text-center text-2xl font-semibold text-text-primary">
        Mobile activation unavailable
      </Text>
      <Text className="mt-3 text-center text-base leading-6 text-text-muted">
        {friendlyError(
          error,
          error instanceof Error
            ? error.message
            : 'This Coach Watts instance cannot continue mobile activation yet.'
        )}
      </Text>
      <View className="mt-6 w-full gap-3">
        <Button label="Try again" loading={isFetching} onPress={onRetry} />
        <Button
          variant="secondary"
          label="Open Coach Watts on web"
          onPress={() => void openInstanceWeb(instanceUrl, '/onboarding')}
        />
      </View>
    </View>
  );
}
