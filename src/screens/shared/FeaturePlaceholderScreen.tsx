import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components';
import { colors, spacing, typography } from '../../theme';

interface FeaturePlaceholderScreenProps {
  title: string;
}

export function FeaturePlaceholderScreen({ title }: FeaturePlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <EmptyState
        title="Coming soon"
        description="This area will be available in a future phase."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
});
