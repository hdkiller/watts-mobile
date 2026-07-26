import Svg, { Path } from 'react-native-svg';

import type { PlanStrategy } from './types';
import { STRATEGY_SPARKLINE_PATHS } from './planGeneratorHelpers';

type Props = {
  strategy: PlanStrategy;
  color: string;
  width?: number;
  height?: number;
};

/** Mini strategy trend matching web PlanWizard SVG sparklines. */
export function StrategySparkline({ strategy, color, width = 120, height = 28 }: Props) {
  const d = STRATEGY_SPARKLINE_PATHS[strategy];
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 20"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
