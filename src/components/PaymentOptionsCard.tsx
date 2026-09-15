import { StyleSheet, Text, View } from 'react-native';

import type { PaymentOption } from '../types/student';
import { colors, spacing, typography } from '../theme';
import { Card } from './Card';

interface PaymentOptionsCardProps {
  options: readonly PaymentOption[];
}

export function PaymentOptionsCard({ options }: PaymentOptionsCardProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <Card>
      <Text style={styles.title}>Payment options</Text>
      <View style={styles.options}>
        {options.map((option, index) => (
          <Text key={getOptionKey(option, index)} style={styles.option}>
            {getOptionLabel(option)}
          </Text>
        ))}
      </View>
    </Card>
  );
}

function getOptionKey(option: PaymentOption, index: number): string {
  return typeof option === 'string' ? `${option}-${index}` : String(option.id ?? index);
}

function getOptionLabel(option: PaymentOption): string {
  if (typeof option === 'string') return option;
  return option.label ?? option.name ?? option.type ?? 'Payment option';
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  options: { gap: spacing.xs, marginTop: spacing.sm },
  option: { ...typography.bodySmall, color: colors.mutedText },
});
