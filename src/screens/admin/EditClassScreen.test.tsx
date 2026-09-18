import { editClassSchema } from './EditClassScreen';

describe('editClassSchema', () => {
  it('accepts documented class update fields with schedule and payment', () => {
    expect(
      editClassSchema.safeParse({
        bankAccountName: 'Padat Education',
        bankAccountNumber: '1234567890',
        bankName: 'Maybank',
        dayOfWeek: '1',
        description: 'Updated weekly SPM Physics class',
        name: 'Form 5 Advanced Physics',
        paymentAmount: '50.00',
        recurrenceType: 'weekly',
        startTime: '10:00',
        status: 'active',
        teacherName: 'Cikgu Ahmad',
      }).success,
    ).toBe(true);
  });

  it('rejects an invalid payment amount', () => {
    expect(
      editClassSchema.safeParse({
        bankAccountName: '',
        bankAccountNumber: '',
        bankName: '',
        description: '',
        name: 'Physics',
        paymentAmount: 'abc',
        status: 'draft',
        teacherName: '',
      }).success,
    ).toBe(false);
  });
});
