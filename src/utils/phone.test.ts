import { normalizeMalaysianPhoneNumber } from './phone';

describe('normalizeMalaysianPhoneNumber', () => {
  it.each([
    ['0123456789', '+60123456789'],
    ['60123456789', '+60123456789'],
    ['+60123456789', '+60123456789'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeMalaysianPhoneNumber(input)).toBe(expected);
  });

  it('rejects invalid phone numbers', () => {
    expect(normalizeMalaysianPhoneNumber('12345')).toBeNull();
  });
});
