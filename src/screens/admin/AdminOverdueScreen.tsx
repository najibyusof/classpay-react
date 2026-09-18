import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import {
  AppHeader,
  Button,
  Card,
  DatePickerInput,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  TextInput,
} from '../../components';
import { useAdminOrganizations } from '../../hooks/useAdminDashboard';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import { getAuthorizedOrganizations } from '../../types/admin';
import { confirmAction } from '../../utils/confirmAction';

export function AdminOverdueScreen() {
  const [organizationId, setOrganizationId] = useState('');
  const [classId, setClassId] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const organizationsQuery = useAdminOrganizations();
  const organizations = getAuthorizedOrganizations(organizationsQuery.data?.data);
  const classesQuery = useQuery({
    queryKey: ['admin', 'organizations', organizationId, 'classes', 'overdue-filter'],
    queryFn: () => adminApi.getOrganizationClasses(organizationId, 1, 100),
    enabled: Boolean(organizationId),
  });
  const overdueQuery = useInfiniteQuery({
    queryKey: ['admin', 'overdue', organizationId, classId, search, dateFrom, dateTo],
    queryFn: ({ pageParam }) =>
      adminApi.getOverduePayments({
        class_id: classId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        organization_id: organizationId || undefined,
        page: pageParam,
        per_page: 20,
        search: search.trim() || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = findPagination(lastPage);
      return pagination && pagination.current_page < pagination.last_page
        ? pagination.current_page + 1
        : undefined;
    },
  });
  const items = overdueQuery.data?.pages.flatMap((page) => findItems(page)) ?? [];
  const classIds = [
    ...new Set(
      items
        .map((item) => getRelatedId(item, 'class_id', 'class'))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const participantsQuery = useQuery({
    queryKey: ['admin', 'overdue', 'participants', classIds],
    queryFn: async () => {
      const entries = await Promise.all(
        classIds.map(async (id) => [id, { data: await adminApi.getAllClassParticipants(id) }] as const),
      );
      return new Map(entries);
    },
    enabled: classIds.length > 0,
  });
  const schedulesQuery = useQuery({
    queryKey: ['admin', 'overdue', 'schedules', classIds],
    queryFn: async () => {
      const entries = await Promise.all(
        classIds.map(async (id) => [id, await adminApi.getClassPaymentSchedules(id)] as const),
      );
      return new Map(entries);
    },
    enabled: classIds.length > 0,
  });

  return (
    <View style={styles.flex}>
      <AppHeader title="Overdue Payments" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Overdue payments</Text>
        <Text style={styles.subtitle}>Review overdue schedules and follow up with payers.</Text>
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter overdue payments</Text>
            <Button
              fullWidth={false}
              label="Clear"
              onPress={() => {
                setOrganizationId('');
                setClassId('');
                setSearch('');
                setDateFrom('');
                setDateTo('');
              }}
              variant="ghost"
            />
          </View>
          <Select
            label="Organization"
            onValueChange={(value) => {
              setOrganizationId(value);
              setClassId('');
            }}
            options={[
              { label: 'All organizations', value: '' },
              ...organizations.map((organization) => ({
                label: organization.name,
                value: String(organization.id),
              })),
            ]}
            value={organizationId}
          />
          <Select
            enabled={Boolean(organizationId) && !classesQuery.isLoading}
            label="Class"
            onValueChange={setClassId}
            options={[
              { label: organizationId ? 'All classes' : 'Select organization first', value: '' },
              ...(classesQuery.data?.data ?? []).map((classItem) => ({
                label: classItem.name,
                value: String(classItem.id),
              })),
            ]}
            value={classId}
          />
          <TextInput
            label="User name or phone"
            onChangeText={setSearch}
            placeholder="Search name or phone"
            value={search}
          />
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <DatePickerInput label="From date" onChange={setDateFrom} value={dateFrom} />
            </View>
            <View style={styles.dateField}>
              <DatePickerInput
                label="To date"
                minimumDate={parseDate(dateFrom)}
                onChange={setDateTo}
                value={dateTo}
              />
            </View>
          </View>
        </View>
        {overdueQuery.isLoading ? <Skeleton height={180} /> : null}
        {overdueQuery.isError ? (
          <ErrorState
            message={normalizeApiError(overdueQuery.error).message}
            onRetry={() => void overdueQuery.refetch()}
          />
        ) : null}
        {!overdueQuery.isLoading && !overdueQuery.isError && items.length === 0 ? (
          <EmptyState title="No overdue payments found" />
        ) : null}
        {items.map((item, index) => (
          <OverdueCard
            item={item}
            key={String(item.id ?? index)}
            onReminderSent={() => void overdueQuery.refetch()}
            participantPhone={findParticipantPhone(item, participantsQuery.data)}
            scheduleParticipantPhone={findScheduleParticipantPhone(item, schedulesQuery.data)}
          />
        ))}
        {overdueQuery.hasNextPage ? (
          <Button
            disabled={overdueQuery.isFetchingNextPage}
            label="Load more"
            loading={overdueQuery.isFetchingNextPage}
            onPress={() => void overdueQuery.fetchNextPage()}
            variant="outline"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function OverdueCard({
  item,
  onReminderSent,
  participantPhone,
  scheduleParticipantPhone,
}: {
  item: Record<string, unknown>;
  onReminderSent: () => void;
  participantPhone?: string;
  scheduleParticipantPhone?: string;
}) {
  const payer = getNestedName(item, ['class_participant', 'participant', 'user', 'payer']);
  const className = getNestedName(item, ['class']) ?? stringValue(item.class_name);
  const organization = getNestedName(item, ['organization']) ?? getNestedNestedName(item, 'class', 'organization');
  const dueDate = stringValue(item.due_date) ?? stringValue(item.period_end);
  const amount = stringValue(item.outstanding_amount) ?? stringValue(item.required_amount);
  const daysOverdue = stringValue(item.days_overdue);
  return (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{payer ?? 'Payer unavailable'}</Text>
          <Text style={styles.cardMuted}>{className ?? 'Class unavailable'}</Text>
          <Text style={styles.cardMuted}>{organization ?? 'Organization unavailable'}</Text>
        </View>
        {daysOverdue ? <Text style={styles.overdueBadge}>{daysOverdue} days overdue</Text> : null}
      </View>
      <View style={styles.cardDetails}>
        <Detail
          label="Phone"
          value={
            getParticipantPhone(item) ??
            getNestedPhone(item) ??
            scheduleParticipantPhone ??
            participantPhone ??
            '--'
          }
        />
        <Detail label="Due date" value={dueDate ?? '--'} />
        <Detail label="Amount" value={amount ? `MYR ${amount}` : '--'} />
      </View>
      <Button
        icon="notifications-outline"
        label="Send Reminder"
        onPress={() =>
          confirmAction({
            confirmLabel: 'Send',
            message: `Send an overdue payment reminder to ${payer ?? 'this payer'}?`,
            onConfirm: async () => {
              try {
                await adminApi.sendPaymentScheduleReminder(item.id as number | string);
                Alert.alert('Reminder sent', 'The overdue payment reminder has been sent.');
                onReminderSent();
              } catch (error) {
                Alert.alert('Reminder failed', normalizeApiError(error).message);
              }
            },
            title: 'Confirm reminder',
          })
        }
        variant="outline"
      />
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.cardMuted}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

function findItems(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of ['overdue_payments', 'payment_schedules', 'schedules', 'payments', 'data']) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested.filter(isRecord);
    if (isRecord(nested)) {
      const result = findItems(nested);
      if (result.length) return result;
    }
  }
  return [];
}

function findPagination(value: unknown): { current_page: number; last_page: number } | undefined {
  if (!isRecord(value)) return undefined;
  const pagination = value.pagination;
  if (
    isRecord(pagination) &&
    typeof pagination.current_page === 'number' &&
    typeof pagination.last_page === 'number'
  ) {
    return {
      current_page: pagination.current_page,
      last_page: pagination.last_page,
    };
  }
  if (isRecord(value.data)) return findPagination(value.data);
  return undefined;
}

function getNestedName(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (isRecord(value) && typeof value.name === 'string') return value.name;
  }
  return undefined;
}

function getNestedPhone(item: Record<string, unknown>) {
  return findPhone(item);
}

function getParticipantPhone(item: Record<string, unknown>) {
  const participant = item.participant;
  if (!isRecord(participant)) return undefined;
  return stringValue(participant.phone);
}

function findPhone(value: unknown, depth = 0): string | undefined {
  if (!isRecord(value) || depth > 3) return undefined;
  const phone = stringValue(value.phone);
  if (phone) return phone;
  for (const nestedValue of Object.values(value)) {
    const nestedPhone = findPhone(nestedValue, depth + 1);
    if (nestedPhone) return nestedPhone;
  }
  return undefined;
}

function findParticipantPhone(
  item: Record<string, unknown>,
  participantsByClass?: Map<string, { data: unknown[] }>,
) {
  const classId = getRelatedId(item, 'class_id', 'class');
  const participantId = getRelatedId(item, 'class_participant_id', 'class_participant');
  if (!classId || !participantId || !participantsByClass) return undefined;
  const participant = participantsByClass
    .get(classId)
    ?.data.find((entry) => isRecord(entry) && String(entry.id) === participantId);
  return participant ? findPhone(participant) : undefined;
}

function findScheduleParticipantPhone(
  item: Record<string, unknown>,
  schedulesByClass?: Map<string, unknown[]>,
) {
  const classId = getRelatedId(item, 'class_id', 'class');
  const participantId = getRelatedId(item, 'class_participant_id', 'class_participant');
  if (!classId || !participantId || !schedulesByClass) return undefined;
  const schedule = schedulesByClass.get(classId)?.find((entry) => {
    if (!isRecord(entry)) return false;
    return String(entry.class_participant_id) === participantId;
  });
  if (!isRecord(schedule) || !isRecord(schedule.participant)) return undefined;
  return stringValue(schedule.participant.phone);
}

function getRelatedId(item: Record<string, unknown>, directKey: string, nestedKey: string) {
  const directId = stringValue(item[directKey]);
  if (directId) return directId;
  const nested = item[nestedKey];
  return isRecord(nested) ? stringValue(nested.id) : undefined;
}

function getNestedNestedName(item: Record<string, unknown>, parentKey: string, childKey: string) {
  const parent = item[parentKey];
  if (!isRecord(parent)) return undefined;
  const child = parent[childKey];
  return isRecord(child) && typeof child.name === 'string' ? child.name : undefined;
}

function stringValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { alignSelf: 'center', backgroundColor: colors.background, gap: spacing.md, maxWidth: 760, padding: spacing.md, width: '100%' },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.mutedText },
  filterCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  filterHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  filterTitle: { ...typography.label, color: colors.text },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dateField: { flexBasis: 180, flexGrow: 1, minWidth: 0 },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  cardCopy: { flex: 1, gap: spacing.xxs },
  cardTitle: { ...typography.title, color: colors.text },
  cardMuted: { ...typography.bodySmall, color: colors.mutedText },
  overdueBadge: { ...typography.caption, backgroundColor: colors.dangerSubtle, borderRadius: radius.pill, color: colors.danger, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  cardDetails: { borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.xs, marginTop: spacing.md, paddingTop: spacing.sm },
  detail: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailValue: { ...typography.bodySmall, color: colors.text, flexShrink: 1, fontWeight: '600', marginLeft: spacing.sm, textAlign: 'right' },
});
