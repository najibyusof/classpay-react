import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import {
  Button,
  Card,
  CurrencyText,
  DateText,
  PaymentOptionsCard,
  PaymentStatusBadge,
} from '../../components';
import type { PaymentSchedule } from '../../types/student';
import { colors, spacing, typography } from '../../theme';
import { getScheduleClassName } from './paymentScheduleUtils';
import { PaymentConfirmationScreen } from './PaymentConfirmationScreen';
import type { PaymentCreationAudience } from '../../services/paymentCreationService';

interface PaymentScheduleDetailScreenProps {
  schedule: PaymentSchedule;
  onBack: () => void;
  audience: PaymentCreationAudience;
}

export function PaymentScheduleDetailScreen({
  schedule,
  onBack,
  audience,
}: PaymentScheduleDetailScreenProps) {
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const isSettled =
    schedule.payment_status?.toLowerCase() === 'paid' || schedule.status?.toLowerCase() === 'paid';
  const currency = schedule.currency ?? 'MYR';

  if (isCreatingPayment) {
    return (
      <PaymentConfirmationScreen
        audience={audience}
        onBack={() => setIsCreatingPayment(false)}
        schedule={schedule}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button fullWidth={false} label="Back to schedules" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>Payment schedule</Text>
      <Card>
        <View style={styles.header}>
          <Text style={styles.className}>{getScheduleClassName(schedule)}</Text>
          <PaymentStatusBadge status={schedule.payment_status} />
        </View>
        <DetailRow
          label="Period"
          value={
            <>
              <DateText style={styles.value} value={schedule.period_start} />
              <Text style={styles.value}> - </Text>
              <DateText style={styles.value} value={schedule.period_end} />
            </>
          }
        />
        <DetailRow
          label="Due date"
          value={<DateText style={styles.value} value={schedule.due_date} />}
        />
        <DetailRow
          label="Required amount"
          value={
            <CurrencyText
              amount={schedule.required_amount}
              currency={currency}
              style={styles.value}
            />
          }
        />
        <DetailRow label="Currency" value={<Text style={styles.value}>{currency}</Text>} />
        {schedule.outstanding_amount !== undefined && schedule.outstanding_amount !== null ? (
          <DetailRow
            label="Outstanding amount"
            value={
              <CurrencyText
                amount={schedule.outstanding_amount}
                currency={currency}
                style={styles.value}
              />
            }
          />
        ) : null}
      </Card>
      <PaymentOptionsCard options={schedule.payment_options} />
      <Button
        accessibilityHint={
          isSettled
            ? 'This payment schedule is already settled'
            : 'Continue to payment confirmation'
        }
        disabled={isSettled}
        label={isSettled ? 'Payment settled' : 'Pay now'}
        onPress={() => setIsCreatingPayment(true)}
      />
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>{value}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  className: { ...typography.title, color: colors.text, flex: 1 },
  row: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: { ...typography.bodySmall, color: colors.mutedText },
  valueContainer: { alignItems: 'flex-end', flexDirection: 'row', flexShrink: 1 },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
});
