import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { sponsorApi } from '../../api/sponsorApi';
import { studentApi } from '../../api/studentApi';
import { Button, EmptyState, ErrorState, PaymentSummaryCard, Select } from '../../components';
import type { PaymentSchedule } from '../../types/student';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { SponsorPaymentSchedule } from '../../types/sponsor';
import { CurrentPaymentScreen } from './CurrentPaymentScreen';
import { PaymentScheduleDetailScreen } from './PaymentScheduleDetailScreen';
import { filterPaymentSchedules, getScheduleClassName } from './paymentScheduleUtils';

type PaymentScheduleAudience = 'student' | 'sponsor';

interface PaymentScheduleListScreenProps {
  audience: PaymentScheduleAudience;
}

export function PaymentScheduleListScreen({ audience }: PaymentScheduleListScreenProps) {
  const [status, setStatus] = useState<
    'all' | 'upcoming' | 'pending' | 'partially_paid' | 'overdue' | 'paid' | 'cancelled'
  >('all');
  const [classId, setClassId] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null);
  const listQuery = useInfiniteQuery({
    queryKey: [audience, 'payment-schedules'],
    queryFn: ({ pageParam }) =>
      audience === 'student'
        ? studentApi.getPaymentSchedules(pageParam)
        : sponsorApi.getPaymentSchedules(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      (lastPage.meta?.current_page ?? 1) < (lastPage.meta?.last_page ?? 1)
        ? (lastPage.meta?.current_page ?? 1) + 1
        : undefined,
  });
  const currentQuery = useQuery({
    queryKey: [audience, 'payment-schedules', 'current'],
    queryFn: async (): Promise<PaymentSchedule[]> => {
      if (audience === 'student') {
        const schedule = await studentApi.getCurrentPaymentSchedule();
        return schedule ? [schedule] : [];
      }
      return sponsorApi.getCurrentPaymentSchedules();
    },
  });
  const schedules = listQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const classes = getClasses(schedules);
  const filteredSchedules = filterPaymentSchedules(schedules, status, classId);
  const isRefreshing = listQuery.isRefetching || currentQuery.isRefetching;
  const refresh = async () => {
    await Promise.all([listQuery.refetch(), currentQuery.refetch()]);
  };
  const currentSchedules = currentQuery.data ?? [];

  if (selectedSchedule)
    return (
      <PaymentScheduleDetailScreen
        audience={audience}
        onBack={() => setSelectedSchedule(null)}
        schedule={selectedSchedule}
      />
    );

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
      <Text style={styles.title}>Payment schedules</Text>
      <CurrentPaymentScreen
        error={currentQuery.isError ? currentQuery.error : null}
        isLoading={currentQuery.isLoading}
        onRetry={() => void currentQuery.refetch()}
        onSelectSchedule={setSelectedSchedule}
        schedules={currentSchedules}
      />
      <View style={styles.filters}>
        <Select label="Status" onValueChange={setStatus} options={statusOptions} value={status} />
        <Select
          label="Class"
          onValueChange={setClassId}
          options={[{ label: 'All classes', value: 'all' }, ...classes]}
          value={classId}
        />
      </View>
      <Text style={styles.sectionTitle}>All schedules</Text>
      {listQuery.isError ? (
        <ErrorState
          message={toApiError(listQuery.error).message}
          onRetry={() => void listQuery.refetch()}
        />
      ) : filteredSchedules.length === 0 && !listQuery.isLoading ? (
        <EmptyState
          title="No payment schedules"
          description="No payment schedules match the selected filters."
        />
      ) : (
        filteredSchedules.map((schedule) => (
          <PaymentSummaryCard
            key={schedule.id}
            onPress={() => setSelectedSchedule(schedule)}
            schedule={schedule}
            title={getScheduleTitle(schedule)}
          />
        ))
      )}
      {listQuery.hasNextPage ? (
        <Button
          disabled={listQuery.isFetchingNextPage}
          label="Load more"
          loading={listQuery.isFetchingNextPage}
          onPress={() => void listQuery.fetchNextPage()}
          variant="outline"
        />
      ) : null}
    </ScrollView>
  );
}

function getScheduleTitle(schedule: PaymentSchedule): string {
  return isSponsorPaymentSchedule(schedule)
    ? (schedule.student?.name ?? 'Sponsored student')
    : 'Payment schedule';
}

function isSponsorPaymentSchedule(schedule: PaymentSchedule): schedule is SponsorPaymentSchedule {
  return 'student' in schedule;
}

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Pending', value: 'pending' },
  { label: 'Partially paid', value: 'partially_paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
  { label: 'Cancelled', value: 'cancelled' },
] as const;

function getClasses(schedules: readonly PaymentSchedule[]) {
  const classes = new Map<string, string>();
  schedules.forEach((schedule) => {
    if (schedule.class && typeof schedule.class !== 'string')
      classes.set(String(schedule.class.id), getScheduleClassName(schedule));
  });
  return [...classes].map(([value, label]) => ({ label, value }));
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
  sectionTitle: { ...typography.title, color: colors.text },
  filters: { gap: spacing.sm },
});
