import { createClassSchema } from './CreateClassScreen';

describe('createClassSchema', () => {
  it('accepts a valid class payload with schedule and payment', () => {
    expect(
      createClassSchema.safeParse({
        bankAccountName: 'Padat Education',
        bankAccountNumber: '1234567890',
        bankName: 'Maybank',
        dayOfWeek: '1',
        description: '',
        name: 'Quran Class',
        paymentAmount: '50.00',
        recurrenceType: 'weekly',
        startHour: '10',
        startMinute: '00',
        startPeriod: 'AM',
        teacherName: 'Cikgu Ahmad',
      }).success,
    ).toBe(true);
  });

  it('requires name, teacher, and a valid payment amount', () => {
    expect(
      createClassSchema.safeParse({
        bankAccountName: '',
        bankAccountNumber: '',
        bankName: '',
        dayOfWeek: '1',
        description: '',
        name: '',
        paymentAmount: 'abc',
        recurrenceType: 'weekly',
        startHour: '10',
        startMinute: '00',
        startPeriod: 'AM',
        teacherName: '',
      }).success,
    ).toBe(false);
  });
});
