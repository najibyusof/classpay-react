import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { InfiniteData, UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { studentApi } from '../../api/studentApi';
import {
  Button,
  Card,
  CurrencyText,
  DateText,
  EmptyState,
  ErrorState,
  NotificationBell,
  Skeleton,
  StatusBadge,
} from '../../components';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { PaginatedResponse, PaymentSchedule } from '../../types/student';

export function StudentDashboardScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const currentScheduleQuery = useQuery({
    queryKey: ['student', 'payment-schedules', 'current'],
    queryFn: studentApi.getCurrentPaymentSchedule,
  });
  const schedulesQuery = useInfiniteQuery({
    queryKey: ['student', 'payment-schedules'],
    queryFn: ({ pageParam }) => studentApi.getPaymentSchedules(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
  const isRefreshing = currentScheduleQuery.isRefetching || schedulesQuery.isRefetching;
  const refresh = async () => {
    await Promise.all([currentScheduleQuery.refetch(), schedulesQuery.refetch()]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={() => void refresh()}
          refreshing={isRefreshing}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Text style={styles.greetingText}>Hai, {firstName(user?.name)}! 👋</Text>
          <Text style={styles.supportingText}>Teruskan pembelajaran anda</Text>
        </View>
        <NotificationBell onPress={() => navigation.navigate('Notifications' as never)} />
      </View>
      <OrganizationCard />
      <PaymentSummarySection query={currentScheduleQuery} />
      <MyClassesSection query={schedulesQuery} />
    </ScrollView>
  );
}

function firstName(name?: string | null) {
  if (!name) return 'Student';
  return name.trim().split(/\s+/)[0] ?? name;
}

function OrganizationCard() {
  const user = useAuthStore((state) => state.user);
  const organizationName =
    (user as { organization?: { name?: string } | null } | null)?.organization?.name ??
    'Al-Huda Education';

  return (
    <Card>
      <View style={styles.organizationRow}>
        <View style={styles.organizationIcon}>
          <Ionicons color={colors.info} name="business" size={22} />
        </View>
        <View style={styles.organizationCopy}>
          <Text style={styles.organizationLabel}>Organisasi Anda</Text>
          <Text numberOfLines={1} style={styles.organizationName}>
            {organizationName}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function PaymentSummarySection({ query }: { query: UseQueryResult<PaymentSchedule | null> }) {
  if (query.isLoading) return <Skeleton height={180} />;
  if (query.isError)
    return (
      <ErrorState message={toApiError(query.error).message} onRetry={() => void query.refetch()} />
    );
  if (!query.data)
    return (
      <EmptyState
        title="No current payment obligation"
        description="Your current payment schedule will appear here when available."
      />
    );
  const schedule = query.data;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
      </View>
      <Card>
        <View style={styles.summaryContent}>
          <CurrencyText amount={schedule.required_amount} style={styles.summaryAmount} />
          <Text style={styles.summaryHint}>
            Due <DateText value={schedule.due_date} />
          </Text>
        </View>
        <Button label="Bayar Sekarang" onPress={() => undefined} variant="danger" />
      </Card>
    </View>
  );
}

function MyClassesSection({
  query,
}: {
  query: UseInfiniteQueryResult<InfiniteData<PaginatedResponse<PaymentSchedule>>>;
}) {
  const schedules = query.data?.pages.flatMap((page) => page.data) ?? [];
  if (query.isLoading)
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kelas Saya</Text>
        <Skeleton height={72} />
        <Skeleton height={72} />
      </View>
    );
  if (query.isError)
    return (
      <ErrorState message={toApiError(query.error).message} onRetry={() => void query.refetch()} />
    );
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Kelas Saya</Text>
      {schedules.length === 0 ? (
        <EmptyState title="No classes yet" description="Your enrolled classes will appear here." />
      ) : (
        schedules.map((schedule) => <ClassRow key={schedule.id} schedule={schedule} />)
      )}
      {query.hasNextPage ? (
        <Button
          disabled={query.isFetchingNextPage}
          label="Load more"
          loading={query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
          variant="outline"
        />
      ) : null}
    </View>
  );
}

function ClassRow({ schedule }: { schedule: PaymentSchedule }) {
  const className =
    typeof schedule.class === 'string'
      ? schedule.class
      : (schedule.class?.name ?? 'Class');
  const paid = schedule.payment_status?.toLowerCase() === 'paid';
  return (
    <Card>
      <View style={styles.classRow}>
        <View style={[styles.classIcon, paid ? styles.classIconPaid : styles.classIconDue]}>
          <Ionicons color={colors.info} name="book" size={20} />
        </View>
        <View style={styles.classCopy}>
          <Text numberOfLines={1} style={styles.className}>
            {className}
          </Text>
          <Text numberOfLines={1} style={styles.classTeacher}>
            Due <DateText value={schedule.due_date} />
          </Text>
        </View>
        <StatusBadge
          label={paid ? 'Telah Dibayar' : 'Tertunggak'}
          tone={paid ? 'success' : 'danger'}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.md },
  greetingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  greetingCopy: { flex: 1, gap: spacing.xxs },
  greetingText: { ...typography.heading, color: colors.text },
  supportingText: { ...typography.bodySmall, color: colors.mutedText },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { ...typography.title, color: colors.text },
  organizationRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  organizationIcon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  organizationCopy: { flex: 1 },
  organizationLabel: { ...typography.caption, color: colors.mutedText },
  organizationName: { ...typography.label, color: colors.text },
  summaryContent: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  summaryAmount: { ...typography.display, color: colors.danger },
  summaryHint: { ...typography.caption, color: colors.mutedText },
  classRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  classIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  classIconDue: { backgroundColor: colors.infoSubtle },
  classIconPaid: { backgroundColor: colors.successSubtle },
  classCopy: { flex: 1 },
  className: { ...typography.label, color: colors.text },
  classTeacher: { ...typography.caption, color: colors.mutedText, marginTop: spacing.xxs },
});
