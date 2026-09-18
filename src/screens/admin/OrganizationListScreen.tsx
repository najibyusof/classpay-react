import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import {
  Card,
  EmptyState,
  ErrorState,
  OrganizationLogo,
  Skeleton,
  StatusBadge,
  TextInput,
} from '../../components';
import { adminQueryKeys, useAdminOrganizations } from '../../hooks/useAdminDashboard';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import { getAuthorizedOrganizations } from '../../types/admin';
import type { AdminClass, AdminOrganization } from '../../types/admin';
import { confirmAction } from '../../utils/confirmAction';
import { AdminManagementScreen } from './AdminManagementScreen';
import { EditOrganizationScreen } from './EditOrganizationScreen';
import { OrganizationClassesScreen } from './OrganizationClassesScreen';
import { CreateClassScreen } from './CreateClassScreen';
import { OrganizationClassDetailScreen } from './OrganizationClassDetailScreen';
import { EditClassScreen } from './EditClassScreen';
import { AddParticipantsScreen } from './AddParticipantsScreen';
import { OrganizationStudentsScreen } from './OrganizationStudentsScreen';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function OrganizationListScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [organization, setOrganization] = useState<AdminOrganization | null>(null);
  const [organizationClasses, setOrganizationClasses] = useState<AdminOrganization | null>(null);
  const [organizationToEdit, setOrganizationToEdit] = useState<AdminOrganization | null>(null);
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  const [organizationToCreateClass, setOrganizationToCreateClass] =
    useState<AdminOrganization | null>(null);
  const [classToView, setClassToView] = useState<{
    classId: number | string;
    classItem: AdminClass;
    organization: AdminOrganization;
  } | null>(null);
  const [classToEdit, setClassToEdit] = useState<{
    classItem: AdminClass;
    organization: AdminOrganization;
  } | null>(null);
  const [classForParticipants, setClassForParticipants] = useState<{
    classId: number | string;
    className: string;
  } | null>(null);
  const [organizationForStudents, setOrganizationForStudents] =
    useState<AdminOrganization | null>(null);
  if (isCreatingOrganization) {
    return (
      <AdminManagementScreen
        initialArea="organization"
        onBack={() => setIsCreatingOrganization(false)}
        onOrganizationCreated={() => {
          setIsCreatingOrganization(false);
          void queryClient.invalidateQueries({ queryKey: adminQueryKeys.organizations });
        }}
      />
    );
  }
  if (organizationToCreateClass)
    return (
      <CreateClassScreen
        onBack={() => setOrganizationToCreateClass(null)}
        onCreated={() => {
          void queryClient.invalidateQueries({
            queryKey: ['admin', 'organizations', organizationToCreateClass.id, 'classes'],
          });
          void queryClient.invalidateQueries({
            queryKey: ['admin', 'organizations', organizationToCreateClass.id, 'classes', 'count'],
          });
          void queryClient.invalidateQueries({ queryKey: ['admin', 'classes', 'count'] });
          setOrganizationToCreateClass(null);
        }}
        organizationId={organizationToCreateClass.id}
        organizationName={organizationToCreateClass.name}
      />
    );
  if (classToEdit)
    return (
      <EditClassScreen
        classItem={classToEdit.classItem}
        onBack={() => setClassToEdit(null)}
        onSaved={(updatedClass) => {
          const classQueryKey = [
            'admin',
            'organizations',
            classToEdit.organization.id,
            'classes',
            updatedClass.id,
          ];
          queryClient.setQueryData(classQueryKey, updatedClass);
          void queryClient.invalidateQueries({ queryKey: classQueryKey });
          setClassToEdit(null);
          setClassToView({
            classId: updatedClass.id,
            classItem: updatedClass,
            organization: classToEdit.organization,
          });
        }}
        organizationId={classToEdit.organization.id}
        organizationName={classToEdit.organization.name}
      />
    );
  if (classForParticipants)
    return (
      <AddParticipantsScreen
        classId={classForParticipants.classId}
        className={classForParticipants.className}
        onBack={() => setClassForParticipants(null)}
      />
    );
  if (classToView)
    return (
      <OrganizationClassDetailScreen
        classId={classToView.classId}
        onBack={() => setClassToView(null)}
        onAddParticipants={() =>
          setClassForParticipants({
            classId: classToView.classId,
            className: classToView.classItem.name,
          })
        }
        onEdit={() =>
          setClassToEdit({
            classItem: classToView.classItem,
            organization: classToView.organization,
          })
        }
        onViewPayments={() => navigation.navigate('Payments' as never)}
        organizationId={classToView.organization.id}
        organizationName={classToView.organization.name}
      />
    );
  if (organizationToEdit)
    return (
      <EditOrganizationScreen
        onBack={() => setOrganizationToEdit(null)}
        onSaved={(updatedOrganization) => {
          const organizationQueryKey = adminQueryKeys.organization(updatedOrganization.id);
          queryClient.setQueryData(organizationQueryKey, updatedOrganization);
          void queryClient.invalidateQueries({ queryKey: organizationQueryKey });
          void queryClient.invalidateQueries({ queryKey: adminQueryKeys.organizations });
          setOrganizationToEdit(null);
          setOrganization(updatedOrganization);
        }}
        organization={organizationToEdit}
      />
    );
  if (organizationClasses)
    return (
      <OrganizationClassesScreen
        onBack={() => setOrganizationClasses(null)}
        onAddClass={() => setOrganizationToCreateClass(organizationClasses)}
        onSelectClass={(classItem) =>
          setClassToView({ classId: classItem.id, classItem, organization: organizationClasses })
        }
        organizationId={organizationClasses.id}
        organizationName={organizationClasses.name}
      />
    );
  if (organizationForStudents)
    return (
      <OrganizationStudentsScreen
        onBack={() => setOrganizationForStudents(null)}
        organizationId={organizationForStudents.id}
        organizationName={organizationForStudents.name}
      />
    );
  if (organization)
    return (
      <OrganizationDashboardScreen
        organization={organization}
        onBack={() => setOrganization(null)}
        onEdit={() => setOrganizationToEdit(organization)}
        onViewClasses={() => setOrganizationClasses(organization)}
        onViewStudents={() => setOrganizationForStudents(organization)}
      />
    );
  return (
    <OrganizationList onCreate={() => setIsCreatingOrganization(true)} onSelect={setOrganization} />
  );
}

