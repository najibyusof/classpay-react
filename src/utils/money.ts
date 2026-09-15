export type MonetaryValue = number | string;

export function formatCurrency(value: MonetaryValue, currency = 'MYR'): string {
  const decimal = normalizeDecimal(value) ?? '0';
  const [whole = '0', fractional = ''] = decimal.split('.');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${groupedWhole}.${fractional.padEnd(2, '0')}`;
}

export function normalizeDecimal(value: MonetaryValue): string | null {
  const decimal = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(decimal)) return null;
  const [whole = '0', fractional] = decimal.split('.');
  return `${whole.replace(/^0+(?=\d)/, '') || '0'}${fractional ? `.${fractional}` : ''}`;
}

export function isDecimalWithinRange(
  value: MonetaryValue,
  minimum?: MonetaryValue | null,
  maximum?: MonetaryValue | null,
): boolean {
  const amount = toMinorUnits(value);
  const minimumAmount = minimum === null || minimum === undefined ? null : toMinorUnits(minimum);
  const maximumAmount = maximum === null || maximum === undefined ? null : toMinorUnits(maximum);
  return (
    amount !== null &&
    (minimumAmount === null || amount >= minimumAmount) &&
    (maximumAmount === null || amount <= maximumAmount)
  );
}

function toMinorUnits(value: MonetaryValue): bigint | null {
  const decimal = normalizeDecimal(value);
  if (!decimal) return null;
  const [whole = '0', fractional = ''] = decimal.split('.');
  return BigInt(whole) * 100n + BigInt(fractional.padEnd(2, '0'));
}
