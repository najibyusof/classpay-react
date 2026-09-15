import { formatDateOnly } from './date';

describe('formatDateOnly', () => {
  it('formats ISO timestamps as YYYY-MM-DD without timezone conversion', () => {
    expect(formatDateOnly('2026-09-01T00:00:00.000000Z')).toBe('2026-09-01');
  });

  it('formats Date values as YYYY-MM-DD', () => {
    expect(formatDateOnly(new Date(2026, 8, 14))).toBe('2026-09-14');
  });
});
