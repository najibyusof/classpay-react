import { StyleSheet, Text, View } from 'react-native';

import type { PaymentSchedule } from '../types/student';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';
import { CurrencyText } from './CurrencyText';
import { DateText } from './DateText';
import { StatusBadge } from './StatusBadge';

interface PaymentSummaryCardProps {
  schedule: PaymentSchedule;
  title?: string;
  onPress?: () => void;
}

export function PaymentSummaryCard({
  schedule,
  title = 'Current payment',
  onPress,
}: PaymentSummaryCardProps) {
  const className =
    typeof schedule.class === 'string'
      ? schedule.class
      : (schedule.class?.name ?? 'Class unavailable');

  return (
    <Card accessibilityLabel={`View ${title}`} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <StatusBadge
          label={schedule.payment_status}
          tone={getStatusTone(schedule.payment_status)}
        />
      </View>
      <CurrencyText amount={schedule.required_amount} style={styles.amount} />
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Due date</Text>
        <DateText style={styles.detailValue} value={schedule.due_date} />
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Current class</Text>
        <Text style={styles.detailValue}>{className}</Text>
      </View>
    </Card>
  );
}

function getStatusTone(
  status: string | null | undefined,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const normalizedStatus = status?.toLowerCase() ?? '';
  if (normalizedStatus === 'paid' || normalizedStatus === 'completed') return 'success';
  if (normalizedStatus === 'overdue' || normalizedStatus === 'failed') return 'danger';
  if (normalizedStatus === 'pending' || normalizedStatus === 'due') return 'warning';
  return 'neutral';
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.label, color: colors.mutedText },
  amount: { ...typography.display, color: colors.text, marginVertical: spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  detailLabel: { ...typography.bodySmall, color: colors.mutedText },
  detailValue: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
});
