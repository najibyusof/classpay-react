import type { TextStyle } from 'react-native';

export const typography: Record<
  'display' | 'heading' | 'title' | 'body' | 'bodySmall' | 'label' | 'caption',
  TextStyle
> = {
  display: { fontSize: 30, fontWeight: '700', letterSpacing: 0, lineHeight: 38 },
  heading: { fontSize: 24, fontWeight: '700', letterSpacing: 0, lineHeight: 32 },
  title: { fontSize: 18, fontWeight: '600', letterSpacing: 0, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400', letterSpacing: 0, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', letterSpacing: 0, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', letterSpacing: 0, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0, lineHeight: 16 },
};
