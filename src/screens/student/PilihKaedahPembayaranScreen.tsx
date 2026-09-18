import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, CurrencyText, StatusBadge } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import type { PaymentSchedule, StudentClass } from '../../types/student';
import { KodQrPembayaranScreen } from './KodQrPembayaranScreen';

export function PilihKaedahPembayaranScreen({
  classItem,
  onBack,
  schedule,
}: {
  classItem: StudentClass;
  onBack: () => void;
  schedule: PaymentSchedule;
}) {
  const currency = schedule.currency ?? 'MYR';
  const [showQr, setShowQr] = useState(false);

  if (showQr)
    return (
      <KodQrPembayaranScreen
        classItem={classItem}
        onBack={() => setShowQr(false)}
        schedule={schedule}
      />
    );

  return (
    <View style={styles.flex}>
      <AppHeader onBackPress={onBack} title="Pilih Kaedah Pembayaran" />
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
            amount={schedule.required_amount}
            currency={currency}
            style={styles.amount}
          />
        </Card>
        <MethodOption
          description="Imbas kod QR untuk membuat pembayaran melalui aplikasi perbankan."
          icon="qr-code-outline"
          label="Imbas Kod QR"
          onPress={() => setShowQr(true)}
        />
        <ComingSoonMethodOption
          description="Bayar melalui pautan pembayaran (sistem pembayaran pihak ketiga)."
          icon="link-outline"
          label="Pembayaran Online"
        />
      </ScrollView>
    </View>
  );
}

function MethodOption({
  description,
  icon,
  label,
  onPress,
}: {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.method, pressed && styles.pressed]}
    >
      <View style={styles.methodIcon}>
        <Ionicons color={colors.info} name={icon} size={22} />
      </View>
      <View style={styles.methodCopy}>
        <Text style={styles.methodLabel}>{label}</Text>
        <Text style={styles.methodDescription}>{description}</Text>
      </View>
      <Ionicons color={colors.mutedText} name="chevron-forward" size={18} />
    </Pressable>
  );
}

function ComingSoonMethodOption({
  description,
  icon,
  label,
}: {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={[styles.method, styles.methodDisabled]}>
      <View style={styles.methodIcon}>
        <Ionicons color={colors.info} name={icon} size={22} />
      </View>
      <View style={styles.methodCopy}>
        <Text style={styles.methodLabel}>{label}</Text>
        <Text style={styles.methodDescription}>{description}</Text>
      </View>
      <StatusBadge label="Akan Datang" tone="neutral" />
    </View>
  );
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
  method: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  methodIcon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  methodCopy: { flex: 1 },
  methodLabel: { ...typography.label, color: colors.text },
  methodDescription: { ...typography.caption, color: colors.mutedText, marginTop: spacing.xxs },
  methodDisabled: { borderColor: colors.border, opacity: 0.7 },
  pressed: { opacity: 0.65 },
});
