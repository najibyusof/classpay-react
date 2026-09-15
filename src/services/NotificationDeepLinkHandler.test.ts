import { NotificationDeepLinkHandler } from './NotificationDeepLinkHandler';

describe('NotificationDeepLinkHandler', () => {
  it.each([
    ['payment.reminder', { screen: 'PaymentScheduleDetail', scheduleId: 3 }],
    ['payment.overdue', { screen: 'PaymentScheduleDetail', scheduleId: 3 }],
  ] as const)('routes %s to its schedule destination', (type, expected) => {
    expect(NotificationDeepLinkHandler.getDestination({ type, payment_schedule_id: 3 })).toEqual(
      expected,
    );
  });

  it.each(['payment.success', 'payment.failed', 'payment.pending'] as const)(
    'routes %s to its payment destination',
    (type) => {
      expect(NotificationDeepLinkHandler.getDestination({ type, payment_id: 8 })).toEqual({
        screen: 'PaymentDetail',
        paymentId: 8,
      });
    },
  );

  it('falls back to notifications when a trusted resource ID is absent', () => {
    expect(NotificationDeepLinkHandler.getDestination({ type: 'class.added' })).toEqual({
      screen: 'Notifications',
    });
  });
});
