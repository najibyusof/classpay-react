import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { studentApi } from '../../api/studentApi';
import { Button, Card, CurrencyText, DateText, ErrorState, Skeleton, StatusBadge } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { PaymentSchedule, StudentClass } from '../../types/student';
import { BuatPembayaranScreen } from './BuatPembayaranScreen';

export function ClassDetailScreen({
  classItem,
  onBack,
}: {
  classItem: StudentClass;
  onBack: () => void;
}) {
  const [isPaying, setIsPaying] = useState(false);
  const currentScheduleQuery = useQuery({
    queryKey: ['student', 'payment-schedules', 'current'],
    queryFn: studentApi.getCurrentPaymentSchedule,
  });
  const schedule = currentScheduleQuery.data ?? null;

  if (isPaying && schedule)
    return (
      <BuatPembayaranScreen
        classItem={classItem}
        onBack={() => setIsPaying(false)}
        schedule={schedule}
      />
    );

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Kembali"
          accessibilityRole="button"
          hitSlop={spacing.sm}
          onPress={onBack}
          style={styles.headerButton}
        >
          <Ionicons color={colors.text} name="arrow-back" size={22} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {classItem.name}
        </Text>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <View style={styles.identityRow}>
            <View style={styles.classIcon}>
              <Ionicons color={colors.info} name="book" size={24} />
            </View>
            <View style={styles.identityCopy}>
              <Text numberOfLines={1} style={styles.className}>
                {classItem.name}
              </Text>
              <Text numberOfLines={1} style={styles.organization}>
                {classItem.organization?.name ?? ''}
              </Text>
            </View>
            <StatusBadge label="Tertunggak" tone="danger" />
          </View>
        </Card>
        <Card>
          <DetailRow icon="person-outline" label={classItem.teacher_name ?? '--'} />
          <DetailRow icon="calendar-outline" label={dayName(classItem.day_of_week) ?? '--'} />
          <DetailRow icon="time-outline" label={formatTime(classItem.start_time) ?? '--'} />
          <DetailRow
            icon="repeat-outline"
            label={classItem.frequency ? frequencyLabel(classItem.frequency) : '--'}
          />
        </Card>
        <CurrentPaymentCard query={currentScheduleQuery} onPay={() => setIsPaying(true)} />
        <ActionLink icon="calendar" label="Jadual & Sejarah Pembayaran" onPress={() => undefined} />
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons color={colors.mutedText} name={icon} size={18} />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

function CurrentPaymentCard({
  onPay,
  query,
}: {
  onPay: () => void;
  query: UseQueryResult<PaymentSchedule | null>;
}) {
  if (query.isLoading) return <Skeleton height={150} />;
  if (query.isError)
    return (
      <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} />
    );
  if (!query.data) return null;
  const schedule = query.data;
  return (
    <Card>
      <Text style={styles.sectionTitle}>Pembayaran Semasa</Text>
      <View style={styles.summaryContent}>
        <CurrencyText amount={schedule.required_amount} style={styles.summaryAmount} />
        <Text style={styles.summaryHint}>
          Tarikh akhir: <DateText value={schedule.due_date} />
        </Text>
        <Text style={styles.summaryHint}>Status: Tertunggak</Text>
      </View>
      <Button label="Bayar Sekarang" onPress={onPay} variant="danger" />
    </Card>
  );
}

function ActionLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionLink, pressed && styles.pressed]}
    >
      <Ionicons color={colors.info} name={icon} size={20} />
      <Text style={styles.actionLabel}>{label}</Text>
      <Ionicons color={colors.mutedText} name="chevron-forward" size={18} />
    </Pressable>
  );
}

function dayName(dayOfWeek?: number) {
  if (dayOfWeek === undefined) return undefined;
  return ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'][dayOfWeek];
}

function formatTime(value?: string | null) {
  if (!value) return undefined;
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function frequencyLabel(value: string) {
  const map: Record<string, string> = {
    fortnightly: 'Dua Minggu',
    monthly: 'Bulanan',
    weekly: 'Mingguan',
  };
  return map[value] ?? value;
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: spacing.md,
  },
  headerButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  headerTitle: { ...typography.title, color: colors.text, flex: 1 },
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
  detailRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  detailLabel: { ...typography.body, color: colors.text },
  sectionTitle: { ...typography.label, color: colors.text },
  summaryContent: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  summaryAmount: { ...typography.display, color: colors.danger },
  summaryHint: { ...typography.caption, color: colors.mutedText },
  actionLink: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  actionLabel: { ...typography.body, color: colors.text, flex: 1 },
  pressed: { opacity: 0.65 },
});
