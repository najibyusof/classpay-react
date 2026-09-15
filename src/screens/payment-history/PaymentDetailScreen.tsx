import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, CurrencyText, DateText, PaymentStatusBadge } from '../../components';
import type { StudentPayment } from '../../types/student';
import { colors, spacing, typography } from '../../theme';

interface PaymentDetailScreenProps {
  payment: StudentPayment;
  onBack: () => void;
}

export function PaymentDetailScreen({ payment, onBack }: PaymentDetailScreenProps) {
  const className =
    typeof payment.class === 'string'
      ? payment.class
      : (payment.class?.name ?? 'Class unavailable');
  const currency = payment.currency ?? 'MYR';
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button fullWidth={false} label="Back to payments" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>Payment details</Text>
      <Card>
        <DetailRow
          label="Reference number"
          value={payment.reference_number ?? String(payment.id)}
        />
        <DetailRow label="Class" value={className} />
        <DetailRow
          label="Payment method"
          value={payment.payment_method?.replace(/_/g, ' ') ?? 'Not provided'}
        />
        <DetailRow
          label="Required amount"
          value={
            <CurrencyText
              amount={payment.required_amount ?? '0'}
              currency={currency}
              style={styles.value}
            />
          }
        />
        <DetailRow
          label="Additional infaq"
          value={
            <CurrencyText
              amount={payment.additional_infaq ?? '0'}
              currency={currency}
              style={styles.value}
            />
          }
        />
        <DetailRow
          label="Total amount"
          value={
            <CurrencyText
              amount={payment.total_amount ?? payment.amount}
              currency={currency}
              style={styles.value}
            />
          }
        />
        <DetailRow label="Currency" value={currency} />
        <DetailRow label="Status" value={<PaymentStatusBadge status={payment.status} />} />
        {payment.paid_at ? (
          <DetailRow
            label="Paid at"
            value={<DateText style={styles.value} value={payment.paid_at} />}
          />
        ) : null}
        {payment.created_at ? (
          <DetailRow
            label="Created at"
            value={<DateText style={styles.value} value={payment.created_at} />}
          />
        ) : null}
      </Card>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {typeof value === 'string' ? <Text style={styles.value}>{value}</Text> : value}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
  row: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: { ...typography.bodySmall, color: colors.mutedText },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '600', textAlign: 'right' },
});
