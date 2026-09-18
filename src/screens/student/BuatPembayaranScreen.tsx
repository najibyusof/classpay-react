import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AdditionalInfaqInput,
  AppHeader,
  Button,
  Card,
  CurrencyText,
  PaymentSummary,
} from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import type { PaymentSchedule, StudentClass } from '../../types/student';
import { isDecimalWithinRange, normalizeDecimal } from '../../utils/money';
import { PilihKaedahPembayaranScreen } from './PilihKaedahPembayaranScreen';

export function BuatPembayaranScreen({
  classItem,
  onBack,
  schedule,
}: {
  classItem: StudentClass;
  onBack: () => void;
  schedule: PaymentSchedule;
}) {
  const [additionalInfaq, setAdditionalInfaq] = useState('0');
  const [isChoosingMethod, setIsChoosingMethod] = useState(false);
  const [infaqError, setInfaqError] = useState<string | undefined>();
  const allowsInfaq = schedule.allow_additional_infaq === true;
  const currency = schedule.currency ?? 'MYR';

  const proceed = () => {
    const normalizedInfaq = allowsInfaq ? normalizeDecimal(additionalInfaq) : '0';
    if (!normalizedInfaq) {
      setInfaqError('Masukkan jumlah yang sah dengan dua tempat perpuluhan.');
      return;
    }
    if (!isDecimalWithinRange(normalizedInfaq, schedule.minimum_infaq, schedule.maximum_infaq)) {
      setInfaqError('Jumlah sumbangan infaq berada di luar julat yang dibenarkan.');
      return;
    }
    setInfaqError(undefined);
    setIsChoosingMethod(true);
  };

  if (isChoosingMethod)
    return (
      <PilihKaedahPembayaranScreen
        classItem={classItem}
        onBack={() => setIsChoosingMethod(false)}
        schedule={schedule}
      />
    );

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Buat Pembayaran" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Ionicons color={colors.mutedText} name="calendar-outline" size={16} />
            <Text style={styles.metaLabel}>Tarikh akhir:</Text>
          </View>
          <Text style={styles.metaValue}>
            {formatDate(schedule.due_date)}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons color={colors.mutedText} name="cash-outline" size={16} />
            <Text style={styles.metaLabel}>Jumlah diperlukan</Text>
          </View>
          <CurrencyText amount={schedule.required_amount} currency={currency} style={styles.metaAmount} />
        </View>
      </Card>
      {allowsInfaq ? (
        <View style={styles.infaqSection}>
          <Text style={styles.infaqLabel}>Sumbangan Infaq (Pilihan)</Text>
          <AdditionalInfaqInput
            allowed={allowsInfaq}
            currency={currency}
            error={infaqError}
            maximum={schedule.maximum_infaq}
            minimum={schedule.minimum_infaq}
            onChangeText={setAdditionalInfaq}
            value={additionalInfaq}
          />
          <Text style={styles.infaqHint}>
            Anda boleh menambah jumlah sumbangan jika ingin berinfaq lebih.
          </Text>
        </View>
      ) : null}
      <PaymentSummary additionalInfaq={allowsInfaq ? additionalInfaq : '0'} schedule={schedule} />
      <Button label="Teruskan" onPress={proceed} variant="brand" />
      </ScrollView>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
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
  meta: { gap: spacing.xs, marginTop: spacing.md },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  metaLabel: { ...typography.bodySmall, color: colors.mutedText },
  metaValue: { ...typography.body, color: colors.text, fontWeight: '600' },
  metaAmount: { ...typography.title, color: colors.text },
  infaqSection: { gap: spacing.xs },
  infaqLabel: { ...typography.label, color: colors.text },
  infaqHint: { ...typography.caption, color: colors.mutedText },
});
