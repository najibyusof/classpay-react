import type { PushDestination, PushNotificationPayload } from '../types/push';

export const NotificationDeepLinkHandler = {
  getDestination: (payload: PushNotificationPayload): PushDestination => {
    switch (payload.type) {
      case 'payment.reminder':
      case 'payment.overdue':
        return payload.payment_schedule_id === undefined
          ? { screen: 'Notifications' }
          : { screen: 'PaymentScheduleDetail', scheduleId: payload.payment_schedule_id };
      case 'payment.success':
      case 'payment.failed':
      case 'payment.pending':
        return payload.payment_id === undefined
          ? { screen: 'Notifications' }
          : { screen: 'PaymentDetail', paymentId: payload.payment_id };
      default:
        return { screen: 'Notifications' };
    }
  },
};
