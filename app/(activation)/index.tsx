/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Redirect, type Href } from 'expo-router';
import { View } from 'react-native';

import { Skeleton, SkeletonScreen } from '@/src/components/Skeleton';
import {
  activationHrefForStatus,
  useActivationStatus,
} from '@/src/features/activation/useActivationStatus';
import { wizardRequired } from '@/src/features/activation/mapStatus';
import { APP_HREFS } from '@/src/linking/appHrefs';

export default function ActivationIndex() {
  const { data, isLoading } = useActivationStatus(true);

  if (isLoading && !data) {
    return (
      <SkeletonScreen>
        <View className="flex-1 bg-surface px-6 pt-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-8 h-24 rounded-xl" />
          <Skeleton className="mt-3 h-12 rounded-xl" />
        </View>
      </SkeletonScreen>
    );
  }

  if (data && wizardRequired(data)) {
    const href = activationHrefForStatus(data);
    if (href) return <Redirect href={href as Href} />;
  }

  return <Redirect href={APP_HREFS.today as Href} />;
}
