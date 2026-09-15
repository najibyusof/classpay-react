import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { notificationApi } from '../../api/notificationApi';
import { Button, ErrorState, LoadingState, StatusBadge } from '../../components';
import { notificationQueryKeys } from '../../hooks/useNotifications';
import { colors, spacing, typography } from '../../theme';
import { toApiError } from '../../types/api';
import { DateText } from '../../components/DateText';
import type { InfiniteData } from '@tanstack/react-query';
import type { AppNotification } from '../../types/notification';
import type { PaginatedResponse } from '../../types/student';

interface NotificationDetailScreenProps {
  notificationId: number | string;
  onBack: () => void;
}

export function NotificationDetailScreen({
  notificationId,
  onBack,
}: NotificationDetailScreenProps) {
  const queryClient = useQueryClient();
  const notificationQuery = useQuery({
    queryKey: [...notificationQueryKeys.all, notificationId],
    queryFn: () => notificationApi.getNotification(notificationId),
  });
  const updateReadState = useMutation({
    mutationFn: (markAsRead: boolean) =>
      markAsRead
        ? notificationApi.markAsRead(notificationId)
        : notificationApi.markAsUnread(notificationId),
    onMutate: async (markAsRead) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.list });
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.unreadCount });
      const previousList = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<AppNotification>>
      >(notificationQueryKeys.list);
      const previousDetail = queryClient.getQueryData<AppNotification>([
        ...notificationQueryKeys.all,
        notificationId,
      ]);
      const previousUnreadCount = queryClient.getQueryData<number>(
        notificationQueryKeys.unreadCount,
      );
      const readAt = markAsRead ? new Date().toISOString() : null;
      queryClient.setQueryData<AppNotification>(
        [...notificationQueryKeys.all, notificationId],
        (current) => (current ? { ...current, read_at: readAt } : current),
      );
      queryClient.setQueryData<InfiniteData<PaginatedResponse<AppNotification>>>(
        notificationQueryKeys.list,
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  data: page.data.map((item) =>
                    item.id === notificationId ? { ...item, read_at: readAt } : item,
                  ),
                })),
              }
            : current,
      );
      if (previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          notificationQueryKeys.unreadCount,
          Math.max(0, previousUnreadCount + (markAsRead ? -1 : 1)),
        );
      }
      return { previousDetail, previousList, previousUnreadCount };
    },
    onError: (_error, _markAsRead, context) => {
      if (!context) return;
      queryClient.setQueryData(
        [...notificationQueryKeys.all, notificationId],
        context.previousDetail,
      );
      queryClient.setQueryData(notificationQueryKeys.list, context.previousList);
      queryClient.setQueryData(notificationQueryKeys.unreadCount, context.previousUnreadCount);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
    },
  });

  if (notificationQuery.isLoading) return <LoadingState label="Loading notification..." />;
  if (notificationQuery.isError) {
    return (
      <ErrorState
        message={toApiError(notificationQuery.error).message}
        onRetry={() => void notificationQuery.refetch()}
      />
    );
  }
  if (!notificationQuery.data) return null;

  const notification = notificationQuery.data;
  const isRead = notification.read_at !== null;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button fullWidth={false} label="Back to notifications" onPress={onBack} variant="ghost" />
      <View style={styles.header}>
        <Text style={styles.title}>{notification.title}</Text>
        <StatusBadge label={isRead ? 'Read' : 'Unread'} tone={isRead ? 'neutral' : 'info'} />
      </View>
      <Text style={styles.type}>{notification.type.replace('.', ' ')}</Text>
      <Text style={styles.message}>{notification.message}</Text>
      <DateText style={styles.date} value={notification.created_at} />
      {updateReadState.isError ? (
        <ErrorState message={toApiError(updateReadState.error).message} />
      ) : null}
      <Button
        disabled={updateReadState.isPending}
        label={isRead ? 'Mark as unread' : 'Mark as read'}
        loading={updateReadState.isPending}
        onPress={() => updateReadState.mutate(!isRead)}
        variant="outline"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  title: { ...typography.heading, color: colors.text, flex: 1 },
  type: { ...typography.caption, color: colors.primary, textTransform: 'capitalize' },
  message: { ...typography.body, color: colors.text },
  date: { ...typography.bodySmall, color: colors.mutedText },
});
