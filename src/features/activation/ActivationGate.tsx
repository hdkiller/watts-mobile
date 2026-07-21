import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/src/theme/colors';

import { ActivationUnavailable } from './ActivationUnavailable';
import { activationHrefForStatus, useActivationStatus } from './useActivationStatus';
import { wizardRequired } from './mapStatus';

type Props = {
  children: React.ReactNode;
};

/**
 * When the instance supports activation fields and the wizard is incomplete,
 * force the activation stack. Older instances degrade open (children).
 */
export function ActivationGate({ children }: Props) {
  const { data, isLoading, isError, error, refetch, isFetching } = useActivationStatus(true);

  if (isLoading && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  if (isError) {
    return (
      <ActivationUnavailable
        error={error}
        isFetching={isFetching}
        onRetry={() => void refetch()}
      />
    );
  }

  if (data && wizardRequired(data)) {
    const href = activationHrefForStatus(data);
    if (href) {
      return <Redirect href={href as Href} />;
    }
  }

  return <>{children}</>;
}
