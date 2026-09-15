import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { sponsorApi } from '../../api/sponsorApi';
import { studentApi } from '../../api/studentApi';
import {
  Button,
  EmptyState,
  ErrorState,
  PaymentCard,
  PaymentFilterSheet,
  Skeleton,
} from '../../components';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { PaginatedResponse, PaymentHistoryFilters, StudentPayment } from '../../types/student';
import { PaymentDetailScreen } from './PaymentDetailScreen';

type PaymentHistoryAudience = 'student' | 'sponsor';

interface PaymentHistoryScreenProps {
  audience: PaymentHistoryAudience;
}

export function PaymentHistoryScreen({ audience }: PaymentHistoryScreenProps) {
  const [filters, setFilters] = useState<PaymentHistoryFilters>({ per_page: 20 });
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const paymentsQuery = useInfiniteQuery({
    queryKey: [audience, 'payments', filters],
    queryFn: ({ pageParam }): Promise<PaginatedResponse<StudentPayment>> =>
      audience === 'student'
        ? studentApi.getPayments({ ...filters, page: pageParam })
        : sponsorApi.getPayments({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
  const payments = paymentsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  if (selectedPayment) {
    return (
      <PaymentDetailScreen onBack={() => setSelectedPayment(null)} payment={selectedPayment} />
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={() => void paymentsQuery.refetch()}
            refreshing={paymentsQuery.isRefetching}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Payment history</Text>
          <Button
            fullWidth={false}
            label="Filter"
            onPress={() => setIsFilterSheetVisible(true)}
            variant="outline"
          />
        </View>
        {paymentsQuery.isLoading ? <HistoryLoadingState /> : null}
        {paymentsQuery.isError ? (
          <ErrorState
            message={toApiError(paymentsQuery.error).message}
            onRetry={() => void paymentsQuery.refetch()}
          />
        ) : null}
        {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length === 0 ? (
          <EmptyState
            title="No payments found"
            description="Payments matching the selected filters will appear here."
          />
        ) : null}
        {payments.map((payment) => (
          <PaymentCard
            key={payment.id}
            onPress={() => setSelectedPayment(payment)}
            payment={payment}
          />
        ))}
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
      <PaymentFilterSheet
        filters={filters}
        onApply={(nextFilters) => setFilters({ ...nextFilters, page: undefined })}
        onClose={() => setIsFilterSheetVisible(false)}
        visible={isFilterSheetVisible}
      />
    </View>
  );
}

function HistoryLoadingState() {
  return (
    <View style={styles.list}>
      <Skeleton height={92} />
      <Skeleton height={92} />
      <Skeleton height={92} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.md, padding: spacing.md },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.heading, color: colors.text },
  list: { gap: spacing.sm },
});
