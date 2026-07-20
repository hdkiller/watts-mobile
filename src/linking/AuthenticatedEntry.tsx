import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { migrateLegacyAppHref } from '@/src/linking/appHrefs';
import { consumePendingReturnPath } from '@/src/linking/pendingReturnPath';
import { Colors } from '@/src/theme/colors';

const DEFAULT_HOME = '/(app)/(tabs)/today';

/**
 * Post-login / authenticated index entry: honor a preserved deep-link return path.
 */
export function AuthenticatedEntry() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void consumePendingReturnPath().then((pending) => {
      if (!cancelled) {
        setHref(pending ? migrateLegacyAppHref(pending) : DEFAULT_HOME);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!href) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  return <Redirect href={href as Href} />;
}
