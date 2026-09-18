import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { InfiniteData, UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

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
import type { PaginatedResponse, PaymentSchedule, StudentClass } from '../../types/student';

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
      (lastPage.meta?.current_page ?? 1) < (lastPage.meta?.last_page ?? 1)
        ? (lastPage.meta?.current_page ?? 1) + 1
        : undefined,
  });
  const classesQuery = useInfiniteQuery({
    queryKey: ['student', 'classes'],
    queryFn: ({ pageParam }) => studentApi.getMyClasses(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      (lastPage.meta?.current_page ?? 1) < (lastPage.meta?.last_page ?? 1)
        ? (lastPage.meta?.current_page ?? 1) + 1
        : undefined,
  });
  const isRefreshing = currentScheduleQuery.isRefetching || classesQuery.isRefetching;
  const refresh = async () => {
    await Promise.all([currentScheduleQuery.refetch(), classesQuery.refetch()]);
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
      <MyClassesSection query={classesQuery} schedulesQuery={schedulesQuery} />
    </ScrollView>
  );
}

function firstName(name?: string | null) {
  if (!name) return 'Student';
  return name.trim().split(/\s+/)[0] ?? name;
}

function OrganizationCard() {
  const navigation = useNavigation();
  const organizationsQuery = useQuery({
    queryKey: ['student', 'organizations'],
    queryFn: studentApi.getMyOrganizations,
  });
  const organizations = organizationsQuery.data?.data ?? [];
  const isSingle = organizations.length === 1;
  const label = isSingle
    ? (organizations[0]?.name ?? 'Tiada organisasi')
    : 'Klik disini untuk melihat senarai organisasi';

  return (
    <Pressable
      accessibilityLabel="Lihat organisasi saya"
      accessibilityRole="button"
      onPress={() => navigation.navigate('MyOrganizations' as never)}
    >
      <Card>
        <View style={styles.organizationRow}>
          <View style={styles.organizationIcon}>
            <Ionicons color={colors.info} name="business" size={22} />
          </View>
          <View style={styles.organizationCopy}>
            <Text style={styles.organizationLabel}>Organisasi Anda</Text>
            <Text style={styles.organizationName}>{label}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
        </View>
        <Card>
          <View style={styles.summaryContent}>
            <Text style={styles.noPendingText}>Tiada Tunggakan Bayaran</Text>
          </View>
        </Card>
      </View>
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
  schedulesQuery,
}: {
  query: UseInfiniteQueryResult<InfiniteData<PaginatedResponse<StudentClass>>>;
  schedulesQuery: UseInfiniteQueryResult<InfiniteData<PaginatedResponse<PaymentSchedule>>>;
}) {
  const classes = query.data?.pages.flatMap((page) => page.data) ?? [];
  const schedules = schedulesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const unpaidClassIds = new Set(
    schedules
      .filter((schedule) => schedule.payment_status?.toLowerCase() !== 'paid')
      .map((schedule) =>
        typeof schedule.class === 'string' ? schedule.class : schedule.class?.id,
      ),
  );
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
      {classes.length === 0 ? (
        <EmptyState title="Tiada kelas" description="Kelas anda akan dipaparkan di sini." />
      ) : (
        classes.map((classItem) => (
          <ClassRow
            classItem={classItem}
            key={classItem.id}
            unpaid={unpaidClassIds.has(classItem.id) || unpaidClassIds.has(classItem.name)}
          />
        ))
      )}
      {query.hasNextPage ? (
        <Button
          disabled={query.isFetchingNextPage}
          label="Lihat lagi"
          loading={query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
          variant="outline"
        />
      ) : null}
    </View>
  );
}

function ClassRow({ classItem, unpaid }: { classItem: StudentClass; unpaid: boolean }) {
  const dayTime = [dayName(classItem.day_of_week), formatTime(classItem.start_time)]
    .filter(Boolean)
    .join(', ');
  return (
    <Card>
      <View style={styles.classRow}>
        <View style={[styles.classIcon, unpaid ? styles.classIconDue : styles.classIconPaid]}>
          <Ionicons color={colors.info} name="book" size={20} />
        </View>
        <View style={styles.classCopy}>
          <Text numberOfLines={1} style={styles.className}>
            {classItem.name}
          </Text>
          {classItem.teacher_name ? (
            <Text numberOfLines={1} style={styles.classTeacher}>
              {classItem.teacher_name}
            </Text>
          ) : null}
          {dayTime ? (
            <Text numberOfLines={1} style={styles.classTeacher}>
              {dayTime}
            </Text>
          ) : null}
        </View>
        <StatusBadge
          label={unpaid ? 'Tertunggak' : 'Telah Dibayar'}
          tone={unpaid ? 'danger' : 'success'}
        />
      </View>
    </Card>
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
  noPendingText: { ...typography.title, color: colors.text, textAlign: 'center' },
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
