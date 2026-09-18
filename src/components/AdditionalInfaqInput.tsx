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
    : 'Sumbangan infaq tidak tersedia untuk jadual ini.';

  return (
    <TextInput
      editable={allowed}
      error={error}
      hint={hint}
      keyboardType="decimal-pad"
      label="Sumbangan infaq"
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
    return `Antara ${formatCurrency(minimum, currency)} dan ${formatCurrency(maximum, currency)}.`;
  }
  if (minimum !== undefined && minimum !== null)
    return `Minimum ${formatCurrency(minimum, currency)}.`;
  if (maximum !== undefined && maximum !== null)
    return `Maksimum ${formatCurrency(maximum, currency)}.`;
  return 'Jumlah pilihan. Masukkan sehingga dua tempat perpuluhan.';
}
