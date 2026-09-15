import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { sponsorApi } from '../../api/sponsorApi';
import {
  Card,
  CurrencyText,
  DateText,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '../../components';
import { SponsoredStudentSelector } from '../../components/SponsoredStudentSelector';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { SponsorPaymentPage } from '../../types/sponsor';
import {
  getScheduleSummary,
  getSponsoredStudents,
  filterSchedulesByStudent,
} from './sponsorDashboardUtils';
import { SponsoredStudentsScreen } from './SponsoredStudentsScreen';

export function SponsorDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const [selectedStudentId, setSelectedStudentId] = useState('all');
  const schedulesQuery = useInfiniteQuery({
    queryKey: ['sponsor', 'payment-schedules'],
    queryFn: ({ pageParam }) => sponsorApi.getPaymentSchedules(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
  const currentSchedulesQuery = useQuery({
    queryKey: ['sponsor', 'payment-schedules', 'current'],
    queryFn: sponsorApi.getCurrentPaymentSchedules,
  });
  const paymentsQuery = useInfiniteQuery({
    queryKey: ['sponsor', 'payments'],
    queryFn: ({ pageParam }) => sponsorApi.getPayments(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
  const schedules = schedulesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const currentSchedules = currentSchedulesQuery.data ?? [];
  const students = getSponsoredStudents([...schedules, ...currentSchedules]);
  const filteredSchedules = filterSchedulesByStudent(schedules, selectedStudentId);
  const filteredCurrentSchedules = filterSchedulesByStudent(currentSchedules, selectedStudentId);
  const summary = getScheduleSummary(filteredSchedules);
  const isRefreshing =
    schedulesQuery.isRefetching || currentSchedulesQuery.isRefetching || paymentsQuery.isRefetching;
  const refresh = async () => {
    await Promise.all([
      schedulesQuery.refetch(),
      currentSchedulesQuery.refetch(),
      paymentsQuery.refetch(),
    ]);
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
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Assalamu alaikum, {user?.name ?? 'Sponsor'}</Text>
        <Text style={styles.supportingText}>Your sponsored students' payment overview.</Text>
      </View>
      {schedulesQuery.isLoading ? (
        <Skeleton height={56} />
      ) : (
        <SponsoredStudentSelector
          onSelectStudent={setSelectedStudentId}
          selectedStudentId={selectedStudentId}
          students={students}
        />
      )}
      <DashboardContent
        currentError={
          currentSchedulesQuery.isError ? toApiError(currentSchedulesQuery.error).message : null
        }
        currentSchedules={filteredCurrentSchedules}
        scheduleError={schedulesQuery.isError ? toApiError(schedulesQuery.error).message : null}
        scheduleSummary={summary}
        schedules={filteredSchedules}
        studentCount={students.length}
      />
      <RecentPaymentActivity paymentsQuery={paymentsQuery} selectedStudentId={selectedStudentId} />
    </ScrollView>
  );
}

function DashboardContent({
  currentError,
  currentSchedules,
  scheduleError,
  scheduleSummary,
  schedules,
  studentCount,
}: {
  currentError: string | null;
  currentSchedules: ReturnType<typeof filterSchedulesByStudent>;
  scheduleError: string | null;
  scheduleSummary: ReturnType<typeof getScheduleSummary>;
  schedules: ReturnType<typeof filterSchedulesByStudent>;
  studentCount: number;
}) {
  if (scheduleError || currentError)
    return (
      <ErrorState message={scheduleError ?? currentError ?? 'Unable to load payment schedules.'} />
    );
  return (
    <View style={styles.section}>
      <View style={styles.metrics}>
        <MetricCard label="Sponsored students" value={String(studentCount)} />
        <MetricCard label="Outstanding payments" value={String(scheduleSummary.outstanding)} />
        <MetricCard label="Upcoming payments" value={String(scheduleSummary.upcoming)} />
        <MetricCard
          label="Overdue payments"
          tone="danger"
          value={String(scheduleSummary.overdue)}
        />
      </View>
      <SponsoredStudentsScreen
        schedules={currentSchedules.length > 0 ? currentSchedules : schedules}
      />
    </View>
  );
}

function MetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <Card>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={[styles.metricLabel, tone === 'danger' && styles.danger]}>{label}</Text>
    </Card>
  );
}

function RecentPaymentActivity({
  paymentsQuery,
  selectedStudentId,
}: {
  paymentsQuery: UseInfiniteQueryResult<InfiniteData<SponsorPaymentPage>>;
  selectedStudentId: string;
}) {
  const payments = (paymentsQuery.data?.pages.flatMap((page) => page.data) ?? []).filter(
    (payment) => selectedStudentId === 'all' || String(payment.student?.id) === selectedStudentId,
  );
  if (paymentsQuery.isLoading)
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent payment activity</Text>
        <Skeleton height={88} />
      </View>
    );
  if (paymentsQuery.isError)
    return (
      <ErrorState
        message={toApiError(paymentsQuery.error).message}
        onRetry={() => void paymentsQuery.refetch()}
      />
    );
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent payment activity</Text>
      {payments.length === 0 ? (
        <EmptyState
          title="No payment activity"
          description="Payment activity for sponsored students will appear here."
        />
      ) : (
        payments.slice(0, 5).map((payment) => (
          <Card key={payment.id}>
            <View style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentName}>
                  {payment.student?.name ?? 'Sponsored student'}
                </Text>
                <DateText
                  style={styles.paymentDate}
                  value={payment.paid_at ?? payment.created_at ?? ''}
                />
              </View>
              <View style={styles.paymentRight}>
                <CurrencyText amount={payment.amount} style={styles.paymentAmount} />
                <StatusBadge label={payment.status} tone="success" />
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.md },
  greeting: { gap: spacing.xxs, marginTop: spacing.xs },
  greetingText: { ...typography.heading, color: colors.text },
  supportingText: { ...typography.bodySmall, color: colors.mutedText },
  section: { gap: spacing.sm },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  metricValue: { ...typography.title, color: colors.text },
  metricLabel: { ...typography.caption, color: colors.mutedText, marginTop: spacing.xxs },
  danger: { color: colors.danger },
  sectionTitle: { ...typography.title, color: colors.text },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  paymentName: { ...typography.label, color: colors.text },
  paymentDate: { ...typography.caption, color: colors.mutedText, marginTop: spacing.xxs },
  paymentRight: { alignItems: 'flex-end', gap: spacing.xxs },
  paymentAmount: { ...typography.label, color: colors.text },
});
