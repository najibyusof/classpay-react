import type { SponsorPaymentSchedule, SponsoredStudent } from '../../types/sponsor';

export function getSponsoredStudents(
  schedules: readonly SponsorPaymentSchedule[],
): SponsoredStudent[] {
  const students = new Map<string, SponsoredStudent>();
  schedules.forEach((schedule) => {
    if (schedule.student) students.set(String(schedule.student.id), schedule.student);
  });
  return [...students.values()].sort((first, second) => first.name.localeCompare(second.name));
}

export function filterSchedulesByStudent(
  schedules: readonly SponsorPaymentSchedule[],
  studentId: string,
): SponsorPaymentSchedule[] {
  if (studentId === 'all') return [...schedules];
  return schedules.filter((schedule) => String(schedule.student?.id) === studentId);
}

export function getScheduleSummary(schedules: readonly SponsorPaymentSchedule[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    outstanding: schedules.filter((schedule) => !isPaid(schedule.payment_status)).length,
    overdue: schedules.filter(
      (schedule) => !isPaid(schedule.payment_status) && schedule.due_date < today,
    ).length,
    upcoming: schedules.filter(
      (schedule) => !isPaid(schedule.payment_status) && schedule.due_date >= today,
    ).length,
  };
}

function isPaid(status: string | null | undefined): boolean {
  const normalizedStatus = status?.toLowerCase() ?? '';
  return normalizedStatus === 'paid' || normalizedStatus === 'completed';
}
