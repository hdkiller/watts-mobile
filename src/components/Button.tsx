import { ActivityIndicator, Text } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Colors } from '@/src/theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const containerByVariant: Record<ButtonVariant, string> = {
  primary: 'bg-brand-action',
  secondary: 'border border-zinc-700',
  danger: 'bg-zinc-800',
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: 'text-ink',
  secondary: 'text-white',
  danger: 'text-red-400',
};

const spinnerByVariant: Record<ButtonVariant, string> = {
  primary: Colors.background,
  secondary: Colors.brand,
  danger: Colors.danger,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const blocked = disabled || loading;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      className={`items-center rounded-xl py-3.5 ${containerByVariant[variant]} ${
        disabled && !loading ? 'opacity-50' : ''
      } ${className}`}
      onPress={onPress}
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
