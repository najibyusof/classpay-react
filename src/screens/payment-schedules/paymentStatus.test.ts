import { getPaymentResultScreen } from './paymentStatus';

describe('getPaymentResultScreen', () => {
  it.each([
    ['initiated', 'processing'],
    ['pending', 'pending'],
    ['paid', 'success'],
    ['failed', 'failed'],
    ['refunded', 'pending'],
  ] as const)('routes backend %s status to the %s screen', (status, screen) => {
    expect(getPaymentResultScreen(status)).toBe(screen);
  });

  it('does not treat an unknown status as payment success', () => {
    expect(getPaymentResultScreen('awaiting_settlement')).toBe('pending');
  });
});
