import { parseClassTime, toApiClassTime } from './classTime';

describe('class time conversion', () => {
  it.each([
    ['01:05', '01', '05', 'AM'],
    ['12:05', '12', '05', 'PM'],
    ['13:05', '01', '05', 'PM'],
    ['00:05', '12', '05', 'AM'],
  ])('parses %s into %s:%s %s', (apiTime, hour, minute, period) => {
    expect(parseClassTime(apiTime)).toEqual({ hour, minute, period });
  });

  it.each([
    ['01', '05', 'AM', '01:05'],
    ['12', '05', 'AM', '00:05'],
    ['12', '05', 'PM', '12:05'],
    ['01', '05', 'PM', '13:05'],
  ])('converts %s:%s %s to %s', (hour, minute, period, apiTime) => {
    expect(toApiClassTime(hour, minute, period as 'AM' | 'PM')).toBe(apiTime);
  });
});