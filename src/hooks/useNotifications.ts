import { useQuery } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  list: ['notifications', 'list'] as const,
};

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: notificationApi.getUnreadCount,
    staleTime: 30_000,
  });
}
