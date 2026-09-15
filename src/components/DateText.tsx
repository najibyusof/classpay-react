import { Text } from 'react-native';

import type { ComponentProps } from 'react';

import { formatDateOnly } from '../utils/date';

type NativeTextProps = ComponentProps<typeof Text>;

interface DateTextProps extends Omit<NativeTextProps, 'children'> {
  value: Date | string | number;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

export function DateText({ value, locale = 'en-MY', options, ...props }: DateTextProps) {
  const date = value instanceof Date ? value : new Date(value);
  const formattedValue = options
    ? Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(locale, options).format(date)
    : formatDateOnly(value);
  return <Text {...props}>{formattedValue}</Text>;
}
