import { StyleSheet, Text, View } from 'react-native';

import type { RegistrationCapability } from '../registration/types';
import { colors, radius, spacing, typography } from '../theme';

interface RegistrationUnavailableNoticeProps {
  capability: RegistrationCapability;
}

export function RegistrationUnavailableNotice({ capability }: RegistrationUnavailableNoticeProps) {
  if (capability.isAvailable) {
    return null;
  }

  return (
    <View accessibilityRole="text" style={styles.container}>
      <Text style={styles.title}>Account registration</Text>
      <Text style={styles.message}>{capability.unavailableMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  title: { ...typography.label, color: colors.text },
  message: { ...typography.bodySmall, color: colors.mutedText },
});
