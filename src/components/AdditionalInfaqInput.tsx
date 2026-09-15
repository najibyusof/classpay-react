import { TextInput } from './TextInput';

import type { MonetaryValue } from '../utils/money';
import { formatCurrency } from '../utils/money';

interface AdditionalInfaqInputProps {
  allowed: boolean;
  currency: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  minimum?: MonetaryValue | null;
  maximum?: MonetaryValue | null;
}

export function AdditionalInfaqInput({
  allowed,
  currency,
  value,
  onChangeText,
  error,
  minimum,
  maximum,
}: AdditionalInfaqInputProps) {
  const hint = allowed
    ? getInfaqHint(currency, minimum, maximum)
    : 'Additional infaq is not available for this schedule.';

  return (
    <TextInput
      editable={allowed}
      error={error}
      hint={hint}
      keyboardType="decimal-pad"
      label="Additional infaq"
      onChangeText={onChangeText}
      placeholder="0.00"
      value={allowed ? value : '0'}
    />
  );
}

function getInfaqHint(
  currency: string,
  minimum?: MonetaryValue | null,
  maximum?: MonetaryValue | null,
): string {
  if (minimum !== undefined && minimum !== null && maximum !== undefined && maximum !== null) {
    return `Between ${formatCurrency(minimum, currency)} and ${formatCurrency(maximum, currency)}.`;
  }
  if (minimum !== undefined && minimum !== null)
    return `Minimum ${formatCurrency(minimum, currency)}.`;
  if (maximum !== undefined && maximum !== null)
    return `Maximum ${formatCurrency(maximum, currency)}.`;
  return 'Optional amount. Enter up to two decimal places.';
}
