import { StyleSheet, Text, View } from 'react-native';

import type { StudentPayment } from '../types/student';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';
import { CurrencyText } from './CurrencyText';
import { DateText } from './DateText';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentCardProps {
  payment: StudentPayment;
  onPress: () => void;
}

export function PaymentCard({ payment, onPress }: PaymentCardProps) {
  const className =
    typeof payment.class === 'string'
      ? payment.class
      : (payment.class?.name ?? 'Class unavailable');
  const amount = payment.total_amount ?? payment.amount;

  return (
    <Card
      accessibilityLabel={`View payment ${payment.reference_number ?? payment.id}`}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.reference}>
            {payment.reference_number ?? `Payment ${payment.id}`}
          </Text>
          <Text style={styles.className}>{className}</Text>
        </View>
        <PaymentStatusBadge status={payment.status} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.method}>
          {payment.payment_method?.replace(/_/g, ' ') ?? 'Method unavailable'}
        </Text>
        <View style={styles.amounts}>
          <CurrencyText
            amount={amount}
            currency={payment.currency ?? 'MYR'}
            style={styles.amount}
          />
          {payment.paid_at ? <DateText style={styles.date} value={payment.paid_at} /> : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  reference: { ...typography.label, color: colors.text },
  className: { ...typography.caption, color: colors.mutedText, marginTop: spacing.xxs },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  method: { ...typography.bodySmall, color: colors.mutedText, textTransform: 'capitalize' },
  amounts: { alignItems: 'flex-end', gap: spacing.xxs },
  amount: { ...typography.label, color: colors.text },
  date: { ...typography.caption, color: colors.mutedText },
});
