import { notifyPushDestination, registerPushDestinationHandler } from './pushNavigationEvents';

describe('push navigation events', () => {
  it('delivers a cold-start destination once a role navigator registers', () => {
    notifyPushDestination({ screen: 'PaymentScheduleDetail', scheduleId: 2 });
    const handler = jest.fn();

    registerPushDestinationHandler(handler);

    expect(handler).toHaveBeenCalledWith({ screen: 'PaymentScheduleDetail', scheduleId: 2 });
  });

  it('stops delivering events when a navigator unregisters', () => {
    const handler = jest.fn();
    const unregister = registerPushDestinationHandler(handler);
    unregister();

    notifyPushDestination({ screen: 'Notifications' });

    expect(handler).not.toHaveBeenCalled();
  });
});
