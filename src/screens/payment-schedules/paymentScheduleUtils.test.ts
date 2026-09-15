import { filterPaymentSchedules } from './paymentScheduleUtils';

const schedules = [
  {
    class: { id: 1, name: 'Tajwid' },
    due_date: '2026-09-20',
    id: 1,
    payment_options: [],
    payment_status: 'pending',
    period_end: '2026-09-30',
    period_start: '2026-09-01',
    required_amount: 80,
    status: 'upcoming',
  },
  {
    class: { id: 2, name: 'Fiqh' },
    due_date: '2026-09-01',
    id: 2,
    payment_options: [],
    payment_status: 'overdue',
    period_end: '2026-08-31',
    period_start: '2026-08-01',
    required_amount: 90,
    status: 'overdue',
  },
];

describe('filterPaymentSchedules', () => {
  it('filters server-returned schedules by payment schedule status', () => {
    expect(filterPaymentSchedules(schedules, 'overdue', 'all')).toEqual([schedules[1]]);
  });

  it('filters server-returned schedules by their class resource ID', () => {
    expect(filterPaymentSchedules(schedules, 'all', '1')).toEqual([schedules[0]]);
  });
});
