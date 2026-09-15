import { StyleSheet, Text, View } from 'react-native';

import { Button, PaymentStatusBadge } from '../../components';
import { colors, spacing, typography } from '../../theme';

export function PaymentFailedScreen({ onDone }: { onDone: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment failed</Text>
      <PaymentStatusBadge status="failed" />
      <Text style={styles.message}>
        The backend reported that this payment could not be completed.
      </Text>
      <Button label="Back to schedules" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { ...typography.heading, color: colors.text },
  message: { ...typography.body, color: colors.mutedText },
});
