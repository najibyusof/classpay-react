import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { adminApi } from '../../api/adminApi';
import { Button, Card, EmptyState, ErrorState, Skeleton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { AdminPerson } from '../../types/admin';

export function OrganizationStudentsScreen({
  onBack,
  organizationId,
  organizationName,
}: {
  onBack: () => void;
  organizationId: number | string;
  organizationName: string;
}) {
  const studentsQuery = useInfiniteQuery({
    queryKey: ['admin', 'organizations', organizationId, 'students'],
    queryFn: ({ pageParam }) => adminApi.getAdminStudents(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      (lastPage.meta?.current_page ?? 1) < (lastPage.meta?.last_page ?? 1)
        ? (lastPage.meta?.current_page ?? 1) + 1
        : undefined,
  });
  const students = studentsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  if (studentsQuery.isLoading) return <Skeleton height={260} />;
  if (studentsQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(studentsQuery.error).message}
        onRetry={() => void studentsQuery.refetch()}
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
          <Text style={styles.title}>Students</Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {organizationName}
          </Text>
        </View>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="This organization has no students yet."
          />
        ) : (
          <View style={styles.list}>
            {students.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
            {studentsQuery.hasNextPage ? (
              <Button
                disabled={studentsQuery.isFetchingNextPage}
                label="Load more"
                loading={studentsQuery.isFetchingNextPage}
                onPress={() => void studentsQuery.fetchNextPage()}
                variant="outline"
              />
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StudentRow({ student }: { student: AdminPerson }) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Ionicons color={colors.info} name="person" size={20} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.name}>
            {student.name}
          </Text>
          <Text numberOfLines={1} style={styles.phone}>
            {student.phone ?? '--'}
          </Text>
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
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: spacing.md,
  },
  headerButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  headerCopy: { flex: 1 },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.caption, color: colors.mutedText },
  container: { gap: spacing.md, padding: spacing.md },
  list: { gap: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: { flex: 1 },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  phone: { ...typography.caption, color: colors.mutedText },
});
