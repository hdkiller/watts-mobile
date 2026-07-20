import { ActivityIndicator, Text } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { hapticLight } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  /** Light impact on press. Defaults to true. */
  haptic?: boolean;
  className?: string;
  testID?: string;
};

const containerByVariant: Record<ButtonVariant, string> = {
  primary: 'bg-brand-action',
  secondary: 'border border-border-strong',
  danger: 'bg-border-strong',
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: 'text-ink',
  secondary: 'text-text-primary',
  danger: 'text-red-400',
};

const spinnerByVariant: Record<ButtonVariant, string> = {
  primary: Colors.ink, // dark ink on brand fill — theme-invariant
  secondary: Colors.brand,
  danger: Colors.danger,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  haptic = true,
  className = '',
  testID,
}: ButtonProps) {
  const blocked = disabled || loading;
  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      className={`items-center rounded-xl py-3.5 ${containerByVariant[variant]} ${
        disabled && !loading ? 'opacity-50' : ''
      } ${className}`}
      onPress={() => {
        if (haptic) hapticLight();
        onPress();
      }}
      disabled={blocked}
    >
      {loading ? (
        <ActivityIndicator color={spinnerByVariant[variant]} />
      ) : (
        <Text className={`text-base font-semibold ${labelByVariant[variant]}`}>{label}</Text>
      )}
    </AnimatedPressable>
  );
}
