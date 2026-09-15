import { useInfiniteQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { Button, EmptyState, ErrorState, PaymentCard, Skeleton } from '../../components';
import { adminQueryKeys } from '../../hooks/useAdminDashboard';
import { colors, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';

export function AdminPaymentsScreen() {
  const paymentsQuery = useInfiniteQuery({
    queryKey: adminQueryKeys.payments,
    queryFn: ({ pageParam }) => adminApi.getPayments(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
  const payments = paymentsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  if (paymentsQuery.isLoading) return <Skeleton height={240} />;
  if (paymentsQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(paymentsQuery.error).message}
        onRetry={() => void paymentsQuery.refetch()}
      />
    );
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payments</Text>
      {payments.length === 0 ? (
        <EmptyState title="No authorized payments" />
      ) : (
        payments.map((payment) => (
          <PaymentCard key={payment.id} onPress={() => undefined} payment={payment} />
        ))
      )}
      {paymentsQuery.hasNextPage ? (
        <Button
          disabled={paymentsQuery.isFetchingNextPage}
          label="Load more"
          loading={paymentsQuery.isFetchingNextPage}
          onPress={() => void paymentsQuery.fetchNextPage()}
          variant="outline"
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, gap: spacing.sm, padding: spacing.md },
  title: { ...typography.heading, color: colors.text },
});
