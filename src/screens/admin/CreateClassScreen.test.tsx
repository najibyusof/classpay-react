import { createClassSchema } from './CreateClassScreen';

describe('createClassSchema', () => {
  it('accepts a valid class payload with schedule and payment', () => {
    expect(
      createClassSchema.safeParse({
        dayOfWeek: '1',
        description: '',
        name: 'Quran Class',
        paymentAmount: '50.00',
        recurrenceType: 'weekly',
        startTime: '10:00',
        teacherName: 'Cikgu Ahmad',
      }).success,
    ).toBe(true);
  });

  it('requires name, teacher, and a valid payment amount', () => {
    expect(
      createClassSchema.safeParse({
        dayOfWeek: '1',
        description: '',
        name: '',
        paymentAmount: 'abc',
        recurrenceType: 'weekly',
        startTime: '10:00',
        teacherName: '',
      }).success,
    ).toBe(false);
  });
});
