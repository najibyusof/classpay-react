import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { ...typography.title, color: colors.text },
  description: { ...typography.bodySmall, color: colors.mutedText, textAlign: 'center' },
});
