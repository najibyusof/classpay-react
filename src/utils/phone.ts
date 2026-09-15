export function normalizeMalaysianPhoneNumber(phone: string): string | null {
  const digits = phone.replace(/[\s()-]/g, '').replace(/^\+/, '');
  const nationalNumber = digits.startsWith('0') ? `60${digits.slice(1)}` : digits;

  if (!/^601\d{7,9}$/.test(nationalNumber)) {
    return null;
  }

  return `+${nationalNumber}`;
}
