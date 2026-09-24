import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { studentApi } from '../../api/studentApi';
import { AppHeader, Button, Card, CurrencyText, ErrorState, Skeleton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { PaymentSchedule, StudentClass } from '../../types/student';
import { environment } from '../../constants/environment';
import { isTrustedHttpsUrl } from '../../utils/url';

export function KodQrPembayaranScreen({
  classItem,
  onBack,
  schedule,
}: {
  classItem: StudentClass;
  onBack: () => void;
  schedule: PaymentSchedule;
}) {
  const scheduleQuery = useQuery({
    queryFn: () => studentApi.getPaymentSchedule(schedule.id),
    queryKey: ['student', 'payment-schedules', schedule.id],
  });
  const detail = scheduleQuery.data ?? schedule;
  const paymentSettingQuery = useQuery({
    queryFn: () => studentApi.getClassPaymentSetting(classItem.id),
    queryKey: ['student', 'classes', classItem.id, 'payment-setting'],
  });
  const paymentSetting = paymentSettingQuery.data;
  const qrCodeUrl = paymentSetting
    ? `${environment.apiBaseUrl}/classes/${classItem.id}/payment-setting/qr-code-file`
    : qrCodeUrlFrom(detail);
  const currency = detail.currency ?? 'MYR';

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Kod QR Pembayaran" />
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <View style={styles.identityRow}>
            <View style={styles.classIcon}>
              <Ionicons color={colors.info} name="book" size={22} />
            </View>
            <View style={styles.identityCopy}>
              <Text numberOfLines={1} style={styles.className}>
                {classItem.name}
              </Text>
              <Text numberOfLines={1} style={styles.organization}>
                {classItem.organization?.name ?? ''}
              </Text>
            </View>
          </View>
          <Text style={styles.amountLabel}>Jumlah Pembayaran</Text>
          <CurrencyText
            amount={detail.required_amount}
            currency={currency}
            style={styles.amount}
          />
        </Card>
        {scheduleQuery.isLoading ? <Skeleton height={220} /> : null}
        {scheduleQuery.isError && paymentSettingQuery.isError ? (
          <ErrorState
            message={normalizeApiError(scheduleQuery.error).message}
            onRetry={() => void scheduleQuery.refetch()}
          />
        ) : null}
        {!paymentSettingQuery.isLoading && (!paymentSettingQuery.isError || !scheduleQuery.isError) ? (
          <Card>
            <View style={styles.qrWrap}>
              {qrCodeUrl ? (
                <Image
                  accessibilityLabel="Kod QR pembayaran"
                  source={{ uri: qrCodeUrl }}
                  style={styles.qr}
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Ionicons color={colors.mutedText} name="qr-code-outline" size={58} />
                  <Text style={styles.qrHint}>Kod QR tidak tersedia</Text>
                </View>
              )}
            </View>
            {paymentSetting?.bank_name ?? bankName(detail) ? (
              <Text style={styles.bank}>{paymentSetting?.bank_name ?? bankName(detail)}</Text>
            ) : null}
            {paymentSetting?.bank_account_number ?? accountNumber(detail) ? (
              <Pressable
                accessibilityLabel="Copy account number"
                accessibilityRole="button"
                onPress={() => {
                  const value = paymentSetting?.bank_account_number ?? accountNumber(detail);
                  if (!value) return;
                  void Clipboard.setStringAsync(value).then(() =>
                    Alert.alert('Copied', 'The account number was copied to the clipboard.'),
                  );
                }}
                style={styles.accountRow}
              >
                <Text style={styles.accountNumber}>
                  {paymentSetting?.bank_account_number ?? accountNumber(detail)}
                </Text>
                <Ionicons color={colors.mutedText} name="copy-outline" size={16} />
              </Pressable>
            ) : null}
          </Card>
        ) : null}
        <Card>
          <View style={styles.noteRow}>
            <Ionicons color={colors.info} name="information-circle-outline" size={18} />
            <Text style={styles.note}>
              Selepas membuat pembayaran, status akan dikemas kini secara automatik.
            </Text>
          </View>
        </Card>
        <Button label="Kembali ke Kelas" onPress={onBack} variant="outline" />
      </ScrollView>
    </View>
  );
}

function qrCodeUrlFrom(schedule: PaymentSchedule) {
  const options = schedule.payment_options ?? [];
  for (const option of options) {
    if (typeof option === 'object' && option !== null) {
      const candidate = (option as { qr_code_url?: string }).qr_code_url;
      if (isTrustedHttpsUrl(candidate)) return candidate;
    }
  }
  return undefined;
}

function bankName(schedule: PaymentSchedule) {
  const options = schedule.payment_options ?? [];
  for (const option of options) {
    if (typeof option === 'object' && option !== null) {
      const value = (option as { bank_name?: string }).bank_name;
      if (value) return value;
    }
  }
  return undefined;
}

function accountNumber(schedule: PaymentSchedule) {
  const options = schedule.payment_options ?? [];
  for (const option of options) {
    if (typeof option === 'object' && option !== null) {
      const value = (option as { account_number?: string }).account_number;
      if (value) return value;
    }
  }
  return undefined;
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.md, padding: spacing.md },
  identityRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  classIcon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  identityCopy: { flex: 1 },
  className: { ...typography.title, color: colors.text },
  organization: { ...typography.caption, color: colors.mutedText },
  amountLabel: { ...typography.caption, color: colors.mutedText, marginTop: spacing.md },
  amount: { ...typography.display, color: colors.text },
  qrWrap: { alignItems: 'center', paddingVertical: spacing.md },
  qr: { borderRadius: radius.md, height: 220, width: 220 },
  qrPlaceholder: { alignItems: 'center', gap: spacing.xs, padding: spacing.lg },
  qrHint: { ...typography.caption, color: colors.mutedText },
  bank: { ...typography.title, color: colors.text, textAlign: 'center' },
  accountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  accountNumber: { ...typography.body, color: colors.text },
  noteRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  note: { ...typography.caption, color: colors.text, flex: 1 },
});
