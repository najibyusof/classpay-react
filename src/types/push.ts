import type { NotificationType } from './notification';

export interface PushNotificationPayload {
  type?: NotificationType | string;
  notification_id?: number | string;
  payment_schedule_id?: number | string;
  payment_id?: number | string;
}

export type PushDestination =
  | { screen: 'Notifications' }
  | { screen: 'PaymentScheduleDetail'; scheduleId: number | string }
  | { screen: 'PaymentDetail'; paymentId: number | string };

export interface DeviceToken {
  platform: 'android' | 'ios';
  value: string;
}
