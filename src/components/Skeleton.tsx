import type { DimensionValue, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  return (
    <View
      accessibilityLabel="Loading content"
      style={[styles.skeleton, { borderRadius, height, width }, style]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: colors.surfaceSubtle },
});
