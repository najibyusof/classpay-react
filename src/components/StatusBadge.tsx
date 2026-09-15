import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, badgeTones[tone].container]}>
      <Text style={[styles.label, badgeTones[tone].label]}>{label}</Text>
    </View>
  );
}

const badgeTones = {
  success: {
    container: { backgroundColor: colors.successSubtle },
    label: { color: colors.success },
  },
  warning: {
    container: { backgroundColor: colors.warningSubtle },
    label: { color: colors.warning },
  },
  danger: { container: { backgroundColor: colors.dangerSubtle }, label: { color: colors.danger } },
  info: { container: { backgroundColor: colors.infoSubtle }, label: { color: colors.info } },
  neutral: {
    container: { backgroundColor: colors.surfaceSubtle },
    label: { color: colors.mutedText },
  },
} as const;

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  label: typography.caption,
});
