import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { AppHeader, Button, DatePickerInput, EmptyState, ErrorState, PaymentCard, Select, Skeleton } from '../../components';
import { adminQueryKeys, useAdminOrganizations } from '../../hooks/useAdminDashboard';
import type { AdminTabParamList } from '../../navigation/AdminNavigator';
import { colors, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import { PaymentDetailScreen } from '../payment-history/PaymentDetailScreen';
import type { AdminPayment } from '../../types/admin';
import { getAuthorizedOrganizations } from '../../types/admin';

export function AdminPaymentsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const route = useRoute<RouteProp<AdminTabParamList, 'Payments'>>();
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [classId, setClassId] = useState<string>(() => String(route.params?.classId ?? ''));
  const [organizationId, setOrganizationId] = useState<string>(() => String(route.params?.organizationId ?? ''));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const participantId = String(route.params?.participantId ?? '');
  const routeClassId = route.params?.classId;
  const routeOrganizationId = route.params?.organizationId;
  const routeParticipantId = route.params?.participantId;
  const selectedClassId = routeClassId !== undefined ? String(routeClassId) : classId;
  const selectedOrganizationId =
    routeOrganizationId !== undefined ? String(routeOrganizationId) : organizationId;
  const selectedParticipantId =
    routeParticipantId !== undefined ? String(routeParticipantId) : participantId;
  const organizationsQuery = useAdminOrganizations();
  const organizations = getAuthorizedOrganizations(organizationsQuery.data?.data);
  const classesQuery = useQuery({
    queryKey: ['admin', 'organizations', selectedOrganizationId, 'classes', 'payment-filter'],
    queryFn: () => adminApi.getOrganizationClasses(selectedOrganizationId, 1, 100),
    enabled: Boolean(selectedOrganizationId),
  });
  const classFilterId = selectedClassId || undefined;
  const organizationFilterId = selectedOrganizationId || undefined;
  const isFiltered = Boolean(selectedClassId || selectedOrganizationId || selectedParticipantId);
  const paymentsHeader = isFiltered ? (
    <AppHeader
      onBackPress={() => navigation.navigate('Organizations')}
      title={selectedParticipantId ? 'User Payments' : selectedClassId ? 'Class Payments' : 'Organization Payments'}
    />
  ) : null;
  const paymentsQuery = useInfiniteQuery({
    queryKey: adminQueryKeys.payments(classFilterId, organizationFilterId, selectedParticipantId || undefined, dateFrom, dateTo),
    queryFn: ({ pageParam }) => adminApi.getPayments(pageParam, classFilterId, organizationFilterId, dateFrom || undefined, dateTo || undefined, selectedParticipantId || undefined),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      (lastPage.meta?.current_page ?? 1) < (lastPage.meta?.last_page ?? 1)
        ? (lastPage.meta?.current_page ?? 1) + 1
        : undefined,
  });
  if (selectedPayment) {
    return (
      <PaymentDetailScreen
        canVerify
        onBack={() => setSelectedPayment(null)}
        onVerified={() => {
          setSelectedPayment(null);
          void paymentsQuery.refetch();
        }}
        payment={selectedPayment}
      />
    );
  }
  const payments = paymentsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  if (paymentsQuery.isLoading)
    return (
      <View style={styles.flex}>
        {paymentsHeader}
        <Skeleton height={240} />
      </View>
    );
  if (paymentsQuery.isError)
    return (
      <View style={styles.flex}>
        {paymentsHeader}
        <ErrorState
          message={normalizeApiError(paymentsQuery.error).message}
          onRetry={() => void paymentsQuery.refetch()}
        />
      </View>
    );
  return (
    <View style={styles.flex}>
      {paymentsHeader}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeading}>
          <Text style={styles.title}>{selectedParticipantId ? 'User Payments' : isFiltered ? 'Filtered Payments' : 'Payments'}</Text>
          <Text style={styles.subtitle}>Review payments by organization, class, or date range.</Text>
        </View>
        {!isFiltered ? (
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter payments</Text>
              <Button
                fullWidth={false}
                label="Clear"
                onPress={() => { setOrganizationId(''); setClassId(''); setDateFrom(''); setDateTo(''); }}
                variant="ghost"
              />
            </View>
            <View style={styles.filterRow}>
              <View style={styles.filterField}>
                <Select
                  label="Organization"
                  onValueChange={(value) => { setOrganizationId(value); setClassId(''); }}
                  options={[{ label: 'All organizations', value: '' }, ...organizations.map((organization) => ({ label: organization.name, value: String(organization.id) }))]}
                  value={selectedOrganizationId}
                />
              </View>
              <View style={styles.filterField}>
                <Select
                  enabled={Boolean(selectedOrganizationId) && !classesQuery.isLoading}
                  label="Class"
                  onValueChange={setClassId}
                  options={[{ label: selectedOrganizationId ? 'All classes' : 'Select organization first', value: '' }, ...(classesQuery.data?.data ?? []).map((classItem) => ({ label: classItem.name, value: String(classItem.id) }))]}
                  value={selectedClassId}
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
        ) : null}
        {payments.length === 0 ? (
          <EmptyState
            title={
              selectedParticipantId
                ? 'No payments for this user'
                : selectedClassId
                ? 'No payments for this class'
                : selectedOrganizationId
                  ? 'No payments for this organization'
                  : 'No authorized payments'
            }
          />
        ) : (
          payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              onPress={() => setSelectedPayment(payment)}
              payment={payment}
            />
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
    </View>
  );
}

function parseDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  pageHeading: { gap: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.mutedText },
  filterCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  filterHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  filterTitle: { ...typography.label, color: colors.text },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filterField: { flexBasis: 220, flexGrow: 1, minWidth: 0 },
});
