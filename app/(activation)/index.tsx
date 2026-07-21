import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import {
  activationHrefForStatus,
  useActivationStatus,
} from '@/src/features/activation/useActivationStatus';
import { wizardRequired } from '@/src/features/activation/mapStatus';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { Colors } from '@/src/theme/colors';

export default function ActivationIndex() {
  const { data, isLoading } = useActivationStatus(true);

  if (isLoading && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }

  if (data && wizardRequired(data)) {
    const href = activationHrefForStatus(data);
    if (href) return <Redirect href={href as Href} />;
  }

  return <Redirect href={APP_HREFS.today as Href} />;
}
