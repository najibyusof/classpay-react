import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { studentApi } from '../../api/studentApi';
import { Card, EmptyState, ErrorState, Skeleton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { StudentOrganization } from '../../types/student';
import { OrganizationClassesScreen } from './OrganizationClassesScreen';

export function MyOrganizationsScreen() {
  const [selectedOrganization, setSelectedOrganization] = useState<StudentOrganization | null>(
    null,
  );
  const organizationsQuery = useQuery({
    queryKey: ['student', 'organizations'],
    queryFn: studentApi.getMyOrganizations,
  });
  const organizations = organizationsQuery.data?.data ?? [];

  if (selectedOrganization)
    return (
      <OrganizationClassesScreenWithBack
        onBack={() => setSelectedOrganization(null)}
        organization={selectedOrganization}
      />
    );

  if (organizationsQuery.isLoading) return <Skeleton height={180} />;
  if (organizationsQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(organizationsQuery.error).message}
        onRetry={() => void organizationsQuery.refetch()}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {organizations.length === 0 ? (
        <EmptyState
          title="Tiada organisasi"
          description="Anda belum menyertai mana-mana organisasi."
        />
      ) : (
        <View style={styles.list}>
          {organizations.map((organization) => (
            <OrganizationRow
              key={organization.id}
              onPress={() => setSelectedOrganization(organization)}
              organization={organization}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function OrganizationClassesScreenWithBack({
  onBack,
  organization,
}: {
  onBack: () => void;
  organization: StudentOrganization;
}) {
  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Kembali ke senarai organisasi"
          accessibilityRole="button"
          hitSlop={spacing.sm}
          onPress={onBack}
          style={styles.headerButton}
        >
          <Ionicons color={colors.text} name="arrow-back" size={22} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {organization.name}
        </Text>
        <View style={styles.headerButton} />
      </View>
      <OrganizationClassesScreen organization={organization} />
    </View>
  );
}

function OrganizationRow({
  onPress,
  organization,
}: {
  onPress: () => void;
  organization: StudentOrganization;
}) {
  return (
    <Card accessibilityLabel={`Lihat kelas ${organization.name}`} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons color={colors.info} name="business" size={22} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.name}>
            {organization.name}
          </Text>
        </View>
        <Ionicons color={colors.mutedText} name="chevron-forward" size={18} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: spacing.md,
  },
  headerButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  headerTitle: { ...typography.title, color: colors.text, flex: 1 },
  container: { gap: spacing.md, padding: spacing.md },
  list: { gap: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: { flex: 1 },
  name: { ...typography.label, color: colors.text },
});