function OrganizationList({
  onCreate,
  onSelect,
}: {
  onCreate: () => void;
  onSelect: (organization: AdminOrganization) => void;
}) {
  const [search, setSearch] = useState('');
  const organizationsQuery = useAdminOrganizations();
  const organizations = getAuthorizedOrganizations(organizationsQuery.data?.data);
  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return organizations;
    return organizations.filter((organization) =>
      organization.name.toLowerCase().includes(normalizedSearch),
    );
  }, [organizations, search]);

  if (organizationsQuery.isLoading) return <Skeleton height={180} />;
  if (organizationsQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(organizationsQuery.error).message}
        onRetry={() => void organizationsQuery.refetch()}
      />
    );
  if (organizations.length === 0)
    return (
      <EmptyState
        title="No accessible organizations"
        description="Organizations are shown only when returned for your active organization administrator access."
      />
    );
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Organizations</Text>
        <Pressable
          accessibilityLabel="Add organization"
          accessibilityRole="button"
          onPress={onCreate}
          style={styles.addButton}
        >
          <Ionicons color={colors.onPrimary} name="add" size={18} />
          <Text style={styles.addLabel}>Add</Text>
        </Pressable>
      </View>
      <TextInput
        accessibilityLabel="Search organizations"
        autoCapitalize="none"
        autoCorrect={false}
        containerTestID="organization-search"
        label=""
        onChangeText={setSearch}
        placeholder="Search organization..."
        value={search}
      />
      {filteredOrganizations.length === 0 ? (
        <EmptyState
          title="No matching organizations"
          description="Try a different organization name."
        />
      ) : (
        <View style={styles.list}>
          {filteredOrganizations.map((organization, index) => (
            <OrganizationRow
              index={index}
              key={organization.id}
              onPress={() => onSelect(organization)}
              organization={organization}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function OrganizationRow({
  index,
  onPress,
  organization,
}: {
  index: number;
  onPress: () => void;
  organization: AdminOrganization;
}) {
  const details = organization as AdminOrganization & {
    classes_count?: number;
    students_count?: number;
  };
  const status = organization.status?.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
  const tone = status === 'Active' ? 'success' : 'neutral';
  const classes = details.classes_count;
  const students = details.students_count;
  const summary =
    classes !== undefined || students !== undefined
      ? `${classes ?? 0} classes · ${students ?? 0} students`
      : (organization.code ?? 'Organization details');
  const iconColor = organizationIconColors[index % organizationIconColors.length] ?? colors.info;

  return (
    <Card accessibilityLabel={`View ${organization.name}`} onPress={onPress}>
      <View style={styles.organizationRow}>
        <OrganizationLogo color={iconColor} organizationId={organization.id} />
        <View style={styles.organizationCopy}>
          <Text numberOfLines={1} style={styles.name}>
            {organization.name}
          </Text>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        <View style={styles.rowAside}>
          <StatusBadge label={status} tone={tone} />
          <Ionicons color={colors.mutedText} name="chevron-forward" size={18} />
        </View>
      </View>
    </Card>
  );
}

const organizationIconColors = [colors.info, colors.success, '#6941C6', '#F04438', '#667085'];

function OrganizationDashboardScreen({
  organization,
  onBack,
  onEdit,
  onViewClasses,
  onViewStudents,
}: {
  organization: AdminOrganization;
  onBack: () => void;
  onEdit: () => void;
  onViewClasses: () => void;
  onViewStudents: () => void;
}) {
  const navigation = useNavigation();
  const organizationQuery = useQuery({
    queryKey: adminQueryKeys.organization(organization.id),
    queryFn: () => adminApi.getOrganization(organization.id),
    initialData: organization,
  });
  const dashboardQuery = useQuery({
    queryKey: adminQueryKeys.organizationDashboard(organization.id),
    queryFn: () => adminApi.getOrganizationDashboard(organization.id),
  });
  const classesCountQuery = useQuery({
    queryKey: ['admin', 'organizations', organization.id, 'classes', 'count'],
    queryFn: () => adminApi.getOrganizationClasses(organization.id, 1, 1),
  });
  const studentsCountQuery = useQuery({
    queryKey: ['admin', 'students', 'count'],
    queryFn: () => adminApi.getAdminStudents(1, 1),
  });
  const sponsorsCountQuery = useQuery({
    queryKey: ['admin', 'sponsors', 'count'],
    queryFn: () => adminApi.getAdminSponsors(1, 1),
  });
  if (organizationQuery.isLoading || dashboardQuery.isLoading) return <Skeleton height={180} />;
  if (organizationQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(organizationQuery.error).message}
        onRetry={() => void organizationQuery.refetch()}
      />
    );
  if (dashboardQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(dashboardQuery.error).message}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  const dashboard = dashboardQuery.data ?? {};
  const organizationDetails = organizationQuery.data;
  const status = organizationDetails.status?.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
  const classes = getMetric(dashboard, [
    'classes',
    'class_count',
    'classes_count',
    'total_classes',
  ]);
  const paginationTotal = (classesCountQuery.data?.meta as { total?: unknown } | undefined)?.total;
  const classesCount = typeof paginationTotal === 'number' ? String(paginationTotal) : classes;
  const studentsTotal = (studentsCountQuery.data?.meta as { total?: unknown } | undefined)?.total;
  const sponsorsTotal = (sponsorsCountQuery.data?.meta as { total?: unknown } | undefined)?.total;
  const studentsCountValue =
    typeof studentsTotal === 'number' || typeof sponsorsTotal === 'number'
      ? (typeof studentsTotal === 'number' ? studentsTotal : 0) +
        (typeof sponsorsTotal === 'number' ? sponsorsTotal : 0)
      : undefined;
  const students =
    studentsCountValue !== undefined
      ? String(studentsCountValue)
      : getMetric(dashboard, ['students', 'student_count', 'students_count', 'total_students']);
  const totalCollected = getMetric(dashboard, [
    'total_collected',
    'total_paid',
    'collected_amount',
  ]);
  return (
    <ScrollView contentContainerStyle={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Pressable
          accessibilityLabel="Back to organizations"
          accessibilityRole="button"
          hitSlop={spacing.sm}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons color={colors.text} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.detailHeaderTitle}>Organization Details</Text>
        <Pressable
          accessibilityLabel="Organization options"
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              'Organization options',
              'Organization settings are managed by your administrator.',
            )
          }
          style={styles.moreButton}
        >
          <Ionicons color={colors.text} name="ellipsis-vertical" size={21} />
        </Pressable>
      </View>

      <Card>
        <View style={styles.detailIdentity}>
          <OrganizationLogo organizationId={organizationDetails.id} size="lg" />
          <View style={styles.detailIdentityCopy}>
            <View style={styles.detailNameRow}>
              <Text numberOfLines={1} style={styles.detailName}>
                {organizationDetails.name}
              </Text>
              <StatusBadge label={status} tone={status === 'Active' ? 'success' : 'neutral'} />
            </View>
            <Text style={styles.detailDescription}>
              {organizationDetails.description ?? 'Organization details and administration.'}
            </Text>
          </View>
        </View>
        <View style={styles.detailMetrics}>
          <DetailMetric label="Classes" value={classesCount} />
          <DetailMetric label="Students" value={students} />
          <DetailMetric label="Total Collected" value={totalCollected} />
        </View>
      </Card>

      <View style={styles.actionList}>
        <DetailAction icon="create-outline" label="Edit Organization" onPress={onEdit} />
        <DetailAction icon="book-outline" label="View Classes" onPress={onViewClasses} />
        <DetailAction
          icon="people-outline"
          label="View Students"
          onPress={onViewStudents}
        />
        <DetailAction
          icon="card-outline"
          label="View Payments"
          onPress={() => navigation.navigate('Payments' as never)}
        />
        <DetailAction
          icon="settings-outline"
          label="Organization Settings"
          onPress={() => navigation.navigate('Management' as never)}
        />
        <DetailAction
          danger
          icon="trash-outline"
          label="Delete Organization"
          onPress={() =>
            confirmAction({
              confirmLabel: 'Delete',
              message: 'Delete this organization?',
              onConfirm: () =>
                Alert.alert(
                  'Delete organization',
                  'Organization deletion is not available in the mobile app yet.',
                ),
              title: 'Confirm delete',
            })
          }
        />
      </View>
    </ScrollView>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailMetric}>
      <Text style={styles.detailMetricValue}>{value}</Text>
      <Text style={styles.detailMetricLabel}>{label}</Text>
    </View>
  );
}

function DetailAction({
  danger = false,
  icon,
  label,
  onPress,
}: {
  danger?: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.detailAction, pressed && styles.pressed]}
    >
      <Ionicons color={danger ? colors.danger : colors.info} name={icon} size={21} />
      <Text style={[styles.detailActionLabel, danger && styles.dangerLabel]}>{label}</Text>
      <Ionicons
        color={danger ? colors.danger : colors.mutedText}
        name="chevron-forward"
        size={18}
      />
    </Pressable>
  );
}

