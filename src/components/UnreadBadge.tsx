import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '../theme';

interface UnreadBadgeProps {
  count: number;
}

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <View accessibilityLabel={`${count} unread notifications`} style={styles.badge}>
      <Text style={styles.label}>{count > 99 ? '99+' : String(count)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 16,
    minWidth: 16,
    paddingHorizontal: 4,
  },
  label: { ...typography.caption, color: colors.onPrimary, fontSize: 10, lineHeight: 12 },
});
