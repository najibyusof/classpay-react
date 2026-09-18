import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import {
  AdditionalInfaqInput,
  Button,
  ErrorState,
  PaymentMethodSelector,
  PaymentSummary,
} from '../../components';
import type {
  CreatedPayment,
  PaymentCreationAudience,
  PaymentMethod,
} from '../../services/paymentCreationService';
import { paymentCreationService } from '../../services/paymentCreationService';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { PaymentSchedule } from '../../types/student';
import { confirmAction } from '../../utils/confirmAction';
import { isDecimalWithinRange, normalizeDecimal } from '../../utils/money';
import { PaymentFailedScreen } from './PaymentFailedScreen';
import { PaymentPendingScreen } from './PaymentPendingScreen';
import { PaymentProcessingScreen } from './PaymentProcessingScreen';
import { PaymentSuccessScreen } from './PaymentSuccessScreen';
import { getPaymentResultScreen } from './paymentStatus';

interface PaymentConfirmationScreenProps {
  audience: PaymentCreationAudience;
  schedule: PaymentSchedule;
  onBack: () => void;
}

export function PaymentConfirmationScreen({
  audience,
  schedule,
  onBack,
}: PaymentConfirmationScreenProps) {
  const [method, setMethod] = useState<PaymentMethod>('merchant');
  const [additionalInfaq, setAdditionalInfaq] = useState('0');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infaqError, setInfaqError] = useState<string | undefined>();
  const [createdPayment, setCreatedPayment] = useState<CreatedPayment | null>(null);
  const queryClient = useQueryClient();
  const allowsInfaq = schedule.allow_additional_infaq === true;
  const currency = schedule.currency ?? 'MYR';

  const createPayment = useMutation({
    mutationFn: (request: { additionalInfaq: string; paymentMethod: PaymentMethod }) =>
      paymentCreationService.create(audience, schedule.id, request),
    onSuccess: async (payment) => {
      await queryClient.invalidateQueries({ queryKey: [audience, 'payment-schedules'] });
      await queryClient.invalidateQueries({ queryKey: [audience, 'payments'] });
      setCreatedPayment(payment);
    },
  });

  const submit = () => {
    const normalizedInfaq = allowsInfaq ? normalizeDecimal(additionalInfaq) : '0';
    if (!normalizedInfaq) {
      setInfaqError('Enter a valid amount with up to two decimal places.');
      return;
    }
    if (!isDecimalWithinRange(normalizedInfaq, schedule.minimum_infaq, schedule.maximum_infaq)) {
      setInfaqError('The additional infaq amount is outside the allowed range.');
      return;
    }

    setErrorMessage(null);
    setInfaqError(undefined);
    createPayment.mutate(
      {
        additionalInfaq: normalizedInfaq,
        paymentMethod: method,
      },
      { onError: (error) => setErrorMessage(toApiError(error).message) },
    );
  };

  if (createdPayment) {
    const resultScreen = getPaymentResultScreen(createdPayment.status);
    if (resultScreen === 'processing')
      return <PaymentProcessingScreen method={method} onDone={onBack} payment={createdPayment} />;
    if (resultScreen === 'success') return <PaymentSuccessScreen onDone={onBack} />;
    if (resultScreen === 'failed') return <PaymentFailedScreen onDone={onBack} />;
    return <PaymentPendingScreen onDone={onBack} status={createdPayment.status} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Button fullWidth={false} label="Back to schedule" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>Confirm payment</Text>
      {errorMessage ? <ErrorState message={errorMessage} /> : null}
      <PaymentMethodSelector
        disabled={createPayment.isPending}
        onChange={setMethod}
        value={method}
      />
      <AdditionalInfaqInput
        allowed={allowsInfaq}
        currency={currency}
        error={infaqError}
        maximum={schedule.maximum_infaq}
        minimum={schedule.minimum_infaq}
        onChangeText={setAdditionalInfaq}
        value={additionalInfaq}
      />
      <PaymentSummary additionalInfaq={allowsInfaq ? additionalInfaq : '0'} schedule={schedule} />
      <Button
        disabled={createPayment.isPending}
        label="Create payment"
        loading={createPayment.isPending}
        onPress={() =>
          confirmAction({
            confirmLabel: 'Create',
            message: 'Create this payment?',
            onConfirm: submit,
            title: 'Confirm create',
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
});