function getMetric(data: Record<string, unknown>, keys: string[]) {
  const value = keys
    .map((key) => data[key])
    .find((candidate) => typeof candidate === 'number' || typeof candidate === 'string');
  return value === undefined ? '--' : String(value);
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.heading, color: colors.text, fontSize: 22 },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.info,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addLabel: { ...typography.label, color: colors.onPrimary },
  list: { gap: spacing.sm },
  organizationRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  organizationIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  organizationCopy: { flex: 1, gap: spacing.xxs },
  name: { ...typography.label, color: colors.text, textTransform: 'capitalize' },
  summary: { ...typography.caption, color: colors.mutedText },
  rowAside: { alignItems: 'flex-end', gap: spacing.xs },
  value: { ...typography.bodySmall, color: colors.mutedText, marginTop: spacing.xxs },
  back: { ...typography.label, color: colors.primary },
  detailContainer: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  detailHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  moreButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  detailHeaderTitle: { ...typography.title, color: colors.text },
  detailIdentity: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  detailIdentityCopy: { flex: 1, gap: spacing.xs },
  detailNameRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  detailName: { ...typography.title, color: colors.text, flex: 1 },
  detailDescription: { ...typography.caption, color: colors.mutedText },
  detailMetrics: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  detailMetric: { alignItems: 'center', flex: 1, gap: spacing.xxs },
  detailMetricValue: { ...typography.title, color: colors.text },
  detailMetricLabel: { ...typography.caption, color: colors.mutedText },
  actionList: { gap: spacing.xs },
  detailAction: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  detailActionLabel: { ...typography.bodySmall, color: colors.text, flex: 1 },
  dangerLabel: { color: colors.danger },
  pressed: { opacity: 0.75 },
});
