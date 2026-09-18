import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { Card, DatePickerInput, EmptyState, ErrorState, Select, Skeleton } from '../../components';
import { adminQueryKeys, useAdminOrganizations } from '../../hooks/useAdminDashboard';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import { getAuthorizedOrganizations } from '../../types/admin';
import type { AdminReport, AdminReportFilters } from '../../types/admin';

type ReportQuery = ReturnType<typeof useQuery<AdminReport>>;

export function AdminReportsScreen() {
  const [organizationId, setOrganizationId] = useState('');
  const [classId, setClassId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const organizationsQuery = useAdminOrganizations();
  const organizations = getAuthorizedOrganizations(organizationsQuery.data?.data);
  const classesQuery = useQuery({
    queryKey: ['admin', 'organizations', organizationId, 'classes', 'report-filter'],
    queryFn: () => adminApi.getOrganizationClasses(organizationId, 1, 100),
    enabled: Boolean(organizationId),
  });
  const filters = useMemo<AdminReportFilters>(() => ({
    ...(organizationId ? { organization_id: organizationId } : {}),
    ...(classId ? { class_id: classId } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  }), [classId, dateFrom, dateTo, organizationId]);
  const summary = useQuery({
    queryKey: [...adminQueryKeys.reports, 'payment-summary', filters],
    queryFn: () => adminApi.getPaymentSummary(filters),
  });
  const outstanding = useQuery({
    queryKey: [...adminQueryKeys.reports, 'outstanding', filters],
    queryFn: () => adminApi.getOutstandingReport(filters),
  });
  const overdue = useQuery({
    queryKey: [...adminQueryKeys.reports, 'overdue', filters],
    queryFn: () => adminApi.getOverdueReport(filters),
  });
    
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.pageHeading}>
        <Text style={styles.kicker}>ADMIN REPORTS</Text>
        <Text style={styles.title}>Payment reports</Text>
        <Text style={styles.subtitle}>A clear view of collection, outstanding, and overdue payments.</Text>
      </View>
      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <View style={styles.filterTitleRow}>
            <Ionicons color={colors.info} name="options-outline" size={20} />
            <Text style={styles.filterTitle}>Filter reports</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => { setOrganizationId(''); setClassId(''); setDateFrom(''); setDateTo(''); }}>
            <Text style={styles.clearLabel}>Clear</Text>
          </Pressable>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <Select
              label="Organization"
              onValueChange={(value) => { setOrganizationId(value); setClassId(''); }}
              options={[{ label: 'All organizations', value: '' }, ...organizations.map((organization) => ({ label: organization.name, value: String(organization.id) }))]}
              value={organizationId}
            />
          </View>
          <View style={styles.filterField}>
            <Select
              enabled={Boolean(organizationId) && !classesQuery.isLoading}
              label="Class"
              onValueChange={setClassId}
              options={[{ label: organizationId ? 'All classes' : 'Select organization first', value: '' }, ...(classesQuery.data?.data ?? []).map((classItem) => ({ label: classItem.name, value: String(classItem.id) }))]}
              value={classId}
            />
          </View>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <DatePickerInput label="From date" onChange={setDateFrom} value={dateFrom} />
          </View>
          <View style={styles.filterField}>
            <DatePickerInput label="To date" minimumDate={parseDate(dateFrom)} onChange={setDateTo} value={dateTo} />
          </View>
        </View>
      </View>
      <PaymentSummaryReport query={summary} />
      <ReportStatusCard
        fallbackTotal={findValue(summary.data ?? {}, ['total_outstanding', 'outstanding_amount'])}
        label="Outstanding payments"
        query={outstanding}
        tone="warning"
      />
      <ReportStatusCard
        fallbackTotal={findValue(summary.data ?? {}, ['total_overdue', 'overdue_amount'])}
        label="Overdue payments"
        query={overdue}
        tone="danger"
      />
    </ScrollView>
  );
}

