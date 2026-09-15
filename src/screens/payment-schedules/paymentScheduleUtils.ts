import type { PaymentSchedule } from '../../types/student';

export type PaymentScheduleFilterStatus =
  'all' | 'upcoming' | 'pending' | 'partially_paid' | 'overdue' | 'paid' | 'cancelled';

export function getScheduleClassName(schedule: PaymentSchedule): string {
  return typeof schedule.class === 'string'
    ? schedule.class
    : (schedule.class?.name ?? 'Class unavailable');
}

export function filterPaymentSchedules(
  schedules: readonly PaymentSchedule[],
  status: PaymentScheduleFilterStatus,
  classId: string,
): PaymentSchedule[] {
  return schedules.filter((schedule) => {
    const matchesStatus = status === 'all' || schedule.status.toLowerCase() === status;
    const matchesClass =
      classId === 'all' ||
      String(schedule.class && typeof schedule.class !== 'string' ? schedule.class.id : '') ===
        classId;
    return matchesStatus && matchesClass;
  });
}
