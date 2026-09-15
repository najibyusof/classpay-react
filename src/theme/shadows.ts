import type { ViewStyle } from 'react-native';

export const shadows: Record<'sm' | 'md', ViewStyle> = {
  sm: {
    elevation: 2,
    shadowColor: '#17261F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  md: {
    elevation: 5,
    shadowColor: '#17261F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
};