function PaymentSummaryReport({ query }: { query: ReportQuery }) {
  if (query.isLoading) return <Skeleton height={360} />;
  if (query.isError) return <ReportError query={query} />;
  const report = query.data ?? {};
  const totalCollected = findValue(report, ['total_collected', 'total_paid', 'collected_amount']);
  const totalOutstanding = findValue(report, ['total_outstanding', 'outstanding_amount']);
  const totalOverdue = findValue(report, ['total_overdue', 'overdue_amount']);
  const totalPayments = findValue(report, ['total_payments', 'payment_count', 'payments_count']);
  const successful = findValue(report, ['successful_payments', 'successful_count', 'paid_payments']);
  const pending = findValue(report, ['pending_payments', 'pending_count']);
  const failed = findValue(report, ['failed_payments', 'failed_count']);
  const refunded = findValue(report, ['refunded_payments', 'refunded_count']);
  const knownKeys = new Set([
    'total_collected', 'total_paid', 'collected_amount', 'total_outstanding', 'outstanding_amount',
    'total_overdue', 'overdue_amount', 'total_payments', 'payment_count', 'payments_count',
    'successful_payments', 'successful_count', 'paid_payments', 'pending_payments', 'pending_count',
    'failed_payments', 'failed_count', 'refunded_payments', 'refunded_count',
  ]);
  const extraMetrics = scalarEntries(report).filter(([key]) => !knownKeys.has(key));

  return (
    <Card>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}><Ionicons color={colors.info} name="bar-chart-outline" size={22} /></View>
        <View style={styles.sectionHeaderCopy}>
          <Text style={styles.cardTitle}>Payment summary</Text>
          <Text style={styles.cardSubtitle}>Collection and transaction health</Text>
        </View>
      </View>
      <View style={styles.heroMetric}>
        <Text style={styles.metricLabel}>TOTAL COLLECTED</Text>
        <Text style={styles.heroValue}>{formatAmount(totalCollected)}</Text>
      </View>
      <View style={styles.metricsGrid}>
        <MetricTile label="Total outstanding" value={formatAmount(totalOutstanding)} tone="warning" />
        <MetricTile label="Total overdue" value={formatAmount(totalOverdue)} tone="danger" />
        <MetricTile label="Total payments" value={formatCount(totalPayments)} />
      </View>
      <Text style={styles.breakdownTitle}>Transaction breakdown</Text>
      <View style={styles.breakdownGrid}>
        <BreakdownItem label="Successful" value={formatCount(successful)} tone="success" />
        <BreakdownItem label="Pending" value={formatCount(pending)} tone="info" />
        <BreakdownItem label="Failed" value={formatCount(failed)} tone="danger" />
        <BreakdownItem label="Refunded" value={formatCount(refunded)} tone="muted" />
      </View>
      {extraMetrics.length ? <FallbackMetrics entries={extraMetrics} /> : null}
    </Card>
  );
}

function ReportStatusCard({
  fallbackTotal,
  label,
  query,
  tone,
}: {
  fallbackTotal: unknown;
  label: string;
  query: ReportQuery;
  tone: 'warning' | 'danger';
}) {
  if (query.isLoading) return <Skeleton height={150} />;
  if (query.isError) return <ReportError query={query} />;
  const entries = scalarEntries(query.data ?? {});
  const total = findValue(
    query.data ?? {},
    tone === 'danger' ? ['total_overdue', 'overdue_count'] : ['total_outstanding', 'outstanding_count'],
  ) ?? fallbackTotal;
  if (!entries.length && !hasPositiveValue(total)) {
    return <EmptyState title={`No ${label.toLowerCase()} available`} />;
  }
  const displayEntries = entries.length
    ? entries
    : [['total_amount', Number(total)]] as Array<[string, string | number]>;
  return (
    <Card>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, tone === 'danger' ? styles.dangerIcon : styles.warningIcon]}>
          <Ionicons color={tone === 'danger' ? colors.danger : colors.warning} name={tone === 'danger' ? 'alert-circle-outline' : 'time-outline'} size={22} />
        </View>
        <View style={styles.sectionHeaderCopy}>
          <Text style={styles.cardTitle}>{label}</Text>
          <Text style={styles.cardSubtitle}>{formatCount(total)} records requiring attention</Text>
        </View>
      </View>
      <FallbackMetrics entries={displayEntries} />
    </Card>
  );
}

function hasPositiveValue(value: unknown) {
  return value !== undefined && value !== null && value !== '' && Number(value) > 0;
}

function MetricTile({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' | 'danger' }) {
  return <View style={[styles.metricTile, tone === 'warning' && styles.warningTile, tone === 'danger' && styles.dangerTile]}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.tileValue, tone === 'danger' && styles.dangerValue]}>{value}</Text></View>;
}

function BreakdownItem({ label, value, tone }: { label: string; value: string; tone: 'success' | 'info' | 'danger' | 'muted' }) {
  const dotStyle = tone === 'success' ? styles.successDot : tone === 'info' ? styles.infoDot : tone === 'danger' ? styles.dangerDot : styles.mutedDot;
  return <View style={styles.breakdownItem}><View style={styles.breakdownLabel}><View style={[styles.dot, dotStyle]} /><Text style={styles.breakdownText}>{label}</Text></View><Text style={styles.breakdownValue}>{value}</Text></View>;
}

