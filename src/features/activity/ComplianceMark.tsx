import { Text } from 'react-native';

import { complianceBadge, type ComplianceMark as Mark } from '@/src/features/activity/compliance';

export function ComplianceMarkView({ mark }: { mark: Mark | undefined }) {
  const badge = complianceBadge(mark);
  if (badge.mark === 'none') return null;
  return (
    <Text
      accessibilityLabel={badge.label}
      className={`ml-2 text-xs font-semibold ${badge.colorClass}`}
    >
      {badge.glyph}
    </Text>
  );
}
