import { StyleSheet, Text, View } from 'react-native';

import { EmptyState, PaymentSummaryCard } from '../../components';
import type { SponsorPaymentSchedule } from '../../types/sponsor';
import { colors, spacing, typography } from '../../theme';

interface SponsoredStudentsScreenProps {
  schedules: readonly SponsorPaymentSchedule[];
}

export function SponsoredStudentsScreen({ schedules }: SponsoredStudentsScreenProps) {
  if (schedules.length === 0) {
    return (
      <EmptyState
        title="No payment schedules"
        description="Payment schedules for this sponsored student will appear here."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment schedules</Text>
      {schedules.map((schedule) => (
        <PaymentSummaryCard
          key={schedule.id}
          schedule={schedule}
          title={schedule.student?.name ?? 'Sponsored student'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
});
