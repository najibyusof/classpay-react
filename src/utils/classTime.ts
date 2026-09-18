export const classHourOptions = Array.from({ length: 12 }, (_, index) => {
  const hour = String(index + 1).padStart(2, '0');
  return { label: hour, value: hour };
});

export const classMinuteOptions = Array.from({ length: 60 }, (_, index) => {
  const minute = String(index).padStart(2, '0');
  return { label: minute, value: minute };
});

export const classPeriodOptions = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
] as const;

export function parseClassTime(value?: string | null) {
  if (!value) return { hour: '10', minute: '00', period: 'AM' as const };
  const [rawHour = '10', rawMinute = '00'] = value.split(':');
  const hour24 = Number(rawHour);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return {
    hour: String(hour12).padStart(2, '0'),
    minute: String(Number(rawMinute)).padStart(2, '0'),
    period: period as 'AM' | 'PM',
  };
}

export function toApiClassTime(hour: string, minute: string, period: 'AM' | 'PM') {
  let hour24 = Number(hour) % 12;
  if (period === 'PM') hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${String(Number(minute)).padStart(2, '0')}`;
}
