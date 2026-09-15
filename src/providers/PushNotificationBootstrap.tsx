import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { notificationQueryKeys } from '../hooks/useNotifications';
import { notifyPushDestination } from '../services/pushNavigationEvents';
import { isRunningInExpoGo, isRunningOnWeb } from '../utils/runtime';

export function PushNotificationBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isRunningInExpoGo || isRunningOnWeb) return;

    let unsubscribe: (() => void) | undefined;
    void import('../services/PushNotificationService').then(({ PushNotificationService }) => {
      void PushNotificationService.initialize({
        onNotificationReceived: () => {
          void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
          void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });
        },
        onNotificationResponse: notifyPushDestination,
      }).then((cleanup) => {
        unsubscribe = cleanup;
      });
    });
    return () => unsubscribe?.();
  }, [queryClient]);

  return null;
}
