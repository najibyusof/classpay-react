import { Text } from 'react-native';

import type { ComponentProps } from 'react';

import type { MonetaryValue } from '../utils/money';
import { formatCurrency } from '../utils/money';

type NativeTextProps = ComponentProps<typeof Text>;

interface CurrencyTextProps extends Omit<NativeTextProps, 'children'> {
  amount: MonetaryValue;
  currency?: string;
}

export function CurrencyText({ amount, currency = 'MYR', ...props }: CurrencyTextProps) {
  const formattedAmount = formatCurrency(amount, currency);
  return <Text {...props}>{formattedAmount}</Text>;
}
