import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { studentApi } from '../../api/studentApi';
import { Button, Card, EmptyState, ErrorState, Skeleton } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';
import { normalizeApiError } from '../../types/api';
import type { StudentClass } from '../../types/student';
import { ClassDetailScreen } from './ClassDetailScreen';

export function StudentClassesScreen() {
  const [selectedClass, setSelectedClass] = useState<StudentClass | null>(null);
  const classesQuery = useInfiniteQuery({
    queryKey: ['student', 'classes'],
    queryFn: ({ pageParam }) => studentApi.getMyClasses(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      (lastPage.meta?.current_page ?? 1) < (lastPage.meta?.last_page ?? 1)
        ? (lastPage.meta?.current_page ?? 1) + 1
        : undefined,
  });
  const classes = classesQuery.data?.pages.flatMap((page) => page.data) ?? [];

  if (selectedClass)
    return (
      <ClassDetailScreen classItem={selectedClass} onBack={() => setSelectedClass(null)} />
    );

  if (classesQuery.isLoading)
    return (
      <View style={styles.loading}>
        <Skeleton height={72} />
        <Skeleton height={72} />
      </View>
    );
  if (classesQuery.isError)
    return (
      <ErrorState
        message={normalizeApiError(classesQuery.error).message}
        onRetry={() => void classesQuery.refetch()}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {classes.length === 0 ? (
        <EmptyState title="Tiada kelas" description="Kelas anda akan dipaparkan di sini." />
      ) : (
        <View style={styles.list}>
          {classes.map((classItem) => (
            <ClassRow
              classItem={classItem}
              key={classItem.id}
              onPress={() => setSelectedClass(classItem)}
            />
          ))}
          {classesQuery.hasNextPage ? (
            <Button
              disabled={classesQuery.isFetchingNextPage}
              label="Lihat lagi"
              loading={classesQuery.isFetchingNextPage}
              onPress={() => void classesQuery.fetchNextPage()}
              variant="outline"
            />
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

function ClassRow({
  classItem,
  onPress,
}: {
  classItem: StudentClass;
  onPress: () => void;
}) {
  const dayTime = [dayName(classItem.day_of_week), formatTime(classItem.start_time)]
    .filter(Boolean)
    .join(', ');
  return (
    <Card accessibilityLabel={`Lihat ${classItem.name}`} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons color={colors.info} name="book" size={20} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.name}>
            {classItem.name}
          </Text>
          {classItem.teacher_name ? (
            <Text numberOfLines={1} style={styles.detail}>
              {classItem.teacher_name}
            </Text>
          ) : null}
          {dayTime ? (
            <Text numberOfLines={1} style={styles.detail}>
              {dayTime}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

function dayName(dayOfWeek?: number) {
  if (dayOfWeek === undefined) return undefined;
  return ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'][dayOfWeek];
}

function formatTime(value?: string | null) {
  if (!value) return undefined;
  const [hour = 0, minute = 0] = value.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

const styles = StyleSheet.create({
  loading: { gap: spacing.sm, padding: spacing.md },
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
  detail: { ...typography.caption, color: colors.mutedText, marginTop: spacing.xxs },
});
