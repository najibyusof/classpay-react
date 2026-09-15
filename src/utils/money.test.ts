import { formatCurrency, isDecimalWithinRange, normalizeDecimal } from './money';

describe('money helpers', () => {
  it('normalizes decimal strings without floating-point arithmetic', () => {
    expect(normalizeDecimal('00020.50')).toBe('20.50');
    expect(normalizeDecimal('20.123')).toBeNull();
  });

  it('validates inclusive infaq boundaries using minor units', () => {
    expect(isDecimalWithinRange('20.10', '20.10', '20.20')).toBe(true);
    expect(isDecimalWithinRange('20.09', '20.10', '20.20')).toBe(false);
    expect(isDecimalWithinRange('20.21', '20.10', '20.20')).toBe(false);
  });

  it('formats canonical decimal values without converting them to floats', () => {
    expect(formatCurrency('1234567.8', 'MYR')).toBe('MYR 1,234,567.80');
  });
});
