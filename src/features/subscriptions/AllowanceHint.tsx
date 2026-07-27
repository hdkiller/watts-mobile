/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Text } from 'react-native';

import { allowanceWindowSuffix } from './allowanceCopy';
import type { QuotaFeature } from './quota';
import { useAllowanceFor, useAllowanceHint } from './useQuotaAllowances';

type Props = {
  feature: QuotaFeature;
  className?: string;
};

/**
 * "2 left this week" beside a metered control.
 *
 * Renders nothing until the allowance is nearly gone: the point is to remove the
 * surprise of being blocked mid-task, not to put a counter on every button.
 */
export function AllowanceHint({ feature, className }: Props) {
  const hint = useAllowanceHint(feature);
  const allowance = useAllowanceFor(feature);
  if (!hint) return null;

  return (
    <Text className={`text-xs font-medium text-modify ${className ?? ''}`}>
      {hint}
      {allowanceWindowSuffix(allowance?.window)}
    </Text>
  );
}
