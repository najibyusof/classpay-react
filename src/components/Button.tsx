import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
export type ButtonVariant = 'primary' | 'secondary' | 'brand' | 'outline' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
  children?: ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  fullWidth = true,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = buttonVariants[variant];

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variantStyle.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      testID={testID}
    >
      {loading ? <ActivityIndicator color={variantStyle.label.color} /> : null}
      {!loading && icon ? (
        <Ionicons color={variantStyle.label.color} name={icon} size={18} />
      ) : null}
      <Text style={[styles.label, variantStyle.label]}>{label}</Text>
    </Pressable>
  );
}

const buttonVariants = {
  primary: { container: { backgroundColor: colors.primary }, label: { color: colors.onPrimary } },
  secondary: { container: { backgroundColor: colors.accent }, label: { color: colors.onPrimary } },
  brand: { container: { backgroundColor: '#3327D6' }, label: { color: colors.onPrimary } },
  outline: {
    container: { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
    label: { color: colors.primary },
  },
  danger: { container: { backgroundColor: colors.danger }, label: { color: colors.onPrimary } },
  ghost: { container: { backgroundColor: 'transparent' }, label: { color: colors.primary } },
} as const;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.48 },
  label: typography.label,
});
