import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { Card, ErrorState, OrganizationLogo, Skeleton } from '../../components';
import { useAdminDashboard, useAdminOrganizations } from '../../hooks/useAdminDashboard';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import { getAuthorizedOrganizations, getOrganizationCount } from '../../types/admin';
import type { AdminTabParamList } from '../../navigation/AdminNavigator';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function AdminDashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const user = useAuthStore((state) => state.user);
  const dashboardQuery = useAdminDashboard();
  const organizationsQuery = useAdminOrganizations();
  const paymentSummaryQuery = useQuery({
    queryKey: ['admin', 'reports', 'payment-summary'],
    queryFn: adminApi.getPaymentSummary,
  });

  const dashboard = dashboardQuery.data ?? {};
  const organizations = getAuthorizedOrganizations(dashboard.organizations);
  const listedOrganizations = getAuthorizedOrganizations(organizationsQuery.data?.data);
  const accessibleOrganizations = organizations.length ? organizations : listedOrganizations;
  const classCountQuery = useQuery({
    queryKey: [
      'admin',
      'classes',
      'count',
      accessibleOrganizations.map((organization) => organization.id),
    ],
    enabled: accessibleOrganizations.length > 0,
    queryFn: async () => {
      const pages = await Promise.all(
        accessibleOrganizations.map((organization) =>
          adminApi.getOrganizationClasses(organization.id, 1, 1),
        ),
      );
      return pages.reduce((total, page) => {
        const paginationTotal = (page.meta as { total?: unknown }).total;
        return total + (typeof paginationTotal === 'number' ? paginationTotal : page.data.length);
      }, 0);
    },
  });
  const studentsCountQuery = useQuery({
    queryKey: ['admin', 'students', 'count'],
    queryFn: () => adminApi.getAdminStudents(1, 1),
  });
  const sponsorsCountQuery = useQuery({
    queryKey: ['admin', 'sponsors', 'count'],
    queryFn: () => adminApi.getAdminSponsors(1, 1),
  });

  if (dashboardQuery.isLoading) return <Skeleton height={420} />;
  if (dashboardQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(dashboardQuery.error).message}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );

  const currentOrganization = accessibleOrganizations[0];
  const paymentSummary = paymentSummaryQuery.data ?? {};
  const metricValues = getMetricValues(
    dashboard,
    paymentSummary,
    classCountQuery.data,
    getCountValue(studentsCountQuery.data) !== undefined ||
      getCountValue(sponsorsCountQuery.data) !== undefined
      ? (getCountValue(studentsCountQuery.data) ?? 0) + (getCountValue(sponsorsCountQuery.data) ?? 0)
      : undefined,
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.greeting}>
        <View style={styles.greetingCopy}>
          <Text style={styles.greetingTitle}>Hi, {user?.name ?? 'Admin'} 👋</Text>
          <Text style={styles.greetingSubtitle}>Good morning!</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{getInitials(user?.name ?? 'Admin')}</Text>
        </View>
      </View>

      <Card>
        <View style={styles.organizationRow}>
          {currentOrganization ? (
            <OrganizationLogo organizationId={currentOrganization.id} />
          ) : (
            <View style={styles.organizationIcon}>
              <Ionicons color={colors.info} name="business" size={22} />
            </View>
          )}
          <View style={styles.organizationCopy}>
            <Text style={styles.eyebrow}>Latest Organization</Text>
            <Text numberOfLines={1} style={styles.organizationName}>
              {currentOrganization?.name ?? 'All authorized organizations'}
            </Text>
            <Text style={styles.organizationRole}>Admin</Text>
          </View>
        </View>
      </Card>

      <View style={styles.metricsGrid}>
        <MetricCard
          icon="people"
          iconColor={colors.info}
          label="Organizations"
          value={metricValues.organizations}
        />
        <MetricCard
          icon="book"
          iconColor={colors.success}
          label="Classes"
          value={metricValues.classes}
        />
        <MetricCard
          icon="people"
          iconColor="#6941C6"
          label="Students"
          value={metricValues.students}
        />
        <MetricCard
          icon="time"
          iconColor={colors.danger}
          label="Pending Payments"
          value={metricValues.pendingPayments}
        />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <QuickAction
          icon="business"
          label="Add Organization"
          onPress={() => navigation.navigate('Management', { initialArea: 'organization' })}
        />
        <QuickAction
          icon="book"
          label="Create Class"
          onPress={() => navigation.navigate('Organizations')}
        />
        <QuickAction
          icon="card"
          label="View Payments"
          onPress={() => navigation.navigate('Payments')}
        />
        <QuickAction
          icon="paper-plane"
          label="Send Reminder"
          onPress={() => navigation.navigate('Management' as never)}
        />
      </View>
    </ScrollView>
  );
}

function MetricCard({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: IconName;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons color={iconColor} name={icon} size={22} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <Ionicons color={colors.info} name={icon} size={21} />
      <Text numberOfLines={1} style={styles.actionLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function getMetricValues(
  dashboard: Record<string, unknown>,
  paymentSummary: Record<string, unknown>,
  classCount?: number,
  studentsCount?: number,
) {
  return {
    organizations: formatMetric(
      getNumber(dashboard, ['organization_count', 'organizations_count', 'total_organizations']) ??
        getOrganizationCount({ organizations: dashboard.organizations }),
    ),
    classes: formatMetric(
      getNumber(dashboard, ['class_count', 'classes_count', 'total_classes']) ?? classCount,
    ),
    students: formatMetric(
      getNumber(dashboard, ['student_count', 'students_count', 'total_students']) ?? studentsCount,
    ),
    pendingPayments: formatMetric(
      getNumber(paymentSummary, ['pending_payments', 'pending_count', 'pending']) ??
        getNumber(dashboard, ['pending_payments', 'pending_payment_count']),
    ),
  };
}

function getCountValue(page: { meta: unknown; data: unknown[] } | undefined) {
  if (!page) return undefined;
  const total = (page.meta as { total?: unknown }).total;
  return typeof total === 'number' ? total : page.data.length;
}

function getNumber(data: Record<string, unknown>, keys: string[]) {
  const value = keys.map((key) => data[key]).find((candidate) => typeof candidate === 'number');
  return typeof value === 'number' ? value : undefined;
}

function formatMetric(value: number | undefined) {
  return value === undefined ? '--' : value.toLocaleString();
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  greeting: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  greetingCopy: { gap: spacing.xxs },
  greetingTitle: { ...typography.heading, color: colors.text, fontSize: 22 },
  greetingSubtitle: { ...typography.bodySmall, color: colors.mutedText },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.info,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  avatarLabel: { ...typography.title, color: colors.onPrimary },
  organizationRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  organizationIcon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  organizationCopy: { flex: 1, gap: spacing.xxs },
  eyebrow: { ...typography.caption, color: colors.mutedText },
  organizationName: { ...typography.label, color: colors.text },
  organizationRole: { ...typography.caption, color: colors.mutedText },
  switchButton: {
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  switchLabel: { ...typography.caption, color: colors.info, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 112,
    padding: spacing.sm,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  metricValue: { ...typography.title, color: colors.text, marginTop: spacing.xs },
  metricLabel: { ...typography.caption, color: colors.mutedText },
  sectionTitle: { ...typography.label, color: colors.text, marginTop: spacing.xs },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  actionLabel: { ...typography.caption, color: colors.text, flexShrink: 1 },
  pressed: { opacity: 0.75 },
});
