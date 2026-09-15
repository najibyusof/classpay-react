import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, PaymentSummaryCard, Skeleton } from '../../components';
import type { PaymentSchedule } from '../../types/student';
import { spacing } from '../../theme';
import { toApiError } from '../../types/api';

interface CurrentPaymentScreenProps {
  schedules: readonly PaymentSchedule[] | null;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onSelectSchedule: (schedule: PaymentSchedule) => void;
}

export function CurrentPaymentScreen({
  schedules,
  isLoading,
  error,
  onRetry,
  onSelectSchedule,
}: CurrentPaymentScreenProps) {
  if (isLoading) return <Skeleton height={210} />;
  if (error) return <ErrorState message={toApiError(error).message} onRetry={onRetry} />;
  if (!schedules || schedules.length === 0)
    return (
      <EmptyState
        title="No current payment obligation"
        description="Current payment schedules will appear here when available."
      />
    );
  return (
    <View style={styles.container}>
      {schedules.map((schedule) => (
        <PaymentSummaryCard
          key={schedule.id}
          onPress={() => onSelectSchedule(schedule)}
          schedule={schedule}
          title="Current payment"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: spacing.sm } });
