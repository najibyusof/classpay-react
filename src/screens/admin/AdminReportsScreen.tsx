import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { Card, EmptyState, ErrorState, Skeleton } from '../../components';
import { adminQueryKeys } from '../../hooks/useAdminDashboard';
import { colors, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';

export function AdminReportsScreen() {
  const summary = useQuery({
    queryKey: [...adminQueryKeys.reports, 'payment-summary'],
    queryFn: adminApi.getPaymentSummary,
  });
  const outstanding = useQuery({
    queryKey: [...adminQueryKeys.reports, 'outstanding'],
    queryFn: adminApi.getOutstandingReport,
  });
  const overdue = useQuery({
    queryKey: [...adminQueryKeys.reports, 'overdue'],
    queryFn: adminApi.getOverdueReport,
  });
  const queries = [
    { label: 'Payment summary', query: summary },
    { label: 'Outstanding payments', query: outstanding },
    { label: 'Overdue payments', query: overdue },
  ];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payment reports</Text>
      {queries.map(({ label, query }) => (
        <ReportCard key={label} label={label} query={query} />
      ))}
    </ScrollView>
  );
}

function ReportCard({ label, query }: { label: string; query: ReturnType<typeof useQuery> }) {
  if (query.isLoading) return <Skeleton height={96} />;
  if (query.isError)
    return (
      <ErrorState
        message={normalizeApiError(query.error).message}
        onRetry={() => void query.refetch()}
      />
    );
  const values = Object.entries(query.data ?? {}).filter(
    ([, value]) => typeof value === 'string' || typeof value === 'number',
  );
  if (values.length === 0) return <EmptyState title={`No ${label.toLowerCase()} available`} />;
  return (
    <Card>
      <Text style={styles.cardTitle}>{label}</Text>
      {values.map(([key, value]) => (
        <Text key={key} style={styles.value}>
          {key.replace(/_/g, ' ')}: {String(value)}
        </Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
  cardTitle: { ...typography.title, color: colors.text },
  value: { ...typography.bodySmall, color: colors.mutedText, marginTop: spacing.xs },
});
