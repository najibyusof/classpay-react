import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { Button, Card, EmptyState, ErrorState, Skeleton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { AdminClass } from '../../types/admin';

export function OrganizationClassesScreen({
  onBack,
  onAddClass,
  onSelectClass,
  organizationId,
  organizationName,
}: {
  onBack: () => void;
  onAddClass: () => void;
  onSelectClass: (classItem: AdminClass) => void;
  organizationId: number | string;
  organizationName: string;
}) {
  const classesQuery = useInfiniteQuery({
    queryKey: ['admin', 'organizations', organizationId, 'classes'],
    queryFn: ({ pageParam }) => adminApi.getOrganizationClasses(organizationId, pageParam),
    initialPageParam: 1,
    refetchOnMount: 'always',
    getNextPageParam: (lastPage) =>
      (lastPage.meta?.current_page ?? 1) < (lastPage.meta?.last_page ?? 1)
        ? (lastPage.meta?.current_page ?? 1) + 1
        : undefined,
  });
  const classes = classesQuery.data?.pages.flatMap((page) => page.data) ?? [];

  if (classesQuery.isLoading) return <Skeleton height={260} />;
  if (classesQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(classesQuery.error).message}
        onRetry={() => void classesQuery.refetch()}
      />
    );

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to organization details"
          accessibilityRole="button"
          hitSlop={spacing.sm}
          onPress={onBack}
          style={styles.headerButton}
        >
          <Ionicons color={colors.text} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Classes</Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {organizationName}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Add class"
          accessibilityRole="button"
          onPress={onAddClass}
          style={styles.addButton}
        >
          <Ionicons color={colors.onPrimary} name="add" size={17} />
          <Text style={styles.addLabel}>Add</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {classes.length === 0 ? (
          <EmptyState
            title="No classes found"
            description="This organization has no classes yet."
          />
        ) : (
          <View style={styles.list}>
            {classes.map((classItem) => (
              <ClassRow
                classItem={classItem}
                key={classItem.id}
                onPress={() => onSelectClass(classItem)}
              />
            ))}
            {classesQuery.hasNextPage ? (
              <Button
                disabled={classesQuery.isFetchingNextPage}
                label="Load more"
                loading={classesQuery.isFetchingNextPage}
                onPress={() => void classesQuery.fetchNextPage()}
                variant="outline"
              />
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ClassRow({ classItem, onPress }: { classItem: AdminClass; onPress: () => void }) {
  const status = classItem.status ?? 'Active';
  const participantCount = classItem.participants_count ?? classItem.students_count;
  const detail =
    participantCount === undefined ? 'Class details' : `${participantCount} participants`;

  return (
    <Card accessibilityLabel={`View ${classItem.name}`} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons color={colors.info} name="book" size={22} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.name}>
            {classItem.name}
          </Text>
          <Text numberOfLines={1} style={styles.detail}>
            {detail}
          </Text>
        </View>
        <View style={styles.trailing}>
          <View style={styles.status}>
            <Text style={styles.statusLabel}>{status}</Text>
          </View>
          <Ionicons color={colors.mutedText} name="chevron-forward" size={18} />
        </View>
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
    minHeight: 64,
    paddingHorizontal: spacing.md,
  },
  headerButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.info,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  addLabel: { ...typography.caption, color: colors.onPrimary, fontWeight: '700' },
  headerCopy: { alignItems: 'center', flex: 1, gap: spacing.xxs },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.caption, color: colors.mutedText, maxWidth: '90%' },
  container: { gap: spacing.md, padding: spacing.md },
  list: { gap: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: { flex: 1, gap: spacing.xxs },
  name: { ...typography.label, color: colors.text },
  detail: { ...typography.caption, color: colors.mutedText },
  trailing: { alignItems: 'flex-end', gap: spacing.xs },
  status: {
    backgroundColor: colors.successSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  statusLabel: { ...typography.caption, color: colors.success },
});
