import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  activationHrefForStatus,
  useActivationStatus,
} from '@/src/features/activation/useActivationStatus';
import { wizardRequired } from '@/src/features/activation/mapStatus';
import { migrateLegacyAppHref } from '@/src/linking/appHrefs';
import { consumePendingReturnPath } from '@/src/linking/pendingReturnPath';
import { Colors } from '@/src/theme/colors';

const DEFAULT_HOME = '/(app)/(tabs)/today';

/**
 * Post-login / authenticated index entry: activation wizard when needed,
 * otherwise honor a preserved deep-link return path.
 */
export function AuthenticatedEntry() {
  const { data: activation, isLoading, isError } = useActivationStatus(true);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const activationHref =
    !isError && activation && wizardRequired(activation)
      ? (activationHrefForStatus(activation) ?? '/(activation)')
      : null;

  useEffect(() => {
    if (isLoading || activationHref) return;

    let cancelled = false;
    void consumePendingReturnPath().then((pending) => {
      if (!cancelled) {
        setPendingHref(pending ? migrateLegacyAppHref(pending) : DEFAULT_HOME);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activationHref, isLoading]);

  const href = activationHref ?? pendingHref;

  if (!href) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  return <Redirect href={href as Href} />;
}
