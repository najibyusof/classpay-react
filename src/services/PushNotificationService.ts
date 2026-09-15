import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import type { PushDestination, PushNotificationPayload } from '../types/push';
import { NotificationDeepLinkHandler } from './NotificationDeepLinkHandler';

const BACKGROUND_NOTIFICATION_TASK = 'classpay-background-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  BACKGROUND_NOTIFICATION_TASK,
  async () => {
    return Notifications.BackgroundNotificationTaskResult.NoData;
  },
);

export interface PushNotificationCallbacks {
  onNotificationReceived?: (payload: PushNotificationPayload) => void;
  onNotificationResponse?: (destination: PushDestination) => void;
}

export const PushNotificationService = {
  initialize: async (callbacks: PushNotificationCallbacks): Promise<() => void> => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('classpay-payments', {
        importance: Notifications.AndroidImportance.DEFAULT,
        name: 'Payments',
      });
    }

    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      callbacks.onNotificationReceived?.(
        notification.request.content.data as PushNotificationPayload,
      );
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        callbacks.onNotificationResponse?.(
          NotificationDeepLinkHandler.getDestination(
            response.notification.request.content.data as PushNotificationPayload,
          ),
        );
      },
    );
    const lastResponse = await Notifications.getLastNotificationResponseAsync();
    if (lastResponse) {
      callbacks.onNotificationResponse?.(
        NotificationDeepLinkHandler.getDestination(
          lastResponse.notification.request.content.data as PushNotificationPayload,
        ),
      );
      await Notifications.clearLastNotificationResponseAsync();
    }

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  },
};

export { BACKGROUND_NOTIFICATION_TASK };
