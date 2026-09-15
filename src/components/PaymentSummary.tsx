import { StyleSheet, Text, View } from 'react-native';

import type { PaymentSchedule } from '../types/student';
import type { MonetaryValue } from '../utils/money';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';
import { CurrencyText } from './CurrencyText';

interface PaymentSummaryProps {
  schedule: PaymentSchedule;
  additionalInfaq: MonetaryValue;
}

export function PaymentSummary({ schedule, additionalInfaq }: PaymentSummaryProps) {
  const currency = schedule.currency ?? 'MYR';
  return (
    <Card>
      <Text style={styles.title}>Payment summary</Text>
      <PaymentSummaryRow
        label="Required amount"
        value={
          <CurrencyText
            amount={schedule.required_amount}
            currency={currency}
            style={styles.value}
          />
        }
      />
      <PaymentSummaryRow
        label="Additional infaq"
        value={<CurrencyText amount={additionalInfaq} currency={currency} style={styles.value} />}
      />
    </Card>
  );
}

function PaymentSummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {value}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  label: { ...typography.bodySmall, color: colors.mutedText },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
});
