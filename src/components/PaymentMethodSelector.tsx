import { Select } from './Select';

import type { PaymentMethod } from '../services/paymentCreationService';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <Select
      enabled={!disabled}
      label="Payment method"
      onValueChange={onChange}
      options={paymentMethodOptions}
      value={value}
    />
  );
}

const paymentMethodOptions = [
  { label: 'Merchant', value: 'merchant' },
  { label: 'QR', value: 'qr' },
  { label: 'Bank transfer', value: 'bank_transfer' },
  { label: 'Manual', value: 'manual' },
] as const;
