import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Button, Card, CurrencyText, PaymentStatusBadge } from '../../components';
import type { CreatedPayment, PaymentMethod } from '../../services/paymentCreationService';
import { colors, radius, spacing, typography } from '../../theme';
import { isTrustedHttpsUrl } from '../../utils/url';

interface PaymentProcessingScreenProps {
  payment: CreatedPayment;
  method: PaymentMethod;
  onDone: () => void;
}

export function PaymentProcessingScreen({ payment, method, onDone }: PaymentProcessingScreenProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const gateway = payment.gateway_response;
  const qrCodeUrl = isTrustedHttpsUrl(gateway?.qr_code_url) ? gateway.qr_code_url : undefined;
  const currency = gateway?.currency ?? 'MYR';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payment initiated</Text>
      <PaymentStatusBadge status="initiated" />
      <Text style={styles.message}>
        Follow the payment instructions supplied for your selected method.
      </Text>
      {method === 'merchant' ? (
        <MerchantInstructions instructions={gateway?.payment_instructions} />
      ) : null}
      {method === 'qr' ? (
        <QrInstructions gateway={gateway} onViewQr={() => setIsQrOpen(true)} />
      ) : null}
      {method === 'bank_transfer' ? (
        <BankTransferInstructions gateway={gateway} currency={currency} />
      ) : null}
      {method === 'manual' ? (
        <ManualInstructions instructions={gateway?.payment_instructions} />
      ) : null}
      <Button label="Back to schedules" onPress={onDone} />
      {qrCodeUrl ? (
        <QrViewer onClose={() => setIsQrOpen(false)} uri={qrCodeUrl} visible={isQrOpen} />
      ) : null}
    </ScrollView>
  );
}

function MerchantInstructions({ instructions }: { instructions?: string }) {
  return (
    <InstructionCard
      title="Merchant payment"
      instructions={
        instructions ?? 'Merchant payment information will be provided by the payment gateway.'
      }
    />
  );
}

function QrInstructions({
  gateway,
  onViewQr,
}: {
  gateway?: CreatedPayment['gateway_response'];
  onViewQr: () => void;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>QR payment</Text>
      {gateway?.payment_instructions ? (
        <Text style={styles.cardText}>{gateway.payment_instructions}</Text>
      ) : null}
      {isTrustedHttpsUrl(gateway?.qr_code_url) ? (
        <Button fullWidth={false} label="View QR code" onPress={onViewQr} variant="outline" />
      ) : null}
      {gateway?.qr_payload ? (
        <Text selectable style={styles.code}>
          {gateway.qr_payload}
        </Text>
      ) : null}
      {!gateway?.qr_code_url && !gateway?.qr_payload ? (
        <Text style={styles.cardText}>QR payment information has not been supplied yet.</Text>
      ) : null}
    </Card>
  );
}

function BankTransferInstructions({
  gateway,
  currency,
}: {
  gateway?: CreatedPayment['gateway_response'];
  currency: string;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Bank transfer</Text>
      <InstructionRow label="Bank name" value={gateway?.bank_name} />
      <InstructionRow label="Account name" value={gateway?.account_name} />
      <InstructionRow label="Account number" value={gateway?.account_number} selectable />
      <InstructionRow
        label="Amount"
        value={
          gateway?.amount === undefined ? undefined : (
            <CurrencyText amount={gateway.amount} currency={currency} style={styles.cardText} />
          )
        }
      />
      {gateway?.payment_instructions ? (
        <Text style={styles.cardText}>{gateway.payment_instructions}</Text>
      ) : null}
    </Card>
  );
}

function ManualInstructions({ instructions }: { instructions?: string }) {
  return (
    <InstructionCard
      title="Manual payment"
      instructions={instructions ?? 'Manual payment instructions have not been supplied yet.'}
    />
  );
}

function InstructionCard({ title, instructions }: { title: string; instructions: string }) {
  return (
    <Card>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{instructions}</Text>
    </Card>
  );
}

function InstructionRow({
  label,
  value,
  selectable = false,
}: {
  label: string;
  value?: string | React.ReactNode;
  selectable?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text selectable={selectable} style={styles.cardText}>
          {value}
        </Text>
      ) : (
        (value ?? <Text style={styles.cardText}>Not provided</Text>)
      )}
    </View>
  );
}

function QrViewer({
  visible,
  uri,
  onClose,
}: {
  visible: boolean;
  uri: string;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modal}>
        <Image
          accessibilityLabel="Payment QR code"
          resizeMode="contain"
          source={{ uri }}
          style={styles.qrImage}
        />
        <Pressable
          accessibilityLabel="Close QR code"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Text style={styles.closeLabel}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
  message: { ...typography.body, color: colors.mutedText },
  cardTitle: { ...typography.title, color: colors.text },
  cardText: { ...typography.bodySmall, color: colors.mutedText, marginTop: spacing.xs },
  code: { ...typography.bodySmall, color: colors.text, marginTop: spacing.sm },
  row: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  rowLabel: { ...typography.bodySmall, color: colors.mutedText },
  modal: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  qrImage: { backgroundColor: colors.surface, height: 280, width: 280 },
  closeButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeLabel: { ...typography.label, color: colors.text },
});
