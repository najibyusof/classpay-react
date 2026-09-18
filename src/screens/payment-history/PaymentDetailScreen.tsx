import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AppHeader,
  Button,
  Card,
  CurrencyText,
  DateText,
  PaymentStatusBadge,
} from '../../components';
import { adminApi } from '../../api/adminApi';
import type { StudentPayment } from '../../types/student';
import { colors, spacing, typography } from '../../theme';

interface PaymentDetailScreenProps {
  payment: StudentPayment;
  onBack: () => void;
  canVerify?: boolean;
  onVerified?: () => void;
}

export function PaymentDetailScreen({
  canVerify = false,
  onBack,
  onVerified,
  payment,
}: PaymentDetailScreenProps) {
  const className =
    typeof payment.class === 'string'
      ? payment.class
      : (payment.class?.name ?? 'Class unavailable');
  const currency = payment.currency ?? 'MYR';
  const organizationName = payment.organization?.name;
  const paymentStatus = payment.status.toLowerCase();
  const isPaid = paymentStatus === 'paid';
  const canDownloadReceipt = isPaid || paymentStatus === 'verified';

  const downloadReceipt = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: receiptHtml(payment, className) });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Receipt ready', `The PDF was created at ${uri}.`);
        return;
      }
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Download payment receipt',
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
      });
    } catch {
      Alert.alert('Download failed', 'The payment receipt could not be generated.');
    }
  };

  const verifyPayment = async () => {
    try {
      await adminApi.updatePayment(payment.id, { status: 'verified' });
      Alert.alert('Payment verified', 'The payment has been verified successfully.');
      onVerified?.();
    } catch {
      Alert.alert('Verification failed', 'The payment could not be verified.');
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Payment Receipt" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.receiptHeading}>
          <Text style={styles.title}>Payment receipt</Text>
          <Text style={styles.subtitle}>Thank you for your payment</Text>
        </View>
        <Card>
          <View style={styles.receiptTop}>
            <View>
              <Text style={styles.reference}>Payment receipt</Text>
              <Text style={styles.referenceValue}>
                {payment.reference_number ?? String(payment.id)}
              </Text>
            </View>
            <PaymentStatusBadge status={payment.status} />
          </View>
          <DetailRow label="Payer" value={payment.payer?.name ?? 'Not provided'} />
          {payment.payer?.phone ? <DetailRow label="Phone" value={payment.payer.phone} /> : null}
          <DetailRow label="Organization" value={organizationName ?? 'Not provided'} />
          <DetailRow label="Class" value={className} />
          <DetailRow
            label="Payment method"
            value={payment.payment_method?.replace(/_/g, ' ') ?? 'Not provided'}
          />
          <View style={styles.divider} />
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
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <CurrencyText
              amount={payment.total_amount ?? payment.amount}
              currency={currency}
              style={styles.totalValue}
            />
          </View>
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
        {canVerify && isPaid ? (
          <Button
            icon="checkmark-circle-outline"
            label="Verify Payment"
            onPress={() =>
              Alert.alert('Verify payment', 'Confirm this paid payment?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Verify', onPress: () => void verifyPayment() },
              ])
            }
          />
        ) : null}
        {canDownloadReceipt ? (
          <Button icon="download-outline" label="Download PDF" onPress={() => void downloadReceipt()} />
        ) : null}
      </ScrollView>
    </View>
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
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.md, padding: spacing.md },
  receiptHeading: { gap: spacing.xxs },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.mutedText },
  receiptTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  reference: { ...typography.caption, color: colors.mutedText },
  referenceValue: { ...typography.label, color: colors.text, marginTop: spacing.xxs },
  row: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: { ...typography.bodySmall, color: colors.mutedText },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '600', textAlign: 'right' },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: spacing.xs },
  totalRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  totalLabel: { ...typography.label, color: colors.text },
  totalValue: { ...typography.title, color: colors.primary },
});

function receiptHtml(payment: StudentPayment, className: string) {
  const currency = escapeHtml(payment.currency ?? 'MYR');
  const total = escapeHtml(String(payment.total_amount ?? payment.amount));
  const reference = escapeHtml(payment.reference_number ?? String(payment.id));
  const payer = escapeHtml(payment.payer?.name ?? 'Not provided');
  const organization = escapeHtml(payment.organization?.name ?? 'Not provided');
  const method = escapeHtml(payment.payment_method?.replace(/_/g, ' ') ?? 'Not provided');

  return `<!doctype html>
    <html><head><meta name="viewport" content="width=device-width" /><style>
      body { font-family: sans-serif; color: #1E2B25; padding: 28px; }
      h1 { color: #0B6B4B; margin-bottom: 4px; }
      .muted { color: #66756D; }
      .row { border-top: 1px solid #D7E0D9; padding: 12px 0; }
      .label { color: #66756D; display: inline-block; width: 42%; }
      .total { border-top: 2px solid #0B6B4B; font-size: 20px; font-weight: bold; padding-top: 16px; }
    </style></head><body>
      <h1>Payment Receipt</h1><p class="muted">${reference}</p>
      <div class="row"><span class="label">Payer</span>${payer}</div>
      <div class="row"><span class="label">Organization</span>${organization}</div>
      <div class="row"><span class="label">Class</span>${escapeHtml(className)}</div>
      <div class="row"><span class="label">Payment method</span>${method}</div>
      <div class="row total"><span class="label">Total paid</span>${currency} ${total}</div>
    </body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[
        character
      ] ?? character,
  );
}
