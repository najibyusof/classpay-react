import { render } from '@testing-library/react-native';

import type { PaymentSchedule } from '../../types/student';
import { CurrentPaymentScreen } from './CurrentPaymentScreen';
import { PaymentScheduleDetailScreen } from './PaymentScheduleDetailScreen';

const schedule: PaymentSchedule = {
  allow_additional_infaq: false,
  class: { id: 1, name: 'Tajwid' },
  due_date: '2026-09-01',
  id: 1,
  payment_options: [],
  payment_status: 'overdue',
  period_end: '2026-09-30',
  period_start: '2026-09-01',
  required_amount: 80,
  status: 'overdue',
};

describe('payment schedule states', () => {
  it('renders an empty current schedule state', async () => {
    const screen = await render(
      <CurrentPaymentScreen
        error={null}
        isLoading={false}
        onRetry={jest.fn()}
        onSelectSchedule={jest.fn()}
        schedules={[]}
      />,
    );

    expect(screen.getByText('No current payment obligation')).toBeTruthy();
  });

  it('renders overdue schedules and keeps their payment action available', async () => {
    const screen = await render(
      <PaymentScheduleDetailScreen audience="student" onBack={jest.fn()} schedule={schedule} />,
    );

    expect(screen.getByText('overdue')).toBeTruthy();
    expect(screen.getByText('Pay now')).toBeTruthy();
  });

  it('renders a paid schedule as settled with no payment action', async () => {
    const screen = await render(
      <PaymentScheduleDetailScreen
        audience="student"
        onBack={jest.fn()}
        schedule={{ ...schedule, payment_status: 'paid', status: 'paid' }}
      />,
    );

    expect(screen.getByText('Payment settled')).toBeTruthy();
  });
});