function FallbackMetrics({ entries }: { entries: Array<[string, string | number]> }) {
  return <View style={styles.fallbackList}>{entries.map(([key, value]) => <View key={key} style={styles.fallbackRow}><Text style={styles.fallbackLabel}>{humanize(key)}</Text><Text style={styles.fallbackValue}>{formatMetric(key, value)}</Text></View>)}</View>;
}

function ReportError({ query }: { query: ReportQuery }) {
  return <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} />;
}

function scalarEntries(report: AdminReport) {
  return Object.entries(report).filter((entry): entry is [string, string | number] => typeof entry[1] === 'string' || typeof entry[1] === 'number');
}

function findValue(report: AdminReport, keys: string[]) {
  for (const key of keys) if (typeof report[key] === 'string' || typeof report[key] === 'number') return report[key];
  return undefined;
}

function formatAmount(value: unknown) {
  if (value === undefined || value === null || value === '') return '--';
  const number = Number(value);
  return Number.isFinite(number) ? `MYR ${number.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : String(value);
}

function formatCount(value: unknown) {
  if (value === undefined || value === null || value === '') return '--';
  return String(value);
}

function formatMetric(key: string, value: string | number) {
  return /amount|collected|outstanding|overdue|total_paid/i.test(key) ? formatAmount(value) : String(value);
}

function humanize(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function parseDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

const styles = StyleSheet.create({
  container: { alignSelf: 'center', backgroundColor: colors.background, gap: spacing.md, maxWidth: 760, padding: spacing.md, width: '100%' },
  pageHeading: { gap: spacing.xs, paddingVertical: spacing.xs },
  kicker: { ...typography.caption, color: colors.primary, fontWeight: '700', letterSpacing: 1 },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.mutedText, maxWidth: 520 },
  filterCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  filterHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  filterTitleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  filterTitle: { ...typography.label, color: colors.text },
  clearLabel: { ...typography.caption, color: colors.info, fontWeight: '700' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterField: { flexBasis: 220, flexGrow: 1, minWidth: 0 },
  cardTitle: { ...typography.title, color: colors.text },
  cardSubtitle: { ...typography.bodySmall, color: colors.mutedText, flexShrink: 1 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  sectionHeaderCopy: { flex: 1, gap: spacing.xxs },
  sectionIcon: { alignItems: 'center', backgroundColor: colors.infoSubtle, borderRadius: radius.pill, height: 44, justifyContent: 'center', width: 44 },
  warningIcon: { backgroundColor: colors.warningSubtle },
  dangerIcon: { backgroundColor: colors.dangerSubtle },
  heroMetric: { backgroundColor: colors.infoSubtle, borderRadius: radius.lg, gap: spacing.xs, marginTop: spacing.md, padding: spacing.md },
  metricLabel: { ...typography.caption, color: colors.mutedText, fontWeight: '700', textTransform: 'uppercase' },
  heroValue: { ...typography.display, color: colors.text, flexShrink: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  metricTile: { backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg, flexBasis: '30%', flexGrow: 1, gap: spacing.xs, minWidth: 140, padding: spacing.md },
  warningTile: { backgroundColor: colors.warningSubtle },
  dangerTile: { backgroundColor: colors.dangerSubtle },
  tileValue: { ...typography.title, color: colors.text },
  dangerValue: { color: colors.danger },
  breakdownTitle: { ...typography.label, color: colors.text, marginTop: spacing.lg },
  breakdownGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  breakdownItem: { alignItems: 'center', backgroundColor: colors.surfaceSubtle, borderRadius: radius.pill, flexBasis: '45%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', minWidth: 145, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  breakdownLabel: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: spacing.xs },
  breakdownText: { ...typography.bodySmall, color: colors.text, flexShrink: 1 },
  breakdownValue: { ...typography.label, color: colors.text, marginLeft: spacing.xs },
  dot: { borderRadius: radius.pill, height: 12, width: 12 },
  successDot: { backgroundColor: colors.success },
  infoDot: { backgroundColor: colors.info },
  dangerDot: { backgroundColor: colors.danger },
  mutedDot: { backgroundColor: colors.mutedText },
  fallbackList: { gap: spacing.xs, marginTop: spacing.md },
  fallbackRow: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingVertical: spacing.sm },
  fallbackLabel: { ...typography.bodySmall, color: colors.mutedText, flex: 1, marginRight: spacing.sm },
  fallbackValue: { ...typography.bodySmall, color: colors.text, flexShrink: 1, textAlign: 'right' },
});

