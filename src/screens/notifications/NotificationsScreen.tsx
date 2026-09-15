import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { notificationApi } from '../../api/notificationApi';
import {
  Button,
  Card,
  DateText,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  StatusBadge,
} from '../../components';
import { notificationQueryKeys } from '../../hooks/useNotifications';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import type { AppNotification, NotificationType } from '../../types/notification';
import { NotificationDetailScreen } from './NotificationDetailScreen';

type ReadFilter = 'all' | 'unread';
type TypeFilter = 'all' | NotificationType;

export function NotificationsScreen() {
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | string | null>(
    null,
  );
  const queryClient = useQueryClient();
  const notificationsQuery = useInfiniteQuery({
    queryKey: notificationQueryKeys.list,
    queryFn: ({ pageParam }) => notificationApi.getNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
  const markAllAsRead = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
  });
  const notifications = filterNotifications(
    notificationsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    readFilter,
    typeFilter,
  );

  if (selectedNotificationId !== null)
    return (
      <NotificationDetailScreen
        notificationId={selectedNotificationId}
        onBack={() => setSelectedNotificationId(null)}
      />
    );

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={() => void notificationsQuery.refetch()}
            refreshing={notificationsQuery.isRefetching}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Notifications</Text>
          <Button
            disabled={markAllAsRead.isPending}
            fullWidth={false}
            label="Read all"
            loading={markAllAsRead.isPending}
            onPress={() => markAllAsRead.mutate()}
            variant="outline"
          />
        </View>
        <Select
          label="Show"
          onValueChange={setReadFilter}
          options={readOptions}
          value={readFilter}
        />
        <Select
          label="Type"
          onValueChange={setTypeFilter}
          options={typeOptions}
          value={typeFilter}
        />
        {notificationsQuery.isLoading ? <NotificationLoadingState /> : null}
        {notificationsQuery.isError ? (
          <ErrorState
            message={toApiError(notificationsQuery.error).message}
            onRetry={() => void notificationsQuery.refetch()}
          />
        ) : null}
        {markAllAsRead.isError ? (
          <ErrorState message={toApiError(markAllAsRead.error).message} />
        ) : null}
        {!notificationsQuery.isLoading &&
        !notificationsQuery.isError &&
        notifications.length === 0 ? (
          <EmptyState
            title="No notifications found"
            description="Notifications matching the selected filters will appear here."
          />
        ) : null}
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => setSelectedNotificationId(notification.id)}
          />
        ))}
        {notificationsQuery.hasNextPage ? (
          <Button
            disabled={notificationsQuery.isFetchingNextPage}
            label="Load more"
            loading={notificationsQuery.isFetchingNextPage}
            onPress={() => void notificationsQuery.fetchNextPage()}
            variant="outline"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function filterNotifications(
  notifications: readonly AppNotification[],
  readFilter: ReadFilter,
  typeFilter: TypeFilter,
) {
  return notifications.filter(
    (notification) =>
      (readFilter === 'all' || notification.read_at === null) &&
      (typeFilter === 'all' || notification.type === typeFilter),
  );
}

function NotificationCard({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const isRead = notification.read_at !== null;
  return (
    <Card accessibilityLabel={`View notification ${notification.title}`} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, !isRead && styles.unread]}>{notification.title}</Text>
        <StatusBadge label={isRead ? 'Read' : 'Unread'} tone={isRead ? 'neutral' : 'info'} />
      </View>
      <Text numberOfLines={2} style={styles.message}>
        {notification.message}
      </Text>
      <DateText style={styles.date} value={notification.created_at} />
    </Card>
  );
}

function NotificationLoadingState() {
  return (
    <View style={styles.list}>
      <Skeleton height={96} />
      <Skeleton height={96} />
      <Skeleton height={96} />
    </View>
  );
}

const readOptions = [
  { label: 'All notifications', value: 'all' },
  { label: 'Unread only', value: 'unread' },
] as const;
const typeOptions = [
  { label: 'All types', value: 'all' },
  { label: 'Payment reminder', value: 'payment.reminder' },
  { label: 'Payment success', value: 'payment.success' },
  { label: 'Payment failed', value: 'payment.failed' },
  { label: 'Payment overdue', value: 'payment.overdue' },
  { label: 'Payment pending', value: 'payment.pending' },
  { label: 'Class added', value: 'class.added' },
  { label: 'Class removed', value: 'class.removed' },
  { label: 'System notification', value: 'system.notification' },
] as const;

const styles = StyleSheet.create({
  flex: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.md, padding: spacing.md },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.heading, color: colors.text },
  list: { gap: spacing.sm },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cardTitle: { ...typography.label, color: colors.text, flex: 1 },
  unread: { fontWeight: '700' },
  message: { ...typography.bodySmall, color: colors.mutedText, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.mutedText, marginTop: spacing.sm },
});
