import { StyleSheet, Text, View } from 'react-native';

import { Button, PaymentStatusBadge } from '../../components';
import { colors, spacing, typography } from '../../theme';

export function PaymentPendingScreen({ status, onDone }: { status: string; onDone: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment pending</Text>
      <PaymentStatusBadge status={status} />
      <Text style={styles.message}>
        Your payment is awaiting confirmation. It has not been marked as paid.
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
