import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StatusTone } from './StatusBadge';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface SnackbarProps {
  visible: boolean;
  message: string;
  tone?: Exclude<StatusTone, 'neutral'>;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}

export function Snackbar({
  visible,
  message,
  tone = 'info',
  actionLabel,
  onAction,
  onDismiss,
}: SnackbarProps) {
  if (!visible) {
    return null;
  }

  const toneColor = snackbarColors[tone];

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.container, { borderLeftColor: toneColor }]}
    >
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text style={[styles.action, { color: toneColor }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
        onPress={onDismiss}
        style={styles.dismiss}
      >
        <Text style={styles.dismissLabel}>Close</Text>
      </Pressable>
    </View>
  );
}

const snackbarColors = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.info,
} as const;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.sm,
    ...shadows.md,
  },
  message: { ...typography.bodySmall, color: colors.text, flex: 1 },
  action: typography.label,
  dismiss: { padding: spacing.xxs },
  dismissLabel: typography.caption,
});
